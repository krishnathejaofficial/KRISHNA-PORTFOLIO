// Voice command parser — maps spoken phrases to section IDs and responses

export const SECTION_MAP = [
  { id: 'home',           keywords: ['home', 'top', 'start', 'beginning', 'welcome'],           reply: "Sure! Taking you to the top." },
  { id: 'about',          keywords: ['about', 'who are you', 'bio', 'yourself', 'introduction'], reply: "Here's my About section." },
  { id: 'career',         keywords: ['career', 'interest', 'goals', 'objective'],                reply: "Here are my career interests." },
  { id: 'education',      keywords: ['education', 'study', 'college', 'school', 'degree', 'vit', 'cgpa', 'qualify'], reply: "Here's my educational background." },
  { id: 'research',       keywords: ['research', 'paper', 'manuscript', 'aquaculture', 'ewaste', 'publication', 'lab'], reply: "Let me show you my research work." },
  { id: 'internships',    keywords: ['intern', 'internship', 'industrial', 'pharma', 'training', 'company'], reply: "Here are my internship experiences." },
  { id: 'projects',       keywords: ['project', 'built', 'build', 'made', 'created', 'developed', 'application', 'tool', 'software', 'app'], reply: "Let me show you my technical projects." },
  { id: 'skills',         keywords: ['skill', 'ability', 'technology', 'expertise', 'know', 'capable', 'proficient', 'bioinformatics', 'molecular', 'programming'], reply: "Here are my skills." },
  { id: 'experience',     keywords: ['leadership', 'leader', 'nss', 'riviera', 'finance', 'volunteer', 'gravitas', 'manage', 'biosummit'], reply: "Here's my leadership experience." },
  { id: 'certifications', keywords: ['achievement', 'award', 'certificate', 'prize', 'honor', 'winner', 'recognition'], reply: "Here are my achievements and awards." },
  { id: 'languages',      keywords: ['language', 'speak', 'telugu', 'english', 'tamil', 'hindi'],reply: "Here are the languages I speak." },
  { id: 'media',          keywords: ['media', 'youtube', 'instagram', 'digital', 'content', 'audience'], reply: "Here's my digital media presence." },
  { id: 'resume',         keywords: ['resume', 'cv', 'download', 'pdf'],                         reply: "Here's where you can download my resume." },
  { id: 'contact',        keywords: ['contact', 'reach', 'email', 'phone', 'message', 'hire', 'connect'], reply: "Here's how to contact me." },
];

/**
 * Parse a voice transcript and return the best matching section, or null.
 * @param {string} transcript
 * @returns {{ id: string, reply: string } | null}
 */
export function parseCommand(transcript) {
  const lower = transcript.toLowerCase().trim();

  // Direct "stop / cancel / close" commands
  if (['stop', 'cancel', 'close', 'quit', 'exit', 'never mind'].some(w => lower.includes(w))) {
    return { id: null, reply: "Got it, stopping voice navigation." };
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const section of SECTION_MAP) {
    for (const keyword of section.keywords) {
      if (lower.includes(keyword)) {
        // Prefer longer keyword matches (more specific)
        if (keyword.length > bestScore) {
          bestScore = keyword.length;
          bestMatch = section;
        }
      }
    }
  }

  return bestMatch;
}

/**
 * Scroll smoothly to a section by ID.
 */
export function navigateTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
