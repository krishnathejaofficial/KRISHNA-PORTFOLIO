// Voice command parser — maps spoken phrases to section IDs and responses

export const SECTION_MAP = [
  { id: 'home',           keywords: ['home', 'top', 'start', 'beginning', 'welcome'],           reply: "Sure! Taking you to the top." },
  { id: 'about',          keywords: ['about', 'who are you', 'bio', 'yourself', 'introduction'], reply: "Here's my About section." },
  { id: 'career',         keywords: ['career', 'interest', 'goals', 'objective'],                reply: "Here are my career interests." },
  { id: 'education',      keywords: ['education', 'study', 'college', 'school', 'degree', 'vit', 'cgpa', 'qualify'], reply: "Here's my educational background." },
  { id: 'research',       keywords: ['research', 'paper', 'manuscript', 'aquaculture', 'ewaste', 'publication', 'lab'], reply: "Let me show you my research work." },
  { id: 'internships',    keywords: ['intern', 'internship', 'industrial', 'pharma', 'training', 'company'], reply: "Here are my internship experiences." },
  { id: 'projects',       keywords: ['projects section', 'show projects', 'go to projects'],     reply: "Let me show you my technical projects." },
  { id: 'skills',         keywords: ['skills section', 'show skills', 'go to skills'],           reply: "Here are my skills." },
  { id: 'experience',     keywords: ['leadership', 'leader', 'nss', 'riviera', 'finance', 'volunteer', 'gravitas', 'manage', 'biosummit'], reply: "Here's my leadership experience." },
  { id: 'certifications', keywords: ['achievement', 'award', 'certificate', 'prize', 'honor', 'winner', 'recognition'], reply: "Here are my achievements and awards." },
  { id: 'languages',      keywords: ['languages section', 'show languages'],                     reply: "Here are the languages I speak." },
  { id: 'media',          keywords: ['media', 'youtube', 'instagram', 'digital', 'content', 'audience'], reply: "Here's my digital media presence." },
  { id: 'resume',         keywords: ['resume', 'cv', 'download', 'pdf'],                         reply: "Here's where you can download my resume." },
  { id: 'contact',        keywords: ['contact', 'reach', 'email', 'phone', 'message', 'hire', 'connect'], reply: "Here's how to contact me." },
];

// Words that strongly signal a NAVIGATION intent
const NAV_TRIGGERS = ['go to', 'show me', 'navigate to', 'scroll to', 'take me to', 'open', 'jump to'];

// Words that strongly signal a QUESTION / AI intent
const QUESTION_TRIGGERS = [
  'what', 'who', 'where', 'when', 'why', 'how', 'tell me', 'describe',
  'explain', 'list', 'give me', 'do you', 'are you', 'have you', 'can you',
  'did you', 'which', 'is your', 'were you', 'about your', 'your cgpa',
  'your gpa', 'your project', 'your skill', 'your research', 'your experience',
  'qualify', 'studied', 'built', 'made', 'created', 'developed', 'achieved',
];

/**
 * Determines if a transcript is a navigation command or a question.
 * Returns: 'navigate' | 'question' | 'unknown'
 */
export function classifyIntent(transcript) {
  const lower = transcript.toLowerCase().trim();

  // Check for explicit navigation triggers first
  if (NAV_TRIGGERS.some(t => lower.startsWith(t) || lower.includes(t))) {
    return 'navigate';
  }

  // Check for question triggers
  if (QUESTION_TRIGGERS.some(t => lower.includes(t))) {
    return 'question';
  }

  // If it's a short phrase (1-2 words), likely a navigation command
  const wordCount = lower.split(/\s+/).length;
  if (wordCount <= 2) return 'navigate';

  // Longer phrases without nav triggers are probably questions
  return 'question';
}

/**
 * Parse a voice transcript and return the best matching section, or null.
 */
export function parseCommand(transcript) {
  const lower = transcript.toLowerCase().trim();

  if (['stop', 'cancel', 'close', 'quit', 'exit', 'never mind'].some(w => lower.includes(w))) {
    return { id: null, reply: "Got it, stopping voice navigation." };
  }

  let bestMatch = null;
  let bestScore = 0;

  for (const section of SECTION_MAP) {
    for (const keyword of section.keywords) {
      if (lower.includes(keyword)) {
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
