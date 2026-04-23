import { useState, useEffect } from 'react';
import SplashCursor from './components/SplashCursor';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import BackToTop from './components/BackToTop';
import Preloader from './components/Preloader';
import AIChat from './components/AIChat';

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
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.body.classList.add('light');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) {
        document.body.classList.remove('light');
        localStorage.setItem('theme', 'dark');
      } else {
        document.body.classList.add('light');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

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

  return (
    <div className="app-container">
      <Preloader />
      <SplashCursor />
      
      <button id="sidebar-toggle" onClick={toggleSidebar} aria-label="Toggle Navigation">
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
      
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      
      <main>
        <Hero />
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
        <Contact />
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} G. Krishna Teja. All rights reserved.</p>
        <p style={{ marginTop: '8px', fontSize: '0.8em', opacity: 0.7 }}>
          Built with <i className="fas fa-heart" style={{ color: 'var(--gold)' }}></i> using React &amp; Vite.
        </p>
      </footer>

      <BackToTop />
      <AIChat />
    </div>
  );
}

export default App;
