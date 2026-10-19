import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header className="site-header">
      <Link href="/" aria-label="BMI Housing Society home">
        <Logo />
      </Link>
      <nav>
        <Link href="/projects">Projects</Link>
        <Link href="/login" className="nav-ghost">
          Sign in
        </Link>
        <Link href="/register" className="btn btn-small">
          Register
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="survey-rule" aria-hidden="true" />
      <p>
        © BMI Housing Society · Project details shown here are <strong>sample content</strong> for design review.
      </p>
    </footer>
  );
}
