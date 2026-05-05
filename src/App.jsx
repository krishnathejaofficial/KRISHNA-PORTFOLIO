import { useState, useEffect } from 'react';
import SplashCursor from './components/SplashCursor';
import Sidebar from './components/Sidebar';
import LiveTimeWeather from './components/LiveTimeWeather';
import BackToTop from './components/BackToTop';
import Preloader from './components/Preloader';
import AIChat from './components/AIChat';
import VoiceNav from './components/VoiceNav';

// New Features
import ThemeSelector, { initTheme } from './components/ThemeSelector';
import LanguageSwitcher, { useTranslation } from './components/LanguageSwitcher';
import HireMeButton from './components/HireMeButton';
import CoverLetterGenerator from './components/CoverLetterGenerator';
import QRBusinessCard from './components/QRBusinessCard';
import CollaborationForm from './components/CollaborationForm';
import MeetingScheduler from './components/MeetingScheduler';

// Sections
import Hero from './sections/Hero';
import About from './sections/About';
import Education from './sections/Education';
import Research from './sections/Research';
import Experience from './sections/Experience';
import Internships from './sections/Internships';
import Projects from './sections/Projects';
import Skills from './sections/Skills';
import Certifications from './sections/Certifications';
import Languages from './sections/Languages';
import Media from './sections/Media';
import Career from './sections/Career';
import Resume from './sections/Resume';
import Contact from './sections/Contact';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Feature states
  const [currentTheme, setCurrentTheme] = useState('dark');
  const { lang, setLang } = useTranslation();
  const [modals, setModals] = useState({ clg: false, qr: false, collab: false, meeting: false });

  useEffect(() => {
    setCurrentTheme(initTheme());
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => {
      const next = !prev;
      document.body.classList.toggle('sidebar-open', next);
      return next;
    });
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    document.body.classList.remove('sidebar-open');
  };

  const openModal = (key) => setModals(prev => ({ ...prev, [key]: true }));
  const closeModal = (key) => setModals(prev => ({ ...prev, [key]: false }));

  return (
    <div className="app-container">
      <Preloader />
      <SplashCursor />
      
      <button id="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <LanguageSwitcher lang={lang} setLang={setLang} />
      <ThemeSelector currentTheme={currentTheme} setCurrentTheme={setCurrentTheme} />
      <LiveTimeWeather />
      <HireMeButton />
      
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} onOpenQR={() => openModal('qr')} />
      
      <main>
        <Hero onOpenCoverLetter={() => openModal('clg')} onOpenMeeting={() => openModal('meeting')} />
        <About />
        <Career />
        <Education />
        <Research />
        <Internships />
        <Projects />
        <Skills />
        <Experience />
        <Certifications />
        <Languages />
        <Media />
        <Resume />
        <Contact onOpenCollab={() => openModal('collab')} onOpenQR={() => openModal('qr')} />
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} G. Krishna Teja. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '0.8em', opacity: 0.7 }}>
          Built with <i className="fas fa-heart" style={{ color: 'var(--gold)' }}></i> using React &amp; Vite.
        </p>
      </footer>

      <BackToTop />
      <AIChat />
      <VoiceNav />

      {/* Feature Modals */}
      <CoverLetterGenerator isOpen={modals.clg} onClose={() => closeModal('clg')} />
      <QRBusinessCard isOpen={modals.qr} onClose={() => closeModal('qr')} />
      <CollaborationForm isOpen={modals.collab} onClose={() => closeModal('collab')} />
      <MeetingScheduler isOpen={modals.meeting} onClose={() => closeModal('meeting')} />
    </div>
  );
}

export default App;
