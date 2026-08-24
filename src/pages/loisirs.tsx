import { PageShell, Reveal, SectionHeading } from '../components/SiteChrome';

const CentreInteret = () => {
  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="gutter pb-8 pt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            eyebrow="Outside the office"
            title={
              <>
                Interests
                <span className="text-white/35"> &amp; time off.</span>
              </>
            }
            subtitle="Two things that have held my attention far longer than any single project."
          />
        </div>
      </section>

      {/* ── Surfing ─────────────────────────────────────────────────────── */}
      <section className="gutter pb-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="panel overflow-hidden p-2">
                <img
                  src="/ali-portfolio/images-videos/me_surfing.jpg"
                  alt="Surfing at Safi Point, Morocco"
                  className="h-[300px] w-full rounded-xl object-cover object-left sm:h-[420px]"
                />
              </div>
              <div>
                <p className="eyebrow mb-5">01 — Ocean</p>
                <h3 className="display mb-6 text-3xl">Safi Point, Morocco</h3>
                <p className="text-balance text-lg font-light leading-relaxed text-white/55">
                  I got into surfing through my brother. That's me at Safi Point, better
                  known as Le Jardin. A mystical spot that comes alive only a handful of
                  times a year. Caught right before I set up for a barrel and got
                  absolutely worked.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Guitar ──────────────────────────────────────────────────────── */}
      <section className="gutter pb-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="panel overflow-hidden p-2 lg:order-2">
                <video
                  className="h-[300px] w-full rounded-xl object-cover sm:h-[420px]"
                  controls
                  playsInline
                  preload="metadata"
                >
                  <source src="/ali-portfolio/images-videos/video.mp4" type="video/mp4" />
                </video>
              </div>
              <div className="lg:order-1">
                <p className="eyebrow mb-5">02 — Sound</p>
                <h3 className="display mb-6 text-3xl">'The Loner', 2016</h3>
                <p className="text-balance text-lg font-light leading-relaxed text-white/55">
                  I'm more into jazz fusion now, but back then I was all about classic rock
                  and blues. The video on the right is from 2016, where I'm playing 'The
                  Loner' by Gary Moore.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
};

export default CentreInteret;
