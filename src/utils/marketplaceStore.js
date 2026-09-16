const PREFIX = 'virexo-marketplace-'

const read = (key, fallback) => {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

// Small deterministic string hash, good enough for a client-side demo account store.
export const hash = (value) => {
  let hashed = 7
  for (const char of value) hashed = (hashed * 31 + char.charCodeAt(0)) | 0
  return `h${hashed}`
}

const day = 86400000

const defaultCandidates = [
  {
    id: 1,
    name: 'Hira Siddiqui',
    role: 'Lead Frontend Developer',
    category: 'Development',
    rate: 5400,
    status: 'In Review',
    experience: '4 yrs',
    matchScore: 97,
    rating: 4.95,
    skills: ['React 19', 'Next.js', 'TypeScript', 'Tailwind', 'Three.js'],
    bio: 'Specialist in high-performance web applications and interactive 3D web interfaces.',
    github: 'https://github.com',
    avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    completedProjects: 14,
    education: 'BS Computer Science, FAST NUCES',
  },
  {
    id: 2,
    name: 'Usman Ghani',
    role: 'Principal Backend Engineer',
    category: 'Development',
    rate: 6800,
    status: 'Shortlisted',
    experience: '6 yrs',
    matchScore: 99,
    rating: 4.98,
    skills: ['Node.js', 'Go', 'Distributed Systems', 'PostgreSQL', 'Docker'],
    bio: 'High-throughput microservices architect with deep experience in event-driven systems.',
    github: 'https://github.com',
    avatarColor: 'linear-gradient(135deg, #38ef7d, #11998e)',
    completedProjects: 22,
    education: 'MS Software Engineering, NUST',
  },
  {
    id: 3,
    name: 'Rabia Basit',
    role: 'Senior Product Designer',
    category: 'Design',
    rate: 5100,
    status: 'Interviewing',
    experience: '5 yrs',
    matchScore: 96,
    rating: 4.92,
    skills: ['Figma', 'Design Systems', 'Micro-interactions', 'User Research'],
    bio: 'Transforms complex enterprise workflows into intuitive, human-centered digital experiences.',
    github: 'https://dribbble.com',
    avatarColor: 'linear-gradient(135deg, #f093fb, #f5576c)',
    completedProjects: 18,
    education: 'BDes Visual Communication, NCA',
  },
  {
    id: 4,
    name: 'Zainab Qazi',
    role: 'AI & LLM Solutions Architect',
    category: 'AI & Data',
    rate: 7500,
    status: 'Shortlisted',
    experience: '5 yrs',
    matchScore: 98,
    rating: 4.99,
    skills: ['PyTorch', 'LangChain', 'OpenAI API', 'Vector DBs', 'Python'],
    bio: 'Pioneered autonomous AI agent pipelines and RAG architectures for banking clients.',
    github: 'https://github.com',
    avatarColor: 'linear-gradient(135deg, #a855f7, #6366f1)',
    completedProjects: 16,
    education: 'PhD candidate Artificial Intelligence, LUMS',
  },
  {
    id: 5,
    name: 'Talha Anwar',
    role: 'Growth & SEO Strategist',
    category: 'Marketing',
    rate: 3800,
    status: 'New',
    experience: '3 yrs',
    matchScore: 89,
    rating: 4.85,
    skills: ['SEO Engine', 'Analytics', 'Conversion Rate Ops', 'Content Funnels'],
    bio: 'Data-driven growth marketer scaling B2B SaaS and marketplace reach by 4x.',
    github: 'https://linkedin.com',
    avatarColor: 'linear-gradient(135deg, #f6d365, #fda085)',
    completedProjects: 9,
    education: 'BBA Marketing, IBA Karachi',
  },
  {
    id: 6,
    name: 'Nida Kamran',
    role: '3D & Motion UI Designer',
    category: 'Design',
    rate: 4600,
    status: 'Shortlisted',
    experience: '5 yrs',
    matchScore: 95,
    rating: 4.94,
    skills: ['Three.js', 'Spline', 'Blender', 'Framer Motion', 'WebXR'],
    bio: 'Creates award-winning web motion, shader effects, and cinematic brand worlds.',
    github: 'https://behance.net',
    avatarColor: 'linear-gradient(135deg, #ff758c, #ff7eb3)',
    completedProjects: 15,
    education: 'BFA Interactive Media, Indus Valley',
  },
  {
    id: 7,
    name: 'Faisal Mehmood',
    role: 'Staff Data Scientist',
    category: 'Consulting',
    rate: 6200,
    status: 'In Review',
    experience: '6 yrs',
    matchScore: 94,
    rating: 4.91,
    skills: ['Machine Learning', 'BigQuery', 'Tableau', 'Predictive Modeling'],
    bio: 'Architect of enterprise business intelligence systems with $10M+ cost attribution impact.',
    github: 'https://github.com',
    avatarColor: 'linear-gradient(135deg, #43e97b, #38f9d7)',
    completedProjects: 20,
    education: 'MS Data Science, ITU',
  },
  {
    id: 8,
    name: 'Amna Riaz',
    role: 'Brand & Content Director',
    category: 'Marketing',
    rate: 4200,
    status: 'Hired',
    experience: '4 yrs',
    matchScore: 93,
    rating: 4.9,
    skills: ['Content Architecture', 'Editorial Direction', 'Copywriting', 'PR'],
    bio: 'Shapes authoritative brand voices and thought-leadership media for tech innovators.',
    github: 'https://medium.com',
    avatarColor: 'linear-gradient(135deg, #fbc2eb, #a6c1ee)',
    completedProjects: 13,
    education: 'MA English Literature & Media',
  },
  {
    id: 9,
    name: 'Junaid Altaf',
    role: 'Cloud DevOps Specialist',
    category: 'Development',
    rate: 7200,
    status: 'Hired',
    experience: '7 yrs',
    matchScore: 98,
    rating: 4.97,
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines', 'Security'],
    bio: 'Maintains 99.99% uptime across multi-region production cloud clusters.',
    github: 'https://github.com',
    avatarColor: 'linear-gradient(135deg, #0ba360, #3cba92)',
    completedProjects: 27,
    education: 'BS Telecommunications, GIKI',
  },
]

const defaultPerformers = [
  {
    id: 'perf-1',
    rank: 1,
    name: 'Ayesha Khan',
    role: 'Principal Software Architect',
    department: 'Development',
    score: 99.8,
    rating: 5.0,
    projectsCompleted: 34,
    onTimeRate: '100%',
    streak: '14 mo streak',
    badges: ['Top Architect', 'Code Velocity', 'Zero-Bug Champion'],
    kudos: 128,
    avatarColor: 'linear-gradient(135deg, #ffd700, #ffaa00)',
    accomplishment: 'Led the zero-downtime banking platform migration for NovaBank with 4.2x speed boost.',
    isPodium: true,
  },
  {
    id: 'perf-2',
    rank: 2,
    name: 'Sara Malik',
    role: 'Head of Product Experience',
    department: 'Design',
    score: 99.4,
    rating: 4.99,
    projectsCompleted: 29,
    onTimeRate: '100%',
    streak: '11 mo streak',
    badges: ['UX Virtuoso', 'Design Pioneer', 'Client Favorite'],
    kudos: 114,
    avatarColor: 'linear-gradient(135deg, #c0c0c0, #e0e0e0)',
    accomplishment: 'Crafted the Aurelia brand design system adopted by 12 cross-functional squads.',
    isPodium: true,
  },
  {
    id: 'perf-3',
    rank: 3,
    name: 'Usman Tariq',
    role: 'Lead AI & Systems Engineer',
    department: 'AI & Systems',
    score: 98.9,
    rating: 4.97,
    projectsCompleted: 26,
    onTimeRate: '98%',
    streak: '9 mo streak',
    badges: ['AI Vanguard', 'Model Optimization', 'Speed Demon'],
    kudos: 96,
    avatarColor: 'linear-gradient(135deg, #cd7f32, #d89659)',
    accomplishment: 'Engineered sub-80ms RAG retrieval system reducing cloud GPU compute costs by 45%.',
    isPodium: true,
  },
  {
    id: 'perf-4',
    rank: 4,
    name: 'Bilal Ahmed',
    role: 'Staff Mobile Engineer',
    department: 'Mobile Apps',
    score: 98.2,
    rating: 4.95,
    projectsCompleted: 23,
    onTimeRate: '97%',
    streak: '7 mo streak',
    badges: ['Flutter Wizard', 'App Store 5-Star'],
    kudos: 82,
    avatarColor: 'linear-gradient(135deg, #00f2fe, #4facfe)',
    accomplishment: 'Shipped Karma Kitchen mobile app with 4.9 App Store rating and zero launch crashes.',
    isPodium: false,
  },
  {
    id: 'perf-5',
    rank: 5,
    name: 'Hina Riaz',
    role: 'Growth Marketing Director',
    department: 'Marketing',
    score: 97.6,
    rating: 4.94,
    projectsCompleted: 20,
    onTimeRate: '99%',
    streak: '8 mo streak',
    badges: ['Conversion King', 'Viral Campaigner'],
    kudos: 74,
    avatarColor: 'linear-gradient(135deg, #f093fb, #f5576c)',
    accomplishment: 'Scaled PulseFit acquisition funnels achieving 320% ROI in Q2.',
    isPodium: false,
  },
  {
    id: 'perf-6',
    rank: 6,
    name: 'Danial Qureshi',
    role: 'Senior Cloud Security Lead',
    department: 'Cloud & DevOps',
    score: 97.1,
    rating: 4.93,
    projectsCompleted: 19,
    onTimeRate: '100%',
    streak: '6 mo streak',
    badges: ['Cloud Guardian', 'Zero-Vulnerability'],
    kudos: 68,
    avatarColor: 'linear-gradient(135deg, #38ef7d, #11998e)',
    accomplishment: 'Passed SOC 2 Type II enterprise compliance audit with zero security non-conformances.',
    isPodium: false,
  },
]

const defaultActivities = [
  { id: 'act-1', type: 'hired', title: 'Candidate Hired', description: 'Amna Riaz accepted the Content Director offer for Virexo Core.', timestamp: Date.now() - 18 * 60 * 1000 },
  { id: 'act-2', type: 'review', title: 'Code Review Passed', description: 'Usman Ghani approved PR #214 for Microservices Gateway v2.', timestamp: Date.now() - 42 * 60 * 1000 },
  { id: 'act-3', type: 'kudos', title: 'Kudos Received', description: 'Sara Malik received +1 Kudos from Client Aurelia.', timestamp: Date.now() - 95 * 60 * 1000 },
  { id: 'act-4', type: 'project', title: 'Sprint Delivered', description: 'NovaBank Digital Platform reached 78% milestone ahead of schedule.', timestamp: Date.now() - 190 * 60 * 1000 },
  { id: 'act-5', type: 'ai', title: 'AI Match Calculated', description: 'Zainab Qazi matched 98% with Meridian Legal autonomous pipeline.', timestamp: Date.now() - 320 * 60 * 1000 },
]

const defaultTasks = [
  { id: 'task-1', title: 'Build Landing Page Component', track: 'Full-Stack', assignee: 'Hira Siddiqui', status: 'Completed', dueDate: '2026-09-05', submittedAt: '2026-09-04', reviewerNote: 'Excellent responsive layout.' },
  { id: 'task-2', title: 'Design System Tokens Setup', track: 'UI/UX', assignee: 'Rabia Basit', status: 'Submitted', dueDate: '2026-09-08', submittedAt: '2026-09-07', reviewerNote: '' },
  { id: 'task-3', title: 'REST API Integration — Auth', track: 'Full-Stack', assignee: 'Usman Ghani', status: 'Submitted', dueDate: '2026-09-09', submittedAt: '2026-09-09', reviewerNote: '' },
  { id: 'task-4', title: 'RAG Pipeline POC', track: 'AI & Data', assignee: 'Zainab Qazi', status: 'In Review', dueDate: '2026-09-10', submittedAt: '2026-09-09', reviewerNote: 'Evaluating retrieval latency.' },
  { id: 'task-5', title: 'Cloud IaC with Terraform', track: 'Cloud & DevOps', assignee: 'Junaid Altaf', status: 'Completed', dueDate: '2026-09-06', submittedAt: '2026-09-05', reviewerNote: 'Zero-drift deployment confirmed.' },
  { id: 'task-6', title: 'Mobile Onboarding UI Flow', track: 'Mobile', assignee: 'Bilal Ahmed', status: 'In Review', dueDate: '2026-09-11', submittedAt: '2026-09-10', reviewerNote: 'Testing on Android.' },
  { id: 'task-7', title: 'SEO Audit & Content Map', track: 'Marketing', assignee: 'Talha Anwar', status: 'Pending', dueDate: '2026-09-14', submittedAt: '', reviewerNote: '' },
  { id: 'task-8', title: 'Motion Design Micro-interactions', track: 'UI/UX', assignee: 'Nida Kamran', status: 'Submitted', dueDate: '2026-09-12', submittedAt: '2026-09-12', reviewerNote: '' },
  { id: 'task-9', title: 'Data Visualisation Dashboard', track: 'AI & Data', assignee: 'Faisal Mehmood', status: 'Pending', dueDate: '2026-09-15', submittedAt: '', reviewerNote: '' },
  { id: 'task-10', title: 'Brand Content Sprint', track: 'Marketing', assignee: 'Amna Riaz', status: 'Completed', dueDate: '2026-09-04', submittedAt: '2026-09-03', reviewerNote: 'Published successfully.' },
  { id: 'task-11', title: 'Security Penetration Test', track: 'Cloud & DevOps', assignee: 'Danial Qureshi', status: 'Pending', dueDate: '2026-09-16', submittedAt: '', reviewerNote: '' },
]

function seedIfEmpty() {
  if (!read('users', null)) {
    write('users', [
      { name: 'Ayesha Raza', email: 'demo@virexo.com', password: hash('virexo123'), role: 'Executive Partner' },
      { name: 'Hamza Farooq', email: 'hr@virexo.com', password: hash('virexo123'), role: 'Head of Talent' },
    ])
  }
  if (!read('requests', null)) {
    write('requests', [
      { id: 'VX-1036', name: 'Bilal Enterprises', email: 'ops@bilalent.com', category: 'Web Development', provider: 'Ayesha Khan', complexity: 'Advanced', total: 8350, createdAt: Date.now() - 12 * day },
      { id: 'VX-1037', name: 'Cotton & Co', email: 'hi@cottonco.pk', category: 'UI/UX Design', provider: 'Sara Malik', complexity: 'Standard', total: 3420, createdAt: Date.now() - 9 * day },
      { id: 'VX-1038', name: 'PulseFit', email: 'growth@pulsefit.io', category: 'Marketing', provider: 'Hina Riaz', complexity: 'Standard', total: 2520, createdAt: Date.now() - 7 * day },
      { id: 'VX-1039', name: 'Meridian Legal', email: 'cto@meridian.legal', category: 'Data & AI', provider: 'Usman Tariq', complexity: 'Basic', total: 3600, createdAt: Date.now() - 5 * day },
      { id: 'VX-1040', name: 'Karma Kitchen', email: 'hello@karmakitchen.co', category: 'Mobile Apps', provider: 'Bilal Ahmed', complexity: 'Standard', total: 5760, createdAt: Date.now() - 3 * day },
    ])
  }
  const storedCandidates = read('candidates', null)
  if (!storedCandidates || storedCandidates.length < 9 || !storedCandidates[0].skills) {
    write('candidates', defaultCandidates)
  }
  if (!read('performers', null)) {
    write('performers', defaultPerformers)
  }
  if (!read('activities', null)) {
    write('activities', defaultActivities)
  }
  if (!read('projects', null)) {
    write('projects', [
      { id: 'p1', name: 'NovaBank Digital Platform', client: 'NovaBank', category: 'Development', progress: 78, status: 'In Progress', due: 'Mar 18', team: ['SM', 'BH', 'ZR'] },
      { id: 'p2', name: 'Aurelia Brand System', client: 'Aurelia', category: 'Design', progress: 100, status: 'Completed', due: 'Shipped', team: ['DR', 'ZA'] },
      { id: 'p3', name: 'PulseFit Growth Sprint', client: 'PulseFit', category: 'Marketing', progress: 45, status: 'In Progress', due: 'Apr 02', team: ['AN', 'TA'] },
      { id: 'p4', name: 'Marketplace Platform v2', client: 'Virexo Core', category: 'Development', progress: 62, status: 'In Review', due: 'May 09', team: ['SM', 'JA'] },
      { id: 'p5', name: 'Helios Design Language', client: 'Helios Labs', category: 'Design', progress: 88, status: 'In Progress', due: 'Mar 30', team: ['ZA', 'NB'] },
    ])
  }
  if (!read('tasks', null)) {
    write('tasks', defaultTasks)
  }
}

seedIfEmpty()

export const authStore = {
  getUsers: () => read('users', []),
  saveUsers: (users) => write('users', users),
  getSession: () => read('session', null),
  setSession: (session) => write('session', session),
  clearSession: () => window.localStorage.removeItem(`${PREFIX}session`),
  hash,
}

export const dataStore = {
  getRequests: () => read('requests', []),
  addRequest: (request) => {
    const requests = [request, ...read('requests', [])]
    write('requests', requests)
    return requests
  },
  getCandidates: () => read('candidates', defaultCandidates),
  saveCandidates: (candidates) => write('candidates', candidates),
  getPerformers: () => read('performers', defaultPerformers),
  savePerformers: (performers) => write('performers', performers),
  addKudos: (performerId) => {
    const performers = read('performers', defaultPerformers)
    const next = performers.map((item) => (item.id === performerId ? { ...item, kudos: (item.kudos || 0) + 1 } : item))
    write('performers', next)
    return next
  },
  getActivities: () => read('activities', defaultActivities),
  logActivity: (activity) => {
    const activities = [{ id: `act-${Date.now()}`, timestamp: Date.now(), ...activity }, ...read('activities', defaultActivities).slice(0, 19)]
    write('activities', activities)
    return activities
  },
  getProjects: () => read('projects', []),
  saveProjects: (projects) => write('projects', projects),
  getTasks: () => read('tasks', defaultTasks),
  saveTasks: (tasks) => write('tasks', tasks),
}
