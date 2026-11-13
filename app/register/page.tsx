import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import RegisterForm from '@/components/auth/RegisterForm';
import RailOpsWaker from '@/components/RailOpsWaker';
import { loginProvider } from '@/lib/loginProvider';
export const metadata: Metadata = {
  title: 'Register | RailLens',
  robots: { index: false, follow: true },
};
export default function RegisterPage() {
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        {loginProvider() === 'railops' && <RailOpsWaker />}
        <RegisterForm />
      </Container>
    </div>
  );
}
