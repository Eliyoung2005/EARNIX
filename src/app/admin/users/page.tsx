import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import UserSearch from "./UserSearch";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login');
  }

  const role = (session.user as any).role;

  if (role !== 'ADMIN' && role !== 'SUB_ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>User Management</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Search and manage platform users.</p>
      
      <UserSearch viewerRole={role} />
    </div>
  );
}
