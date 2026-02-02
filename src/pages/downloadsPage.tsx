import React, { useState, useEffect } from 'react';
import { Download, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const DownloadsPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [navVisible, setNavVisible] = useState(true);

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
      <div className="w-full h-[120vh] relative overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          >
            <source src="/ali-portfolio/images-videos/23.mp4" type="video/mp4" />
            {/* Fallback image in case video doesn't load */}
            <img
              src="/api/placeholder/2400/800"
              alt="Background video fallback"
              className="w-full h-full object-cover"
            />
          </video>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black"></div>
        </div>

        {/* Downloads Content */}
        <div className="relative h-full flex items-center justify-center px-24 pt-15">
          <div className="w-full max-w-4xl">
            <h2 className="text-4xl font-light mb-12 text-white mt-16">Téléchargements</h2>
            <div className="grid grid-cols-2 gap-8">
              <div className="bg-white/10 border border-white/20 rounded-lg p-8 flex flex-col items-center">
                <h3 className="text-2xl mb-6">Mon CV</h3>
                <p className="text-gray-300 mb-8 text-center">
                  Consultez mon parcours professionnel et académique détaillé
                </p>
                <a
                  href="/ali-portfolio/downloads/cv.pdf"
                  download
                  className="flex items-center gap-2 bg-[#9F8E6D] px-8 py-3 hover:bg-[#8F7E5D] transition-colors duration-300 text-white/90 rounded-md"
                >
                  <Download className="w-5 h-5" />
                  Télécharger CV
                </a>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-lg p-8 flex flex-col items-center">
                <h3 className="text-2xl mb-6">Portfolio Technique</h3>
                <p className="text-gray-300 mb-8 text-center">
                  Explorez mes projets techniques et réalisations détaillées
                </p>
                <a
                  href="/ali-portfolio/downloads/Portfolio-technique.pdf"
                  download
                  className="flex items-center gap-2 bg-[#9F8E6D] px-8 py-3 hover:bg-[#8F7E5D] transition-colors duration-300 text-white/90 rounded-md"
                >
                  <Download className="w-5 h-5" />
                  Télécharger Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section - Matching other pages */}
      <section className="bg-black py-40 px-24 mt-20">
        <div className="max-w-7xl mx-auto flex justify-between items-start" style={{ top: "10px" }}>
          <div className="max-w-lg">
            <h3 className="text-4xl font-light mb-8">Me contacter</h3>
            <p className="text-gray-400 mb-8 font-light leading-relaxed">
              Pour garantir une réponse rapide et efficace, je vous invite à privilégier l'<b>email</b> ou <b>LinkedIn</b> pour toute première prise de contact. Le téléphone reste disponible pour les échanges préalablement organisés.
            </p>
            <div className="space-y-4">
              <a
                href="mailto:ali.abouelazz@gmail.com"
                className="block text-gray-300 hover:text-[#9F8E6D] transition-colors duration-300"
              >
                ali.abouelazz@gmail.com
              </a>
              <a
                href="tel:+33777451629"
                className="block text-gray-300 hover:text-[#9F8E6D] transition-colors duration-300"
              >
                +33 7 77 45 16 29
              </a>
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

export default DownloadsPage;