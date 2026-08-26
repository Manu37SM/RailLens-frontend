import Link from 'next/link';
import Container from '@/components/layout/Container';
const links = [
  { label: 'Statistics', href: '/stats' },
  { label: 'Developers', href: '/developers' },
];
export default function Footer() {
  return (
    <footer className="border-border bg-background border-t print:hidden">
      <Container>
        <div className="text-muted flex flex-col items-center justify-between gap-3 py-6 text-sm sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} RailLens. Not affiliated with
            Indian Railways.
          </p>

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
