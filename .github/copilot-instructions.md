# AI Coding Agent Instructions – Krishna Portfolio

## Project Overview
Personal portfolio website for G. Krishna Teja (Integrated M.Sc. Biotechnology student at VIT, CGPA: 9.04). The site showcases academic achievements, research publications, internships, projects, leadership experience, skills, and community involvement. It is built as a modern full-stack web application with React + Vite frontend, Vercel Serverless/Edge backend, MongoDB Atlas database, and NVIDIA NIM AI services.

## Architecture & Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing & State**: Single-page application with modular sections in `src/sections/`, reusable modals & widgets in `src/components/`
- **Styling**: Luxury Black & Gold theme defined in `src/index.css`, `src/features.css`, `src/right-dock.css`
- **PWA**: Service Worker (`/sw.js`) registered in `src/main.jsx`
- **Build tool**: Vite (`npm run build` -> `dist/`)

### Backend & API
- **Deployment**: Vercel Serverless Functions (`/api/` folder configured in `vercel.json`)
- **Database**: MongoDB Atlas (`trackingDB` database: `submissions`, `doubts`, `vault`, `analytics`, `activity_log`, `settings`, `auth` collections)
- **Email Service**: Nodemailer (Gmail App Password) for notifications, automated confirmations, QR and barcode attachments
- **Meeting & Jitsi**: Automated video meeting room generation (`meet.jit.si`)

### AI Integration
- **Provider**: NVIDIA NIM API (`https://integrate.api.nvidia.com/v1`)
- **Primary Model**: `nvidia/nemotron-3.5-bolt-e4b` (fast, high quality, 200 OK verified)
- **AI Features**:
  1. AI Portfolio Chat Assistant with RAG knowledge base (`src/data/knowledgeBase.js`, `src/utils/ragUtils.js`, `api/chat.js`)
  2. Voice Assistant with speech synthesis and voice commands (`api/voice.js`, `src/utils/voiceCommands.js`)
  3. AI Bio Summarizer tailored by persona (`src/components/AIBioSummarizer.jsx`)
  4. AI Resume Builder & Tailor (`src/components/AIResumeBuilder.jsx`, `api/tailor-resume.js`)
  5. AI Cover Letter Generator (`src/components/CoverLetterGenerator.jsx`)
  6. Super Tools Modal AI functions (`src/components/SuperToolsModal.jsx`)

### Key Directories & Files
- `src/App.jsx` – Main app root managing modals and section rendering
- `src/sections/` – Hero, About, Experience, Internships, Research, Projects, Education, Skills, Career, Certifications, Languages, Testimonials, Media, Resume, Contact
- `src/components/` – RightDock, Sidebar, Preloader, MeetingScheduler, TrackingWidget, DoubtsForm, VaultModal, AdminDashboard, GitHubStats, GitHubHeatmap, AIBioSummarizer, etc.
- `src/data/knowledgeBase.js` – Comprehensive portfolio knowledge chunks for RAG
- `api/` – Serverless routes: `chat.js`, `tailor-resume.js`, `voice.js`, `submit-form.js`, `track.js`, `availability.js`, `analytics.js`, `doubts.js`, `testimonials.js`, `slots.js`, `admin.js`, `compile-pdf-api.js`

## Design System (Immutable)
| Element | Color | Hex |
|---------|-------|-----|
| Background | Pure / Deep Black | `#000000`, `#0a0a0a`, `#111111` |
| Primary Accent | Classic Gold | `#D4AF37` |
| Secondary Accent | Gold Dim / Hover | `rgba(212, 175, 55, 0.15–0.4)` |
| Text Main | Silver / White | `#ffffff`, `#e5e7eb`, `#C0C0C0` |
| Surface Containers | Dark Glass / Card | `var(--surface)`, `var(--surface-2)` |

**Constraint**: Never alter the luxury black & gold aesthetic. Maintain high contrast, clean typography, and elegant borders.

## Development & Build Rules
- Build command: `npm run build`
- Always verify builds compile with zero errors before committing.
- Do not hardcode secret keys without fallback handling, and never leak unauthenticated write routes.
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
