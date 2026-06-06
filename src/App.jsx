import { useState, useEffect } from 'react';
import SplashCursor from './components/SplashCursor';
import ScrollProgress from './components/ScrollProgress';
import VisitorCounter from './components/VisitorCounter';
import Sidebar from './components/Sidebar';
import Preloader from './components/Preloader';
import RightDock from './components/RightDock';

import QRBusinessCard from './components/QRBusinessCard';
import CollaborationForm from './components/CollaborationForm';
import MeetingScheduler from './components/MeetingScheduler';
import HireMeButton from './components/HireMeButton';
import HireKrishnaModal from './components/HireKrishnaModal';
import DoubtsForm from './components/DoubtsForm';

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
import Testimonials from './sections/Testimonials';
import AdminDashboard from './components/AdminDashboard';
import TrackingWidget from './components/TrackingWidget';
import SuperToolsModal from './components/SuperToolsModal';
import GPSMapCamera from './components/GPSMapCamera';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [modals, setModals] = useState({ clg: false, qr: false, collab: false, meeting: false, hire: false, hireKrishna: false, resumeAI: false, track: false, tools: false, gps: false, doubts: false });

  const isAdmin = typeof window !== 'undefined' && window.location.pathname === '/admin';

  // Auto-open tracking widget if URL has ?track= param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('track')) {
      setModals(prev => ({ ...prev, track: true }));
    }
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

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="app-container">
      <ScrollProgress />
      <Preloader />
      <SplashCursor />

      {/* Left: Hamburger */}
      <button id="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
        <span className="bar" />
        <span className="bar" />
        <span className="bar" />
      </button>

      {/* Right Dock: Theme + Language + Back-to-top + Voice (left) + AI Chat (bottom-right) */}
      <RightDock onOpenDoubts={() => openModal('doubts')} />

      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} onOpenQR={() => openModal('qr')} onOpenTrack={() => openModal('track')} onOpenTools={() => openModal('tools')} onOpenDoubts={() => openModal('doubts')} />

      <main>
        <Hero
          onOpenMeeting={() => openModal('meeting')}
          onOpenQR={() => openModal('qr')}
          onOpenCollab={() => openModal('collab')}
          onOpenHireMe={() => openModal('hire')}
          onOpenHireKrishna={() => openModal('hireKrishna')}
          onOpenTrack={() => openModal('track')}
          onOpenCoverLetter={() => openModal('clg')}
          onOpenResumeAI={() => openModal('resumeAI')}
          onOpenTools={() => openModal('tools')}
          onOpenGPS={() => openModal('gps')}
          onOpenDoubts={() => openModal('doubts')}
        />
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
        <Testimonials />
        <Media />
        <Resume />
        <Contact onOpenCollab={() => openModal('collab')} onOpenQR={() => openModal('qr')} onOpenDoubts={() => openModal('doubts')} />
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} G. Krishna Teja. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '0.8em', opacity: 0.7 }}>
          Built with <i className="fas fa-heart" style={{ color: 'var(--gold)' }}></i> using React &amp; Vite.
        </p>
        <VisitorCounter />
      </footer>

      {/* Modals */}
      <QRBusinessCard isOpen={modals.qr} onClose={() => closeModal('qr')} />
      <CollaborationForm isOpen={modals.collab} onClose={() => closeModal('collab')} />
      <MeetingScheduler isOpen={modals.meeting} onClose={() => closeModal('meeting')} />
      {modals.hire && <HireMeButton initialOpen onClose={() => closeModal('hire')} />}
      <HireKrishnaModal isOpen={modals.hireKrishna} onClose={() => closeModal('hireKrishna')} />
      <TrackingWidget isOpen={modals.track} onClose={() => closeModal('track')} />
      <SuperToolsModal isOpen={modals.tools} onClose={() => closeModal('tools')} />
      <GPSMapCamera isOpen={modals.gps} onClose={() => closeModal('gps')} />
      <DoubtsForm isOpen={modals.doubts} onClose={() => closeModal('doubts')} />
    </div>
  );
}

export default App;
