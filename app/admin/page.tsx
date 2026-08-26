import Container from '@/components/layout/Container';
import AdminDashboard from '@/components/admin/AdminDashboard';
export default function AdminPage() {
  return (
    <div className="bg-slate-50 py-8 dark:bg-slate-800">
      <Container>
        <AdminDashboard />
      </Container>
    </div>
  );
}
