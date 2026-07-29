import { Metadata } from 'next';

import Container from '@/components/layout/Container';
import AccountClient from '@/components/account/AccountClient';

export const metadata: Metadata = {
  title: 'Account | RailLens',
  robots: { index: false, follow: true },
};

export default function AccountPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-800 py-12">
      <Container>
        <AccountClient />
      </Container>
    </div>
  );
}
