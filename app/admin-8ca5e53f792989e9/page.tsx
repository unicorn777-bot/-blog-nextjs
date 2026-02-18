import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin-8ca5e53f792989e9/AdminDashboard';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/admin-8ca5e53f792989e9/login');
  }

  return <AdminDashboard />;
}