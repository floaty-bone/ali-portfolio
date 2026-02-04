import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompetencesPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [navVisible, setNavVisible] = useState(true);
  const [currentSkillIndex, setCurrentSkillIndex] = useState(0);

  const skills = [
    {
      name: 'Conception Assistée par Ordinateur (CAO)',
      image: '/ali-portfolio/images-videos/skillsImages/1.png',
      description: 'Expertise en techniques de conception avancées (usinage CNC, impression 3D, fonderie)'
    },
    {
      name: 'Analyse par Éléments Finis (FEA)',
      image: '/ali-portfolio/images-videos/skillsImages/4.png',
      description: "Simulation avancée et analyse de l'intégrité structurelle"
    },
    {
      name: 'Écoulements + thermique',
      image: '/ali-portfolio/images-videos/skillsImages/2.png',
      description: 'Dynamique des fluides et transfert thermique'
    },
    {
      name: 'Développement Logiciel',
      image: '/ali-portfolio/images-videos/skillsImages/3.png',
      description: 'Développement logiciel en C++, Django et Python'
    },
    {
      name: 'Conception de Systèmes de Contrôle',
      image: '/ali-portfolio/images-videos/skillsImages/controlSystems.png',
      description: "Conception de systèmes d'automatisation et de contrôle"
    }
  ];

  const software = [
    { name: 'Ansys Workbench', logo: '/ali-portfolio/images-videos/softwareImages/ansys.png' },
    { name: 'Matlab Simulink', logo: '/ali-portfolio/images-videos/softwareImages/simulink.jpg' },
    { name: 'C++', logo: '/ali-portfolio/images-videos/softwareImages/CPP.png' }, // Fixed casing from search
    { name: 'Python', logo: '/ali-portfolio/images-videos/softwareImages/python.png' },
    { name: 'Django', logo: '/ali-portfolio/images-videos/softwareImages/django.svg' },
    { name: 'Creo', logo: '/ali-portfolio/images-videos/softwareImages/creo.svg.png' },
    { name: 'SolidWorks', logo: '/ali-portfolio/images-videos/softwareImages/solidWorks.png' },
    { name: 'CATIA', logo: '/ali-portfolio/images-videos/softwareImages/catia.png' }
  ];

  const languages = [
    { name: 'Français', level: 'Langue maternelle' },
    { name: 'Arabe', level: 'Langue maternelle' },
    { name: 'Anglais', level: 'Niveau C2' }
  ];

  useEffect(() => {
    let lastScroll = 0;

    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      setScrollPosition(currentScroll);
      setNavVisible(currentScroll < lastScroll || currentScroll < 50);
      lastScroll = currentScroll;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSkillNext = () => {
    setCurrentSkillIndex((prev) =>
      (prev + 1) % skills.length
    );
  };

  const handleSkillPrev = () => {
    setCurrentSkillIndex((prev) =>
      prev === 0 ? skills.length - 1 : prev - 1
    );
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();

    // Scroll to bottom after short delay
    setTimeout(() => {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
      });
    }, 100);
  };


  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-500 ${scrollPosition > 50
        ? 'bg-black/90 backdrop-blur-sm'
        : 'bg-transparent'
        } ${navVisible
          ? 'transform translate-y-0'
          : 'transform -translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-8 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-light tracking-wide">Ali Abouelazz</h1>
          </div>
          <div className="flex gap-12 text-sm font-light tracking-wider">
            <Link to="/home" className="hover:text-[#9F8E6D] transition-colors duration-300">ACCUEIL</Link>
            <Link to="/educationExperience" className="hover:text-[#9F8E6D] transition-colors duration-300">EDUCATION ET EXPERIENCES</Link>
            <Link to="/downloadsPage" className="hover:text-[#9F8E6D] transition-colors duration-300">CV+PORTFOLIO TECHNIQUE</Link>
            <Link to="/competencesPage" className="hover:text-[#9F8E6D] transition-colors duration-300">COMPÉTENCES</Link>
            <Link to="/loisirs" className="hover:text-[#9F8E6D] transition-colors duration-300">LOISIRS</Link>
            <a href='#' onClick={handleContactClick} className="hover:text-[#9F8E6D] transition-colors duration-300">CONTACT</a>
          </div>
        </div>
      </nav>

      {/* Video Banner */}
      <div className="w-full h-[180vh] relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 h-[120vh]">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/ali-portfolio/images-videos/24.mp4" type="video/mp4" />
            <img
              src="/api/placeholder/2400/800"
              alt="Background video fallback"
              className="w-full h-full object-cover"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black"></div>
        </div>

        {/* Compétences Content */}
        <div className="relative h-full flex flex-col justify-center px-24 pt-32">
          <div className="w-full max-w-6xl mx-auto">
            {/* Skills Section */}
            <section className="mb-16">
              <h2 className="text-4xl font-light mb-12 text-white">Compétences Techniques</h2>
              <div className="relative flex items-center justify-center">
                <button
                  onClick={handleSkillPrev}
                  className="absolute left-0 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <div className="flex items-center justify-center w-full">
                  <div className="w-full max-w-4xl grid grid-cols-2 gap-8 items-center">
                    <div className="bg-white/10 border border-white/20 rounded-lg overflow-hidden">
                      <img
                        src={skills[currentSkillIndex].image}
                        alt={skills[currentSkillIndex].name}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                    <div className="p-8">
                      <h3 className="text-3xl mb-4">{skills[currentSkillIndex].name}</h3>
                      <p className="text-gray-300">{skills[currentSkillIndex].description}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSkillNext}
                  className="absolute right-0 z-10 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </div>
            </section>

            {/* Software Section */}
            <section className="mb-16">
              <h2 className="text-4xl font-light mb-12 text-white">Outils et Logiciels</h2>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {software.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col items-center bg-white/10 p-4 rounded-lg"
                  >
                    <img
                      src={item.logo}
                      alt={item.name}
                      className="w-19 h-16 mb-3 object-contain"
                    />
                    <span className="text-sm">{item.name}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Languages Section */}
            <section>
              <h2 className="text-4xl font-light mb-12 text-white">Langues</h2>
              <div className="grid grid-cols-3 gap-8">
                {languages.map((lang) => (
                  <div
                    key={lang.name}
                    className="bg-white/10 border border-white/20 rounded-lg p-6 text-center"
                  >
                    <h3 className="text-2xl mb-2">{lang.name}</h3>
                    <p className="text-gray-300">{lang.level}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <section className="bg-black py-32 px-24">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
          <div className="max-w-lg">
            <h3 className="text-4xl font-light mb-8">Me contacter</h3>
            <div className="space-y-8">
              <div>
                <span className="text-xs font-semibold text-[#9F8E6D] uppercase tracking-widest mb-2 block">Email</span>
                <a
                  href="mailto:ali.abouelazz@gmail.com"
                  className="text-lg font-light text-white hover:text-[#9F8E6D] transition-colors duration-300"
                >
                  ali.abouelazz@gmail.com
                </a>
              </div>
              <div>
                <span className="text-xs font-semibold text-[#9F8E6D] uppercase tracking-widest mb-2 block">Contact via WhatsApp uniquement</span>
                <a
                  href="tel:+33777451629"
                  className="text-lg font-light text-white hover:text-[#9F8E6D] transition-colors duration-300"
                >
                  +33 7 77 45 16 29
                </a>
              </div>
            </div>
          </div>
          <div className="w-[200px] flex justify-center items-center">
            <img
              src="/ali-portfolio/images-videos/profilePic.png"
              alt="Mohamed Ali Abouelazz Profile"
              className="w-full h-auto object-cover rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/10 flex justify-between items-center">
          <div className="flex gap-8">
            <a href="https://www.linkedin.com/in/ali-abouelazz-a00197220" className="text-white/70 hover:text-[#9F8E6D] transition-colors duration-300">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CompetencesPage;