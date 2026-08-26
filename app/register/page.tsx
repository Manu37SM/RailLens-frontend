import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import RegisterForm from '@/components/auth/RegisterForm';
export const metadata: Metadata = {
  title: 'Register | RailLens',
  robots: { index: false, follow: true },
};
export default function RegisterPage() {
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        <RegisterForm />
      </Container>
    </div>
  );
}
