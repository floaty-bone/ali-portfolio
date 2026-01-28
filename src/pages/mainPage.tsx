import React, { useState, useEffect } from 'react';
import { ChevronRight, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage = () => {
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
              alt="Paragliders in snowy mountains"
              className="w-full h-full object-cover"
            />
          </video>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black"></div>
        </div>
        <div className="relative h-full flex flex-col justify-center px-24 max-w-4xl">
          <p className="text-xl text-gray-200 mb-12 leading-relaxed">
            Bonjour, je suis Ali Abouelazz
            <br /><br />
            Je suis un ingénieur en ingénierie mécanique, diplômé de Grenoble INP. Passionné par la conception, je m'efforce de créer des solutions innovantes en intégrant la rigueur de la conception physique aux outils logiciels modernes.
          </p>
          <Link to="/competencesPage"
            className="group flex items-center gap-2 text-lg hover:text-[#9F8E6D] transition-all duration-300">
            Mes Compétences
            <ChevronRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>
      {/* Hero Section */}
      <header className="relative h-screen">
        {/* Full-width image container */}
        <div className="absolute inset-0 w-full h-full">
          <div className="relative w-full h-full">
            {/* Placeholder for the paragliding image - you would replace this with your actual image */}
            <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] bg-cover bg-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black" />
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative h-full flex flex-col justify-center px-24 max-w-4xl">
          <blockquote className="relative pl-6 border-l-4 border-gray-300 italic text-xl text-gray-200 mb-12 leading-relaxed">
            "I am putting myself to the fullest possible use, which is all I think that any conscious entity can ever hope to do"
            <cite className="block text-sm not-italic text-gray-400 mt-2">— HAL 9000, 2001: A Space Odyssey</cite>
          </blockquote>
        </div>
      </header>

      {/* Contact Section */}
      <section className="bg-black py-32 px-24">
        <div className="max-w-7xl mx-auto flex justify-between items-start">
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
                href="tel:0769630844"
                className="block text-gray-300 hover:text-[#9F8E6D] transition-colors duration-300"
              >
                07 69 63 08 44
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

export default HomePage;