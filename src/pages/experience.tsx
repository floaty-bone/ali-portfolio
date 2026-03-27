import React, { useState, useEffect } from 'react';
import { Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExperienceEducationPage = () => {
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
      {/* Navigation - identical to main page */}
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
            <Link to="/downloadsPage" className="hover:text-[#9F8E6D] transition-colors duration-300">PORTFOLIO TECHNIQUE</Link>
            <Link to="/competencesPage" className="hover:text-[#9F8E6D] transition-colors duration-300">COMPÉTENCES</Link>
            <Link to="/loisirs" className="hover:text-[#9F8E6D] transition-colors duration-300">LOISIRS</Link>
            <a href='#' onClick={handleContactClick} className="hover:text-[#9F8E6D] transition-colors duration-300">CONTACT</a>
          </div>
        </div>
      </nav>

      {/* Hero Section with Experience & Education */}
      <header className="relative min-h-screen pt-24" style={{ top: "2rem" }}>
        <div className="max-w-7xl mx-auto px-24">

          {/* Education Section */}
          <div className="mb-16">
            <h3 className="text-3xl font-light mb-8 border-b border-white/20 pb-4">Éducation</h3>

            {/* Grenoble INP Degree */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/inp.png"
                  alt="Small thumbnail"
                  style={{ width: '120px', height: '40px' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Diplôme d'ingénieur Grenoble-inp</h4>
                    <p className="text-gray-400 mb-4">2022-2025</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Ingénierie Mécanique</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Formation pluridisciplinaire en Génie Industriel, filière Ingénierie de Produits (IdP), couvrant
                  l'ensemble du cycle de développement produit : de la conceptualisation à la réalisation de prototypes
                  physiques. Maîtrise de la modélisation CAO (Creo, CATIA), de la simulation numérique
                  (ANSYS Mechanical, Fluent) et de MATLAB Simulink pour la modélisation de systèmes et l'asservissement.
                </p>
              </div>
            </div>
            {/* Preparatory Classes */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/prepa.jpg"
                  alt="Small thumbnail"
                  style={{ width: '50px', height: '45px' }}
                />
              </div>
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Classes préparatoires</h4>
                    <p className="text-gray-400 mb-4">2020-2022</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Maths sup, Maths spé</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Deux années intensives en mathématiques, physique et ingénierie de base, développant
                  une compréhension solide des principes fondamentaux scientifiques.
                </p>
              </div>
            </div>
          </div>

          {/* Professional Experience Section */}
          <div className="relative min-h-screen pt-15" style={{ top: "4rem" }}>
            <h3 className="text-3xl font-light mb-8 border-b border-white/20 pb-4">Expériences Professionnelles</h3>

            {/* AI Agent Project */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/yc.svg"
                  alt="Y Combinator logo"
                  style={{ width: '170px', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Implémentation et déploiement Agent IA résident et autonome</h4>
                    <p className="text-gray-400 mb-4">09/2025 – 02/2026 | Candidat Y Combinator batch février</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">IA & Développement Logiciel</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Conception d'un agent IA résident opérant en permanence sur la machine de l'utilisateur (Linux, Windows, macOS)
                  dans une MicroVM Firecracker persistante. Accès complet au système via outils MCP (bash, fichiers, navigateur CDP),
                  mémoire continue entre sessions par ledger avec compression FIFO. Architecture à 3 niveaux
                  (Orchestrateur → Worker → Cron Agent) avec délégation aux sous-agents et planification autonome.
                  Client LLM unifié (Claude, OpenAI, Gemini, Grok). Stack : Python, asyncio, Firecracker, cdp-use, MCP.{' '}
                  <a href="https://github.com/floaty-bone/maxent" className="text-[#9F8E6D] hover:underline">GitHub</a>
                </p>
              </div>
            </div>

            {/* Caterpillar Stage PFE */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/Cat_Logo.png"
                  alt="Caterpillar logo"
                  style={{ width: '90px', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Stage PFE - Optimisation du système de tensionneur bulldozer D5</h4>
                    <p className="text-gray-400 mb-4">02/2025 – 09/2025 | Caterpillar</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Analyse de Fiabilité & Conception</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Analyse de fiabilité du tensionneur de chaîne Caterpillar D5 à partir de données terrain (warranty claims),
                  identification et priorisation des défaillances critiques via méthodologie DMAIC/FMEA.
                  Validation de la conception par simulation FEA sous ANSYS Mechanical et conception CAO 3D
                  de concepts d'amélioration (Creo Parametric). Outils : Python, ANSYS, Creo.
                </p>
              </div>
            </div>

            {/* General Electric Internship */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/ge.png"
                  alt="General Electric logo"
                  style={{ width: '170px', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Stage Assistant Ingénieur</h4>
                    <p className="text-gray-400 mb-4">05/2024 – 08/2024 | General Electric, Lyon</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Conception & Développement</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Conception d'une station de contrôle de conformité pour disjoncteurs haute tension live tank,
                  ciblant la conformité des doigts de couronnes de contact. Acquisition automatique des données
                  de course et d'effort, rédaction des spécifications techniques, vérification via calculs statiques
                  et simulations ANSYS. Développement en C++ de l'interface graphique (ImGui) et enregistrement
                  des données sur serveur local (MySQL). Mission secondaire : calculs de vérification et
                  dimensionnement de bielles et chambre SF6 des disjoncteurs GCB.
                </p>
              </div>
            </div>

            {/* Alstom School Project */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/alstom.png"
                  alt="Alstom logo"
                  style={{ width: '130px', height: 'auto', objectFit: 'contain' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Projet d'École</h4>
                    <p className="text-gray-400 mb-4">04/2024 – 05/2024 | Alstom, Lyon</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Simulation & Conception</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Conception et optimisation d'un banc d'essais mécaniques reproduisant des sollicitations radiales
                  et axiales périodiques sur un roulement intégré dans une nouvelle gamme de générateurs.
                  Instrumentation, acquisition des données expérimentales et simulation de fatigue (ANSYS)
                  pour estimer la durée de vie et qualifier le produit.
                </p>
              </div>
            </div>

            {/* Sabca Internship */}
            <div className="flex mb-10">
              <div className="mr-4">
                <img
                  src="/ali-portfolio/images-videos/sabca.png"
                  alt="Sabca logo"
                  style={{ width: '100px', height: '30px' }}
                />
              </div>
              <div className="mb-12">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-2xl mb-2">Stage Opérateur</h4>
                    <p className="text-gray-400 mb-4">07/2023 – 08/2023 | Sabca (Pilatus PC-12)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#9F8E6D]">Assemblage Aéronautique</p>
                  </div>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  Suivi d'un plan d'aménagement d'outillage et surveillance du placement des gabarits,
                  structures de levage, tables et équipements afin de garantir la conformité du lay-out industriel
                  sur la chaîne d'assemblage de l'avion Pilatus PC-12.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contact Section */}
      <section className="bg-black py-40 px-24 mt-20">
        <div className="max-w-7xl mx-auto flex justify-between items-start" style={{ top: "10px" }}>
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

export default ExperienceEducationPage;