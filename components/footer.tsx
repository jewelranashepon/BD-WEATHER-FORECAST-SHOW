import Link from "next/link";
import { Cloud, Facebook, Twitter, Linkedin, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background py-10">
      <div className="container px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Column 1: Logo & Description */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold text-foreground">
              BD Weather
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            BD Weather offers real-time, hyperlocal weather updates,
            visualizations, and forecasts to help you stay informed and prepared
            across all 64 districts of Bangladesh.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide">
            Quick Links
          </h3>
          <nav className="flex flex-col gap-3 text-sm text-muted-foreground">
            <FooterLink href="/features" label="Features" />
            <FooterLink href="/about" label="About Us" />
            <FooterLink href="/data-sources" label="Data Sources" />
            <FooterLink href="/contact" label="Contact" />
          </nav>
        </div>

        {/* Column 3: Social Media */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4 tracking-wide">
            Connect With Us
          </h3>
          <div className="flex gap-4 text-muted-foreground">
            <FooterIcon
              href="https://facebook.com"
              icon={<Facebook className="h-5 w-5" />}
              label="Facebook"
            />
            <FooterIcon
              href="https://twitter.com"
              icon={<Twitter className="h-5 w-5" />}
              label="Twitter"
            />
            <FooterIcon
              href="https://linkedin.com"
              icon={<Linkedin className="h-5 w-5" />}
              label="LinkedIn"
            />
            <FooterIcon
              href="mailto:support@bdweather.com"
              icon={<Mail className="h-5 w-5" />}
              label="Email"
            />
            <FooterIcon
              href="https://github.com"
              icon={<Github className="h-5 w-5" />}
              label="GitHub"
            />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-10 border-t pt-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} BD Weather. All rights reserved.
      </div>
    </footer>
  );
}

// Reusable link component
function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="hover:text-primary transition-colors duration-200"
    >
      {label}
    </Link>
  );
}

// Reusable social icon component
function FooterIcon({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      target="_blank"
      rel="noopener noreferrer"
      className="hover:text-primary transition-colors duration-200"
    >
      {icon}
    </Link>
  );
}
