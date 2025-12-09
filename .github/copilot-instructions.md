# AI Coding Agent Instructions – Krishna Portfolio

## Project Overview
A personal portfolio website for G. Krishna Teja (Integrated M.Sc. Biotechnology student at VIT). The site showcases academic achievements, projects, experience, skills, and community involvement. It's a **static, client-side only** website with no backend services or build process.

## Architecture & Key Patterns

### File Organization
- **`index.html`** – Single-page structure with semantic sections anchored by IDs (`#hero`, `#about`, `#projects`, etc.)
- **`style.css`** – All styling; uses a **luxury black & gold theme** (background: `#000000`, accents: `#D4AF37`, text: `#C0C0C0`)
- **`script.js`** – Lightweight DOM utilities; no external libraries or frameworks
- **`images/`** – Profile photos and assets

### Design Philosophy
- **Single-page app**: Navigation links use anchor scrolling to section IDs with smooth behavior
- **No build process**: Changes to any file are immediately visible—no compilation or bundling
- **Progressive enhancement**: Canvas particles and flip-card animations degrade gracefully
- **Mobile-responsive**: Media queries adjust layout for `max-width: 768px`

## Key Technical Patterns

### 1. Smooth Scrolling & Navigation
All internal links (`href="#section-id"`) trigger browser smooth scrolling via JavaScript:
```javascript
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});
```
**When modifying**: Ensure new sections have matching IDs in both HTML and nav links.

### 2. Animated Particle Effect (Hero Section)
Canvas-based animation in hero section (`#hero`):
- 100 particles with random gold/silver colors cycling upward
- Respawns at bottom when reaching top
- Resizes on window resize
- **Key file**: `script.js` lines 10–35

**When adding sections**: Don't add additional canvas elements; reuse the existing pattern only in hero.

### 3. Flip-Card Components
3D CSS flip animation for projects/experience:
```html
<div class="flip-card">
    <div class="flip-card-inner">
        <div class="flip-card-front"><!-- Title --></div>
        <div class="flip-card-back"><!-- Details --></div>
    </div>
</div>
```
- Triggered on `:hover` with `transform: rotateY(180deg)`
- Front: dark background, silver text
- Back: darker background, gold text
- **File**: `style.css` lines 118–140

**When adding cards**: Use exact class names; break on mobile (`width: 100%` at `768px`).

### 4. Color Scheme (Immutable)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Black gradient | `#000000`, `#111111`, `#222222` |
| Primary accent | Gold | `#D4AF37` |
| Text | Silver | `#C0C0C0` |
| Borders/Highlights | Gold | `#D4AF37` |

**When styling**: Never use other color schemes; maintain luxury aesthetic throughout.

### 5. Animated Background Gradient
`body` has a looping gradient animation (10s cycle) via `@keyframes gradientAnimation`. This is decorative; don't interfere with content visibility.

## Content Structure
Sections in order (reflect in nav):
1. **Hero** – Intro, CTA to portfolio
2. **About** – Brief bio
3. **Projects** – 4 flip-cards (E-waste, NSS Blood Donation, Aquaculture, Water Conservation)
4. **Education** – 3 education entries
5. **Experience** – 4 flip-cards (Riviera'25, Gravitas'24, NSS Secretary, Biosummit)
6. **Skills** – 5 categories (Management, Technical, Biotech, Bioinformatics, Industrial)
7. **Certifications** – Bulleted list
8. **Clubs** – Bulleted list
9. **Contact** – Form + contact info
10. **Footer** – Copyright

**When modifying content**: Keep section order consistent with nav and HTML structure.

## Common Tasks

### Adding a New Project Card
1. Add entry in `#projects` section as a `flip-card` div
2. Update nav link if creating new section (rare)
3. Keep class names: `project-item`, `flip-card`, `flip-card-inner`, `flip-card-front`, `flip-card-back`
4. Example:
```html
<div class="project-item flip-card">
    <div class="flip-card-inner">
        <div class="flip-card-front">
            <h3>Project Title</h3>
            <p>Timeline</p>
        </div>
        <div class="flip-card-back">
            <p>Description here</p>
        </div>
    </div>
</div>
```

### Adding a New Section
1. Add `<section id="new-section">` to HTML
2. Add nav link: `<li><a href="#new-section">Label</a></li>`
3. Style inherits from global `section` class (fade-in, padding, min-height)
4. Override with `#new-section { /* custom styles */ }` in CSS
5. Ensure responsive behavior for mobile

### Updating Contact Information
- Update email/phone in `#contact` section (appears twice: form hint area and footer paragraph)
- LinkedIn URL in same paragraph

### Responsive Design
- **Breakpoint**: `@media (max-width: 768px)`
- **Applies**: Nav flex-direction column, flip-cards 100% width
- **When modifying**: Test both desktop and mobile viewports

## No Build/Dependencies
- ✅ Works directly in browser—open `index.html` in any modern browser
- ❌ No npm, no build tools, no external CDNs
- ❌ No external libraries (jQuery, Bootstrap, etc.)
- **Canvas API** and **CSS transforms** are native browser features

## Performance Considerations
- Canvas animation runs via `requestAnimationFrame` for smooth 60fps
- Particles respawn to prevent memory leaks
- CSS animations use GPU-accelerated transforms (flip, pulse)
- No lazy-loading needed for single page

## Known Limitations & Edge Cases
1. **Contact form** – Currently demo only (`alert('Message sent! (Demo)')`); production would require backend email service
2. **Mobile nav** – Stacks vertically; consider hamburger menu if more sections added
3. **Image assets** – Two images in `/images/`; ensure paths are relative (`images/filename.jpg`)
4. **Canvas resize** – Only handles hero section; won't break if removed

## Debugging Checklist
- **Links not smooth-scrolling?** Check section IDs match `href` anchors
- **Colors wrong?** Search CSS for hardcoded colors and revert to theme (gold/silver/black)
- **Flip cards not working?** Verify hover state and 3D transform CSS
- **Particles missing?** Canvas may not initialize on mobile; check browser console
- **Layout broken on mobile?** Check media query breakpoint and flex-direction rules

---

**Last Updated**: December 2025  
**Scope**: Static portfolio site (no backend, no API)  
**Recommended Edits**: Content updates, card additions, responsive refinements
