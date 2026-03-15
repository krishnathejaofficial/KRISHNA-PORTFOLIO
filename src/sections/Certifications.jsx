import { useEffect, useRef } from 'react';

export default function Certifications() {
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach((e, idx) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('visible'), idx * 80); obs.unobserve(e.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    ref.current?.querySelectorAll('[data-animate]').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const certs = [
    { icon: 'fa-trophy', text: '100% Attendance Award, VIT, Jun 2023 (₹1000)' },
    { icon: 'fa-trophy', text: '100% Attendance Award, VIT, Jun 2025 (₹1000)' },
    { icon: 'fa-medal', text: 'Water Conservation Ideathon — 3rd Place, VIT, Mar 2023' },
    { icon: 'fa-briefcase', text: 'Industrial Intern — Glory Pharma Chem India Pvt Ltd, Jun 2025' },
    { icon: 'fa-briefcase', text: 'Industrial Intern — GSK Technologies Pvt Ltd, Jul 2024' },
    { icon: 'fa-building', text: 'Industrial Visit — STHREE Chemicals Pvt Ltd, Nov 2024' },
    { icon: 'fa-heart', text: 'Blood Donation Certificate, NSS VIT, Aug 2024' },
    { icon: 'fa-heart', text: 'Blood Donation Certificate, NSS VIT, Dec 2024' },
    { icon: 'fa-chart-line', text: "Finance Manager — Riviera'25 & Riviera'26, VIT" },
    { icon: 'fa-shopping-cart', text: "Purchase Coordinator — Gravitas'24, VIT, Oct 2024" },
    { icon: 'fa-users', text: 'NSS Secretary Board Member, VIT, 2025' },
    { icon: 'fa-microphone', text: 'Student Organizer, VIT Biosummit 2023 & 2024' },
    { icon: 'fa-campground', text: 'Student Advisory/Organiser/Coordinator/Volunteer — NSS Camps 2023, 2024, 2025, 2026' },
    { icon: 'fa-dna', text: 'Student Coordinator — DNA Day 2024, VIT' },
  ];

  return (
    <section id="certifications" ref={ref}>
      <div className="section-icon"><i className="fas fa-medal" /></div>
      <h2>Certifications &amp; Awards</h2>
      <div className="section-divider" />
      <div className="cert-grid">
        {certs.map((c, i) => (
          <div className="cert-card" data-animate key={i}>
            <i className={`fas ${c.icon}`} />
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
