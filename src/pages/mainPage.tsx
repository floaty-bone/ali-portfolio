import { useEffect } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { PageShell, Reveal, SectionHeading } from '../components/SiteChrome';

// A glimpse of the technical portfolio — labels and titles taken verbatim
// from the portfolio page sections.
const HIGHLIGHTS = [
  {
    to: '/downloadsPage',
    state: { openSection: 'lqr' },
    kicker: 'Personal Study',
    title: 'LQR Full State Feedback Control & 6 DOF Body Integrator',
  },
  {
    to: '/downloadsPage',
    state: { openSection: 'canard' },
    kicker: 'Personal Project',
    title: 'Canard Landing Gear & Roll Control Assembly',
  },
  {
    to: '/downloadsPage',
    state: { openSection: 'caterpillar' },
    kicker: 'Final Year Internship',
    title: 'Caterpillar',
  },
  {
    to: '/downloadsPage',
    state: { openSection: 'ge' },
    kicker: 'Engineering Internship',
    title: 'General Electric Vernova',
  },
];

const HomePage = () => {
  const location = useLocation();

  useEffect(() => {
    if ((location.state as { scrollToContact?: boolean } | null)?.scrollToContact) {
      setTimeout(
        () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }),
        100,
      );
    }
  }, [location.state]);

  return (
    <PageShell>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="gutter relative flex min-h-screen items-center pb-24 pt-[var(--nav-h)]">
        <div className="mx-auto w-full max-w-6xl">
          <p className="eyebrow mb-7 animate-fade-up">
            Grenoble INP <span className="text-sand/50">·</span> Product Engineering
          </p>

          <h1
            className="display max-w-4xl text-balance text-[clamp(2.1rem,6.2vw,4.6rem)] leading-[1.05] animate-fade-up sm:leading-[1.0]"
            style={{ animationDelay: '80ms' }}
          >
            <span className="block text-white/35">Hello, I'm</span>
            Ali Abouelazz
          </h1>

          <p
            className="mt-10 max-w-2xl text-balance text-lg font-light leading-relaxed text-white/60 animate-fade-up"
            style={{ animationDelay: '120ms' }}
          >
            Graduate mechanical engineer from Grenoble INP, Product Engineering
            specialization (IdP). Multidisciplinary training covering the full product
            development cycle: from conceptualization to physical prototyping, including
            CAD modeling, numerical simulation, and control systems.
          </p>

          <div
            className="mt-12 flex flex-wrap items-center gap-4 animate-fade-up"
            style={{ animationDelay: '200ms' }}
          >
            <Link to="/downloadsPage" className="btn btn-primary group">
              Technical Portfolio
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link to="/rocketDemo" className="btn btn-ghost group">
              LQR Control Demo
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute inset-x-0 bottom-10 hidden justify-center lg:flex">
          <div className="h-12 w-px overflow-hidden bg-white/10">
            <div className="h-6 w-px animate-scroll-cue bg-sand" />
          </div>
        </div>
      </section>

      {/* ── Glimpse of the technical portfolio ──────────────────────────── */}
      <section className="gutter relative py-28">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={
              <>
                Technical
                <span className="text-white/35"> Portfolio</span>
              </>
            }
          />

          <div className="flex flex-col">
            {HIGHLIGHTS.map((item, i) => (
              <Reveal key={item.title} delay={i * 90}>
                <Link
                  to={item.to}
                  state={item.state}
                  className="group grid grid-cols-1 items-baseline gap-4 border-t border-white/[0.08]
                             py-9 transition-colors duration-500 hover:border-sand/40
                             md:grid-cols-[210px_1fr_auto] md:gap-10"
                >
                  <span className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/30
                                   transition-colors duration-300 group-hover:text-sand">
                    {item.kicker}
                  </span>
                  <h3 className="text-2xl font-light tracking-display text-white transition-colors duration-300 group-hover:text-sand">
                    {item.title}
                  </h3>
                  <ArrowUpRight
                    className="h-5 w-5 text-white/25 transition-all duration-300
                               group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-sand"
                  />
                </Link>
              </Reveal>
            ))}
            <div className="border-t border-white/[0.08]" />
          </div>

          <Reveal delay={120}>
            <Link to="/downloadsPage" className="btn btn-ghost group mt-12">
              Technical Portfolio
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ── Quote ───────────────────────────────────────────────────────── */}
      <section className="gutter relative py-32">
        <Reveal className="mx-auto max-w-4xl text-center">
          <blockquote className="display text-balance text-2xl leading-relaxed sm:text-3xl">
            <span className="text-sand">“</span>
            I am putting myself to the fullest possible use, which is all I think that any
            conscious entity can ever hope to do
            <span className="text-sand">”</span>
          </blockquote>
          <cite className="mt-8 block font-mono text-[0.62rem] uppercase not-italic tracking-[0.22em] text-white/30">
            HAL 9000, 2001: A Space Odyssey
          </cite>
        </Reveal>
      </section>
    </PageShell>
  );
};

export default HomePage;
