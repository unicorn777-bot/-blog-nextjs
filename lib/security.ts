/**
 * 安全工具函数
 * 用于防止 XSS、过滤危险内容等
 */

// 危险 HTML 标签白名单
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'del',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img'
];

// 危险属性黑名单
const DANGEROUS_ATTRS = [
  'onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur',
  'onkeydown', 'onkeyup', 'onkeypress', 'onsubmit', 'onchange',
  'ondblclick', 'oncontextmenu', 'onwheel', 'ondrag', 'ondrop'
];

// XSS 危险模式
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /<input/gi,
  /<button/gi,
  /<style/gi,
  /<link/gi,
  /<meta/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /-moz-binding/gi,
];

/**
 * 转义 HTML 特殊字符
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * 清理用户输入，移除潜在的 XSS 攻击代码
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  let sanitized = input;
  
  // 移除危险的 HTML 标签和属性
  XSS_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // 移除危险属性
  DANGEROUS_ATTRS.forEach(attr => {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized.trim();
}

/**
 * 清理评论内容 - 完全转义 HTML
 */
export function sanitizeComment(content: string): string {
  if (!content) return '';
  
  // 完全转义 HTML，防止 XSS
  return escapeHtml(content);
}

/**
 * 清理 URL，只允许安全协议
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim().toLowerCase();
  
  // 只允许 http, https, mailto 协议
  const safeProtocols = ['http://', 'https://', 'mailto:', '/', '#'];
  const isSafe = safeProtocols.some(protocol => trimmed.startsWith(protocol)) ||
                 !trimmed.includes(':'); // 相对路径
  
  if (!isSafe) {
    return ''; // 返回空字符串拒绝危险 URL
  }
  
  return url.trim();
}

/**
 * 清理文件名，防止路径遍历攻击
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return '';
  
  return filename
    .replace(/\.\./g, '') // 移除路径遍历
    .replace(/[\/\\]/g, '_') // 替换路径分隔符
    .replace(/[<>:"|?*]/g, '_') // 替换非法字符
    .replace(/\s+/g, '_') // 替换空格
    .substring(0, 255); // 限制长度
}

/**
 * 验证密码强度
 * 要求：至少12位，包含大小写字母、数字和特殊字符
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message: string;
} {
  if (password.length < 12) {
    return { valid: false, message: '密码长度至少12位' };
  }
  
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }
  
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }
  
  if (!/\d/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  
  if (!/[@$!%*?&]/.test(password)) {
    return { valid: false, message: '密码必须包含特殊字符 (@$!%*?)' };
  }
  
  return { valid: true, message: '密码强度符合要求' };
}

/**
 * 生成安全的随机令牌
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
}

/**
 * 验证邮箱格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 速率限制器（内存版本，生产环境应使用 Redis）
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // 定期清理过期记录
    setInterval(() => this.cleanup(), windowMs);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // 获取该标识符的请求记录
    let timestamps = this.requests.get(identifier) || [];
    
    // 过滤掉过期的请求
    timestamps = timestamps.filter(time => time > windowStart);
    
    const remaining = this.maxRequests - timestamps.length;
    const resetTime = timestamps.length > 0 ? timestamps[0] + this.windowMs : now + this.windowMs;
    
    if (timestamps.length >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime };
    }
    
    // 记录新请求
    timestamps.push(now);
    this.requests.set(identifier, timestamps);
    
    return { allowed: true, remaining: remaining - 1, resetTime };
  }

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    this.requests.forEach((timestamps, key) => {
      const filtered = timestamps.filter(time => time > windowStart);
      if (filtered.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, filtered);
      }
    });
  }
}

// 创建全局速率限制器实例
export const commentRateLimiter = new RateLimiter(60000, 5); // 每分钟最多5条评论
export const loginRateLimiter = new RateLimiter(900000, 10); // 每15分钟最多10次登录尝试
