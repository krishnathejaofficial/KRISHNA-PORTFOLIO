import { useState } from 'react';
import SplashCursor from './components/SplashCursor';
import Sidebar from './components/Sidebar';
import Preloader from './components/Preloader';

// Single unified dock (replaces ThemeSelector, LanguageSwitcher, LiveTimeWeather, HireMeButton, VoiceNav, AIChat, BackToTop)
import RightDock from './components/RightDock';

// Feature Modals
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
  const [modals, setModals] = useState({ clg: false, qr: false, collab: false, meeting: false });

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

      {/* Left: Hamburger Menu */}
      <button id="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Right: Unified Professional Dock */}
      <RightDock />

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

      {/* Feature Modals */}
      <CoverLetterGenerator isOpen={modals.clg} onClose={() => closeModal('clg')} />
      <QRBusinessCard isOpen={modals.qr} onClose={() => closeModal('qr')} />
      <CollaborationForm isOpen={modals.collab} onClose={() => closeModal('collab')} />
      <MeetingScheduler isOpen={modals.meeting} onClose={() => closeModal('meeting')} />
    </div>
  );
}

export default App;
