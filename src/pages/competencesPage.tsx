import { useState } from 'react';
import { PageShell, Reveal, SectionHeading } from '../components/SiteChrome';

const skills = [
  {
    name: 'Computer Aided Design (CAD)',
    image: '/ali-portfolio/images-videos/skillsImages/1.png',
    description: 'Expertise in advanced design techniques (CNC machining, 3D printing, casting)',
  },
  {
    name: 'Finite Element Analysis (FEA)',
    image: '/ali-portfolio/images-videos/skillsImages/4.png',
    description: 'Advanced simulation and structural integrity analysis',
  },
  {
    name: 'Fluid Flow + Thermal Analysis',
    image: '/ali-portfolio/images-videos/skillsImages/2.png',
    description: 'Fluid dynamics and heat transfer',
  },
  {
    name: 'Software Development',
    image: '/ali-portfolio/images-videos/skillsImages/3.png',
    description: 'Software development in C++ and Python',
  },
  {
    name: 'Control Systems Design',
    image: '/ali-portfolio/images-videos/skillsImages/controlSystems.png',
    description: 'Design of automation and control systems',
  },
];

const software = [
  { name: 'Ansys Workbench', logo: '/ali-portfolio/images-videos/softwareImages/ansys.png' },
  { name: 'Matlab Simulink', logo: '/ali-portfolio/images-videos/softwareImages/simulink.jpg' },
  { name: 'C++', logo: '/ali-portfolio/images-videos/softwareImages/CPP.png' },
  { name: 'Python', logo: '/ali-portfolio/images-videos/softwareImages/python.png' },
  { name: 'Creo', logo: '/ali-portfolio/images-videos/softwareImages/creo.svg.png' },
  { name: 'CATIA', logo: '/ali-portfolio/images-videos/softwareImages/catia.png' },
  { name: 'SolidWorks', logo: '/ali-portfolio/images-videos/softwareImages/solidWorks.png' },
];

const languages = [
  { name: 'French', level: 'Native language' },
  { name: 'Arabic', level: 'Native language' },
  { name: 'English', level: 'C2 level' },
];

const CompetencesPage = () => {
  const [index, setIndex] = useState(0);
  const skill = skills[index];

  return (
    <PageShell>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="gutter pb-4 pt-40">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={
              <>
                Technical
                <span className="text-white/35"> Skills</span>
              </>
            }
          />
        </div>
      </section>

      {/* ── Skill index + preview ───────────────────────────────────────── */}
      <section className="gutter pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_minmax(0,44%)] lg:gap-16">
            {/* Index — hairline rows, the active one opens */}
            <Reveal>
              <div className="flex flex-col">
                {skills.map((s, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={s.name}
                      onMouseEnter={() => setIndex(i)}
                      onFocus={() => setIndex(i)}
                      onClick={() => setIndex(i)}
                      aria-current={active}
                      className="group grid grid-cols-[3rem_1fr] items-baseline border-t border-white/[0.08]
                                 py-6 text-left transition-colors duration-500 last:border-b
                                 hover:border-sand/40"
                    >
                      <span
                        className={`font-mono text-[0.62rem] uppercase tracking-[0.18em] transition-colors
                                    duration-300 ${active ? 'text-sand' : 'text-white/25'}`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>

                      <span>
                        <span
                          className={`block text-xl font-light tracking-display transition-colors duration-300
                                      sm:text-2xl ${active ? 'text-white' : 'text-white/45'}`}
                        >
                          {s.name}
                        </span>

                        {/* Description slides open only for the active row */}
                        <span
                          className="grid transition-all duration-500 ease-out"
                          style={{
                            gridTemplateRows: active ? '1fr' : '0fr',
                            opacity: active ? 1 : 0,
                          }}
                        >
                          <span className="overflow-hidden">
                            <span className="block pt-3 text-sm font-light leading-relaxed text-white/50">
                              {s.description}
                            </span>
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Preview — no frame, just the image floating on the page */}
            <Reveal delay={120} className="lg:sticky lg:top-32 lg:self-start">
              <div className="relative flex h-72 items-center justify-center sm:h-96 lg:h-[30rem]">
                {skills.map((s, i) => (
                  <img
                    key={s.image}
                    src={s.image}
                    alt={s.name}
                    className="absolute max-h-full max-w-full rounded-2xl object-contain
                               transition-all duration-700 ease-out"
                    style={{
                      opacity: i === index ? 1 : 0,
                      transform: i === index ? 'scale(1)' : 'scale(0.97)',
                    }}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Software ────────────────────────────────────────────────────── */}
      <section className="gutter py-16">
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={
              <>
                Tools &amp;
                <span className="text-white/35"> Software</span>
              </>
            }
          />

          {/* Hairline lattice: no cards, only the grid lines */}
          <div
            className="grid grid-cols-2 border-l border-t border-white/[0.07] sm:grid-cols-3
                       lg:grid-cols-4"
          >
            {software.map((item, i) => (
              <Reveal key={item.name} delay={i * 55} className="h-full">
                <div
                  className="group flex h-full flex-col items-center justify-center gap-5 border-b border-r
                             border-white/[0.07] px-6 py-12 transition-colors duration-500
                             hover:bg-white/[0.02]"
                >
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-11 w-auto max-w-[6.5rem] object-contain opacity-45 grayscale
                               transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                  />
                  <span
                    className="text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-white/30
                               transition-colors duration-500 group-hover:text-sand"
                  >
                    {item.name}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Languages ───────────────────────────────────────────────────── */}
      <section className="gutter py-16 pb-24">
        <div className="mx-auto max-w-6xl">
          <SectionHeading title="Languages" />

          <div className="flex flex-col">
            {languages.map((lang, i) => (
              <Reveal key={lang.name} delay={i * 80}>
                <div
                  className="group flex items-baseline justify-between gap-6 border-t border-white/[0.08]
                             py-7 transition-colors duration-500 hover:border-sand/40"
                >
                  <h3 className="text-2xl font-light tracking-display text-white/85 transition-colors duration-300 group-hover:text-white">
                    {lang.name}
                  </h3>
                  <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-white/30 transition-colors duration-300 group-hover:text-sand">
                    {lang.level}
                  </p>
                </div>
              </Reveal>
            ))}
            <div className="border-t border-white/[0.08]" />
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default CompetencesPage;
