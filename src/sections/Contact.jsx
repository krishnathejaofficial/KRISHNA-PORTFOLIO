import { useEffect, useRef, useState } from 'react';

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
        <button type="submit" className="btn" style={{ alignSelf: 'flex-start', ...btnStyle }} disabled={status === 'sending'}>
          {btnText}
        </button>
      </form>
      <div className="contact-info" data-animate>
        <p><i className="fas fa-map-marker-alt" style={{ color: 'var(--gold)', marginRight: '8px' }} />Madharapakkam, Tiruvallur, Tamil Nadu - 601202</p>
        <p style={{ marginTop: '10px' }}><i className="fas fa-envelope" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="mailto:krishnatejareddy2001@gmail.com">krishnatejareddy2001@gmail.com</a></p>
        <p style={{ marginTop: '10px' }}><i className="fas fa-phone" style={{ color: 'var(--gold)', marginRight: '8px' }} /><a href="tel:+919390850349">+91 93908 50349</a></p>
      </div>
      <div className="social-links" data-animate>
        {[
          { href: 'https://www.linkedin.com/in/gkrishnateja', src: '/images/LINKEDIN.png', alt: 'LinkedIn' },
          { href: 'https://www.instagram.com/krishna_theja_reddy', src: '/images/INSTA.png', alt: 'Instagram' },
          { href: 'https://www.facebook.com/share/16RTshSy8n/', src: '/images/FB.png', alt: 'Facebook' },
          { href: 'https://x.com/GKrishnaTeja10', src: '/images/X.png', alt: 'X' },
          { href: 'https://github.com/krishnathejaofficial', src: '/images/GITHUB.png', alt: 'GitHub' },
        ].map(s => (
          <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" title={s.alt}>
            <img src={s.src} alt={s.alt} className="social-icon" />
          </a>
        ))}
      </div>
    </section>
  );
}
