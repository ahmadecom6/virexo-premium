const STORAGE_KEY = 'virexo-internship-state'
const listeners = new Set()

const today = new Date()
const isoDate = (date) => date.toISOString().slice(0, 10)
const daysFromToday = (days) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return isoDate(date)
}

const seedCandidates = [
  ['Hira Siddiqui', 'hira@virexo.com', 'Full-Stack', '2026-08-04', 'Ayesha Raza', 'Active'],
  ['Usman Ghani', 'usman@virexo.com', 'Full-Stack', '2026-08-05', 'Ayesha Raza', 'Active'],
  ['Rabia Basit', 'rabia@virexo.com', 'UI/UX', '2026-08-06', 'Hamza Farooq', 'Active'],
  ['Zainab Qazi', 'zainab@virexo.com', 'AI & Data', '2026-08-07', 'Ayesha Raza', 'Active'],
  ['Talha Anwar', 'talha@virexo.com', 'Marketing', '2026-08-08', 'Hamza Farooq', 'Active'],
  ['Nida Kamran', 'nida@virexo.com', 'UI/UX', '2026-08-11', 'Hamza Farooq', 'Active'],
  ['Faisal Mehmood', 'faisal@virexo.com', 'AI & Data', '2026-08-12', 'Ayesha Raza', 'Active'],
  ['Amna Riaz', 'amna@virexo.com', 'Marketing', '2026-08-13', 'Hamza Farooq', 'Completed'],
  ['Junaid Altaf', 'junaid@virexo.com', 'Cloud & DevOps', '2026-08-14', 'Ayesha Raza', 'Active'],
]

const seedTasks = seedCandidates.flatMap(([name], index) => [
  {
    id: `intern-task-${index + 1}-a`,
    candidateId: `intern-candidate-${index + 1}`,
    title: `${name}: weekly delivery sprint`,
    description: 'Complete the assigned internship sprint and submit the work for review.',
    dueDate: daysFromToday(index % 3 === 0 ? -2 : 4),
    status: index % 4 === 0 ? 'Reviewed' : index % 3 === 0 ? 'Submitted' : 'Pending',
    submittedDate: index % 3 === 0 ? daysFromToday(-1) : '',
    feedback: index % 4 === 0 ? 'Good progress and clear documentation.' : '',
  },
  {
    id: `intern-task-${index + 1}-b`,
    candidateId: `intern-candidate-${index + 1}`,
    title: `${name}: reflection and progress notes`,
    description: 'Document learnings, blockers, and next steps for the weekly check-in.',
    dueDate: daysFromToday(7),
    status: index % 5 === 0 ? 'Submitted' : 'Pending',
    submittedDate: index % 5 === 0 ? daysFromToday(-1) : '',
    feedback: '',
  },
])

const seedProgress = seedCandidates.flatMap(([, , , , ,], index) =>
  [1, 2, 3, 4].map((week) => ({
    id: `intern-progress-${index + 1}-${week}`,
    candidateId: `intern-candidate-${index + 1}`,
    week,
    tasksCompleted: Math.min(week + (index % 2), 5),
    tasksTotal: 5,
    hoursLogged: 12 + week * 2 + index,
    notes: week === 4 ? 'Building confidence and improving delivery rhythm.' : 'Weekly check-in recorded.',
  }))
)

const initialState = {
  candidates: seedCandidates.map(([name, email, department, joinDate, supervisor, status], index) => ({
    id: `intern-candidate-${index + 1}`, name, email, department, status, joinDate, supervisor,
  })),
  tasks: seedTasks,
  progress: seedProgress,
  activity: [{
    id: 'intern-activity-seed',
    type: 'system',
    message: 'Internship cohort workspace initialized.',
    timestamp: Date.now(),
  }],
}

const clone = (value) => JSON.parse(JSON.stringify(value))

function readState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : clone(initialState)
  } catch {
    return clone(initialState)
  }
}

let state = readState()

function persist() {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('portal:data-changed', { detail: clone(state) }))
  listeners.forEach((listener) => listener(clone(state)))
}

function record(message, type = 'activity') {
  state.activity = [{ id: `intern-activity-${Date.now()}`, type, message, timestamp: Date.now() }, ...state.activity].slice(0, 8)
}

function update(mutator, message, type) {
  state = mutator(clone(state))
  if (message) record(message, type)
  persist()
  return clone(state)
}

export const internshipStore = {
  getState: () => clone(state),
  getCandidates: () => clone(state.candidates),
  getTasks: () => clone(state.tasks),
  getProgress: () => clone(state.progress),
  getActivity: () => clone(state.activity),
  getSnapshot: () => state,
  subscribe: (listener) => {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  refresh: () => {
    state = readState()
    listeners.forEach((listener) => listener())
    window.dispatchEvent(new CustomEvent('portal:data-changed', { detail: clone(state) }))
    return clone(state)
  },
  addCandidate: (candidate) => update((next) => ({ ...next, candidates: [...next.candidates, candidate] }), `Candidate added: ${candidate.name}`, 'candidate'),
  updateCandidate: (id, changes) => update((next) => ({ ...next, candidates: next.candidates.map((candidate) => candidate.id === id ? { ...candidate, ...changes } : candidate) }), `Candidate updated: ${changes.name || id}`, 'candidate'),
  deleteCandidate: (id) => update((next) => ({ ...next, candidates: next.candidates.filter((candidate) => candidate.id !== id), tasks: next.tasks.filter((task) => task.candidateId !== id), progress: next.progress.filter((entry) => entry.candidateId !== id) }), `Candidate removed: ${id}`, 'candidate'),
  addTask: (task) => update((next) => ({ ...next, tasks: [...next.tasks, task] }), `Task added: ${task.title}`, 'task'),
  deleteTask: (id) => update((next) => ({ ...next, tasks: next.tasks.filter((task) => task.id !== id) }), `Task removed: ${id}`, 'task'),
  updateTaskStatus: (id, status, feedback = '') => update((next) => ({ ...next, tasks: next.tasks.map((task) => task.id === id ? { ...task, status, feedback, submittedDate: status === 'Submitted' ? isoDate(new Date()) : task.submittedDate } : task) }), `Task marked ${status}: ${id}`, 'task'),
  bulkSubmit: (ids) => update((next) => ({ ...next, tasks: next.tasks.map((task) => ids.includes(task.id) && task.status === 'Pending' ? { ...task, status: 'Submitted', submittedDate: isoDate(new Date()) } : task) }), `${ids.length} task(s) submitted`, 'task'),
  addProgress: (entry) => update((next) => ({ ...next, progress: [...next.progress, entry] }), `Progress logged for ${entry.candidateId}`, 'progress'),
  updateProgress: (id, changes) => update((next) => ({ ...next, progress: next.progress.map((entry) => entry.id === id ? { ...entry, ...changes } : entry) }), `Progress entry updated: ${id}`, 'progress'),
  deleteProgress: (id) => update((next) => ({ ...next, progress: next.progress.filter((entry) => entry.id !== id) }), `Progress entry removed: ${id}`, 'progress'),
  addActivity: (message, type = 'activity') => update((next) => next, message, type),
  exportCsv: (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  },
}
