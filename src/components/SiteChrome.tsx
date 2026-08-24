import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Linkedin, Mail, Phone, Menu, X, ArrowUpRight } from 'lucide-react';
import RippleMesh from './RippleMesh';

// ─── Shared site data ─────────────────────────────────────────────────────────

export const NAV_LINKS = [
  { to: '/home', label: 'Home' },
  { to: '/downloadsPage', label: 'Portfolio' },
  { to: '/competencesPage', label: 'Skills' },
  { to: '/loisirs', label: 'Interests' },
  { to: '/rocketDemo', label: 'LQR Demo' },
];

export const CONTACT = {
  email: 'ali.abouelazz@gmail.com',
  phone: '+33 7 77 45 16 29',
  phoneHref: 'tel:+33777451629',
  linkedin: 'https://www.linkedin.com/in/ali-abouelazz-a00197220',
};

const scrollToBottom = () =>
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });

// ─── Reveal on scroll ─────────────────────────────────────────────────────────

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ─── Background: particle mesh, dimmed and vignetted so text stays crisp ──────

export function SiteBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 opacity-[0.55]">
        <RippleMesh className="w-full h-full" />
      </div>
      {/* Flat scrim */}
      <div className="absolute inset-0" style={{ background: 'rgba(7,7,11,0.82)' }} />
      {/* Vignette + warm glow from the top-left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 15% 0%, rgba(201,169,106,0.10) 0%, transparent 55%),' +
            'radial-gradient(100% 100% at 50% 50%, transparent 35%, rgba(7,7,11,0.85) 100%)',
        }}
      />
    </div>
  );
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let lastScroll = window.pageYOffset;
    const onScroll = () => {
      const current = window.pageYOffset;
      setScrolled(current > 24);
      setVisible(current < lastScroll || current < 80);
      lastScroll = current;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const onContact = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    setTimeout(scrollToBottom, 60);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      } ${
        scrolled || menuOpen
          ? 'bg-ink/80 backdrop-blur-xl border-b border-white/[0.08]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="gutter flex h-[var(--nav-h)] items-center justify-between">
        <Link to="/home" className="group flex items-baseline gap-3">
          <span className="text-[0.95rem] font-medium tracking-display text-white">
            Ali Abouelazz
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-active={location.pathname === link.to}
              className={`link-wipe font-mono text-[0.68rem] uppercase tracking-[0.18em] ${
                location.pathname === link.to ? 'text-sand' : 'text-white/60 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="#contact"
            onClick={onContact}
            className="rounded-full border border-white/20 px-4 py-1.5 font-mono text-[0.68rem] uppercase
                       tracking-[0.18em] text-white/80 transition-all duration-300
                       hover:border-sand/60 hover:text-sand"
          >
            Contact
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="text-white/70 transition-colors hover:text-sand lg:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="gutter animate-fade-in border-t border-white/[0.08] pb-8 pt-6 lg:hidden">
          <div className="flex flex-col gap-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-mono text-sm uppercase tracking-[0.18em] ${
                  location.pathname === link.to ? 'text-sand' : 'text-white/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a
              href="#contact"
              onClick={onContact}
              className="font-mono text-sm uppercase tracking-[0.18em] text-white/70"
            >
              Contact
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

// ─── Contact + footer ─────────────────────────────────────────────────────────

export function ContactFooter() {
  return (
    <footer id="contact" className="relative z-10 gutter pb-14 pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="hairline mb-16" />

        <div className="grid gap-14 md:grid-cols-[1.4fr_1fr] md:items-start">
          <Reveal>
            <h2 className="display mb-10 text-4xl sm:text-5xl">
              Contact
              <span className="text-white/40"> Me</span>
            </h2>

            <div className="flex flex-col gap-5">
              <a
                href={`mailto:${CONTACT.email}`}
                className="group inline-flex items-center gap-3.5 text-lg font-light text-white/90
                           transition-colors duration-300 hover:text-sand"
              >
                <Mail className="h-4 w-4 text-sand" />
                {CONTACT.email}
                <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </a>
              <a
                href={CONTACT.phoneHref}
                className="group inline-flex items-center gap-3.5 text-lg font-light text-white/90
                           transition-colors duration-300 hover:text-sand"
              >
                <Phone className="h-4 w-4 text-sand" />
                {CONTACT.phone}
                <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/30">
                  WhatsApp contact only
                </span>
              </a>
              <a
                href={CONTACT.linkedin}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-3.5 text-lg font-light text-white/90
                           transition-colors duration-300 hover:text-sand"
              >
                <Linkedin className="h-4 w-4 text-sand" />
                LinkedIn
                <ArrowUpRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={120} className="justify-self-start md:justify-self-end">
            <div className="panel w-[210px] overflow-hidden p-2">
              <img
                src="/ali-portfolio/images-videos/profilePic.png"
                alt="Ali Abouelazz"
                className="h-auto w-full rounded-xl object-cover"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-white/[0.08] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/25">
            © {new Date().getFullYear()} Ali Abouelazz
          </p>
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/25">
            Grenoble INP · Product Engineering
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page shell ───────────────────────────────────────────────────────────────

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-transparent text-white">
      <SiteBackground />
      <SiteNav />
      <main className="relative z-10">{children}</main>
      <ContactFooter />
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <Reveal className="mb-14">
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="display text-4xl sm:text-5xl">{title}</h2>
      {subtitle && (
        <p className="mt-5 max-w-2xl text-balance text-base font-light leading-relaxed text-white/55">
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
