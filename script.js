// Global Variables
const particles = document.querySelectorAll('.particle');

// Debounce Utility for Performance
function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// Hamburger Menu Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Add overlay for mobile menu
        if (navLinks.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });
}

// Smooth Scrolling with Minimal Offset (Nav is Static)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 20; // Reduced offset for static nav
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        // Close mobile menu
        if (hamburger && navLinks) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
});

// Form Submission with Fetch API (No Reload)
const contactForm = document.querySelector('form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            
            if (response.ok) {
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'success-message';
                successMsg.innerHTML = '<i class="fas fa-check-circle"></i> Thank you! Your message has been sent successfully. I\'ll get back to you soon.';
                contactForm.appendChild(successMsg);
                
                // Reset form
                contactForm.reset();
            } else {
                throw new Error('Submission failed');
            }
        } catch (error) {
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.style.cssText = 'background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 15px; border-radius: 10px; margin-top: 15px; text-align: center; font-weight: bold;';
            errorMsg.innerHTML = '<i class="fas fa-exclamation-triangle"></i> Oops! Something went wrong. Please try again.';
            contactForm.appendChild(errorMsg);
            
            setTimeout(() => errorMsg.remove(), 5000);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Remove success message after 5s if present
            setTimeout(() => {
                const msg = contactForm.querySelector('.success-message');
                if (msg) msg.remove();
            }, 5000);
        }
    });
}

// Typing Effect for Hero Name
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Enhanced Fade-in Animations with Stagger
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100); // Stagger effect
        }
    });
}, observerOptions);

document.querySelectorAll('[data-animate]').forEach(el => {
    fadeObserver.observe(el);
});

// Progress Bar Animation - Fixed Label Creation/Update
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const fills = entry.target.querySelectorAll('.progress-fill');
            const skillNames = entry.target.querySelectorAll('.skill-name');
            
            fills.forEach((fill, index) => {
                const targetWidth = parseInt(fill.dataset.width) || 0;
                const label = skillNames[index]?.querySelector('.progress-label');
                
                if (!label) return; // Skip if no label
                
                fill.style.width = '0%';
                label.textContent = '0%';
                label.style.opacity = '1'; // Show label
                
                // Animate to target width
                let currentWidth = 0;
                const animateWidth = () => {
                    if (currentWidth <= targetWidth) {
                        currentWidth += 1;
                        fill.style.width = currentWidth + '%';
                        label.textContent = currentWidth + '%';
                        
                        requestAnimationFrame(animateWidth);
                    } else {
                        label.textContent = targetWidth + '%'; // Ensure final value
                    }
                };
                
                setTimeout(() => animateWidth(), 300);
            });
            
            // Unobserve after animation
            progressObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.skills-category').forEach(cat => {
    progressObserver.observe(cat);
});

// Parallax Effect for Hero Background - Debounced
const handleScroll = debounce(() => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('.hero-bg');
    if (parallax) {
        const speed = scrolled * 0.5;
        parallax.style.transform = `translateY(${speed}px)`;
    }
    
    // Navbar background opacity on scroll (even static, subtle change)
    const nav = document.querySelector('nav');
    if (nav && scrolled > 50) {
        nav.style.background = 'rgba(17, 17, 17, 0.98)';
    } else if (nav) {
        nav.style.background = 'rgba(17, 17, 17, 0.95)';
    }
    
    // Back to Top
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        if (scrolled > 300) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    }
}, 16); // ~60fps

window.addEventListener('scroll', handleScroll);

// Particle Animation Enhancement
function animateParticles() {
    particles.forEach((particle, index) => {
        const size = Math.random() * 5 + 2;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
        particle.style.animationDelay = (Math.random() * 2) + 's';
        particle.style.opacity = Math.random() * 0.6 + 0.2;
    });
}

// Back to Top Button
function createBackToTop() {
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    btn.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    document.body.appendChild(btn);
}

// Intersection Observer for Section Icons Animation
const iconObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const icon = entry.target.querySelector('.section-icon');
            if (icon) {
                icon.style.animationPlayState = 'running';
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('section').forEach(section => {
    iconObserver.observe(section);
});

// Enhanced Mobile Menu with Smooth Height
function adjustMobileMenu() {
    if (window.innerWidth <= 768 && navLinks) {
        const links = navLinks.querySelectorAll('li');
        let height = 0;
        links.forEach(link => {
            height += link.offsetHeight + 10; // Gap
        });
        navLinks.style.maxHeight = navLinks.classList.contains('active') ? height + 'px' : '0px';
    } else if (navLinks) {
        navLinks.style.maxHeight = 'none';
    }
}

const debouncedResize = debounce(adjustMobileMenu, 250);
window.addEventListener('resize', debouncedResize);

// Preloader - Improved Timing
function initPreloader() {
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="loader">
            <i class="fas fa-dna fa-spin"></i>
            <p>Loading Portfolio...</p>
        </div>
    `;
    document.body.appendChild(preloader);
    
    window.addEventListener('load', () => {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
    });
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Theme: Permanently Dark - No toggle or localStorage
    // (Body starts without light-mode class)
    
    // Typing Effect
    const heroName = document.querySelector('.hero-name');
    if (heroName) {
        const fullName = heroName.textContent;
        heroName.textContent = '';
        setTimeout(() => typeWriter(heroName, fullName, 150), 500);
    }
    
    // Particles
    animateParticles();
    setInterval(animateParticles, 5000);
    
    // Back to Top
    createBackToTop();
    
    // Mobile Menu
    adjustMobileMenu();
    
    // Preloader
    initPreloader();
    
    // Respect Reduced Motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.style.setProperty('--transition-all', 'none');
    }
});

// Export functions for potential external use
window.portfolioUtils = {
    typeWriter,
    animateParticles
};