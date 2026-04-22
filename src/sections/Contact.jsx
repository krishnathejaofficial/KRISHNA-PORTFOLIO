import { useEffect, useRef, useState } from 'react';
import LogoLoop from '../components/LogoLoop';
import { socialLogos } from '../data/socialLogos';

export default function Contact() {
  const ref = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [btnText, setBtnText] = useState(<><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} />Send Message</>);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const form = e.target;
    setBtnText(<><i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }} />Sending...</>);
    setStatus('sending');
    const object = Object.fromEntries(new FormData(form));
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(object),
      });
      const result = await res.json();
      if (res.status === 200) {
        setStatus('success');
        setBtnText(<><i className="fas fa-check" style={{ marginRight: '8px' }} />Sent Successfully!</>);
        form.reset();
        setTimeout(() => { setStatus('idle'); setBtnText(<><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} />Send Message</>); }, 3000);
      } else {
        throw new Error(result.message);
      }
    } catch {
      setStatus('error');
      setBtnText(<><i className="fas fa-exclamation-triangle" style={{ marginRight: '8px' }} />Error! Try again.</>);
      setTimeout(() => { setStatus('idle'); setBtnText(<><i className="fas fa-paper-plane" style={{ marginRight: '8px' }} />Send Message</>); }, 3000);
    }
  }

  const btnStyle = status === 'success' ? { background: 'linear-gradient(135deg,#1a5c2a,#1e7a36)', color: '#90ffb0' } : {};

  return (
    <section id="contact" ref={ref}>
      <div className="section-icon"><i className="fas fa-address-book" /></div>
      <h2>Contact Me</h2>
      <div className="section-divider" />
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="access_key" value="4e9cf101-22a3-4552-9b1f-dc1f86224eaa" />
        <input type="hidden" name="subject" value="New Submission from Portfolio" />
        <input type="text" name="name" placeholder="Your Name" required />
        <input type="email" name="email" placeholder="Your Email" required />
        <textarea name="message" placeholder="Your Message" required />
        <button type="submit" className="btn" style={{ alignSelf: 'center', ...btnStyle }} disabled={status === 'sending'}>
          {btnText}
        </button>
      </form>
      <div className="contact-info" data-animate>
        <p><i className="fas fa-map-marker-alt" style={{ color: 'var(--gold)', marginRight: '8px' }} />Madharapakkam, Tiruvallur, Tamil Nadu - 601202</p>
        <p style={{ marginTop: '10px' }}><i className="fas fa-envelope" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="mailto:krishnatejareddy2001@gmail.com">krishnatejareddy2001@gmail.com</a></p>
        <p style={{ marginTop: '10px' }}><i className="fas fa-phone" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="tel:+919390850349">+91 93908 50349</a></p>
      </div>
      <div className="social-links" data-animate style={{ width: '100%', overflow: 'hidden' }}>
        <LogoLoop
          logos={socialLogos}
          speed={100}
          direction="left"
          logoHeight={48}
          gap={36}
          hoverSpeed={0}
          scaleOnHover={true}
          fadeOut={true}
          fadeOutColor="var(--bg)"
          ariaLabel="Social Links"
        />
      </div>
    </section>
  );
}
