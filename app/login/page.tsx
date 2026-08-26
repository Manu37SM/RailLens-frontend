import { Metadata } from 'next';
import Container from '@/components/layout/Container';
import LoginForm from '@/components/auth/LoginForm';
export const metadata: Metadata = {
  title: 'Log In | RailLens',
  robots: { index: false, follow: true },
};
export default function LoginPage() {
  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-800">
      <Container>
        <LoginForm />
      </Container>
    </div>
  );
}
