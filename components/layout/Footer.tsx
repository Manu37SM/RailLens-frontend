import Link from 'next/link';

import Container from '@/components/layout/Container';

// The Navbar is already tight on space (Home/Favorites/History/Saved/Auth/
// Theme, icon-only below `sm:`) - rather than crowd it further, lower-
// traffic links (Developers/Statistics) live down here instead, the same
// place M-Indicator and IndianRailInfo put their equivalent secondary
// navigation.
const links = [
  { label: 'Statistics', href: '/stats' },
  { label: 'Developers', href: '/developers' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <Container>
        <div className="flex flex-col items-center justify-between gap-3 py-6 text-sm text-muted sm:flex-row">
          <p>&copy; {new Date().getFullYear()} RailLens. Not affiliated with Indian Railways.</p>

          <nav aria-label="Footer" className="flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
