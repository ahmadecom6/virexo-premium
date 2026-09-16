import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Link } from 'react-router-dom'
import {
  FiArrowUpRight,
  FiAward,
  FiBell,
  FiCheck,
  FiClock,
  FiCompass,
  FiCpu,
  FiDownload,
  FiEye,
  FiFilter,
  FiHeart,
  FiInbox,
  FiLogOut,
  FiMenu,
  FiPlus,
  FiRefreshCw,
  FiSearch,
  FiShield,
  FiStar,
  FiTrendingUp,
  FiUpload,
  FiUserCheck,
  FiUsers,
  FiVolume2,
  FiVolumeX,
  FiX,
  FiZap,
} from 'react-icons/fi'
import Button from '../components/Button'
import FormField from '../components/FormField'
import Modal from '../components/Modal'
import StatCounter from '../components/StatCounter'
import LineChart from '../components/charts/LineChart'
import BarChart from '../components/charts/BarChart'
import DonutChart from '../components/charts/DonutChart'
import WelcomeSplash from '../components/WelcomeSplash'
import { useAuth } from '../components/useAuth'
import { useToast } from '../components/useToast'
import { useTheme, COLOR_THEMES } from '../components/useTheme'
import { dataStore } from '../utils/marketplaceStore'
import { downloadCsv } from '../utils/documents'
import { applyA11yPrefs, readA11yPrefs, saveA11yPrefs } from '../utils/accessibility'
import { soundEngine } from '../utils/audio'
import { internshipStore } from '../utils/internshipStore'
import {
  computeCandidateWeeklyCompletion,
  computeHoursPerWeek,
  computeTaskStatusCounts,
  computeWeeklyTrend,
  loadChartJs,
  renderCandidateBarChart,
  renderHoursChart,
  renderStatusDonut,
  renderTrendLineChart,
} from '../utils/progressCharts'
import { buildCandidateReportHtml, buildDashboardReportHtml, printReport } from '../utils/printReport'
import { parseCsv, validateRows } from '../utils/csvImport'
import PortalCopilotWidget from '../components/PortalCopilotWidget'
import { leadStore } from '../utils/leadStore'
import { getFavourites } from '../utils/favourites'

const tabs = ['Overview', 'Leads', 'Candidates', 'Tasks', 'Best Performers', 'AI Talent Matcher', 'Projects', 'Progress', 'Analytics']
const categories = ['All', 'Development', 'Design', 'AI & Data', 'Marketing', 'Consulting']
const candidateStatuses = ['All', 'New', 'In Review', 'Shortlisted', 'Interviewing', 'Hired', 'Rejected']
const performerDepartments = ['All', 'Development', 'Design', 'AI & Systems', 'Mobile Apps', 'Marketing', 'Cloud & DevOps']
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const aiPresetRequirements = [
  { id: 'req-1', title: 'Full-Stack Next.js & Autonomous AI Lead', query: 'React Next.js AI Python LLM high throughput', budget: '$6,000 - $8,000' },
  { id: 'req-2', title: 'High-Impact Fintech Mobile & Design Architect', query: 'Mobile Flutter Figma Design Systems animations', budget: '$4,500 - $6,000' },
  { id: 'req-3', title: 'Cloud Infrastructure & High-Security DevOps', query: 'Docker Kubernetes AWS Cloud Security Go', budget: '$6,500 - $8,500' },
  { id: 'req-4', title: 'B2B SaaS Growth & Conversion Strategist', query: 'SEO Marketing Analytics Growth Funnel', budget: '$3,500 - $5,000' },
]

const initialCandidateForm = {
  name: '',
  role: '',
  category: 'Development',
  rate: '5200',
  experience: '4 yrs',
  skills: 'React, TypeScript, Node.js',
  bio: '',
  education: 'BS Computer Science',
}

const initialProjectForm = {
  name: '',
  client: '',
  category: 'Development',
  due: '',
}

function firstName(name) {
  return name ? name.split(' ')[0] : 'User'
}

function initialsFor(name) {
  if (!name) return 'VX'
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

const taskStatuses = ['All', 'Pending', 'Submitted', 'In Review', 'Completed']
const taskTracks = ['All', 'Full-Stack', 'UI/UX', 'AI & Data', 'Cloud & DevOps', 'Mobile', 'Marketing']

const taskStatusColor = {
  Pending: '#f59e0b',
  Submitted: '#38bdf8',
  'In Review': '#a855f7',
  Completed: '#10b981',
}

// Kanban board (internship task model: Pending/Submitted/Reviewed) — shares
// internshipStore.updateTaskStatus with the Progress view and Portal Copilot.
const BOARD_STAGES = ['Pending', 'Submitted', 'Reviewed']
const BOARD_STAGE_INDEX = { Pending: 0, Submitted: 1, Reviewed: 2 }

let sortablePromise = null
function loadSortable() {
  if (window.Sortable) return Promise.resolve(window.Sortable)
  if (sortablePromise) return sortablePromise
  sortablePromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js'
    script.onload = () => resolve(window.Sortable)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return sortablePromise
}

function TaskBoard({ notify: n }) {
  const snapshot = useSyncExternalStore(internshipStore.subscribe, internshipStore.getSnapshot, internshipStore.getSnapshot)
  const { tasks, candidates } = snapshot
  const columnRefs = useRef({})
  const sortableInstances = useRef({})
  const [renderKey, setRenderKey] = useState(0)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')

  const candidateName = (id) => candidates.find((c) => c.id === id)?.name || 'Unassigned'
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])

  const grouped = useMemo(() => {
    const map = { Pending: [], Submitted: [], Reviewed: [] }
    tasks.forEach((task) => { (map[task.status] || map.Pending).push(task) })
    return map
  }, [tasks])

  const forceRevert = () => setRenderKey((key) => key + 1)

  // Shared by drag-and-drop AND the keyboard-accessible Forward/Back buttons.
  const moveTask = (task, targetStatus) => {
    const diff = BOARD_STAGE_INDEX[targetStatus] - BOARD_STAGE_INDEX[task.status]
    if (Math.abs(diff) !== 1) {
      n('Tasks must be submitted before they can be reviewed.')
      forceRevert()
      return
    }
    if (targetStatus === 'Reviewed') {
      setReviewNote(task.feedback || '')
      setReviewModal(task)
      return
    }
    internshipStore.updateTaskStatus(task.id, targetStatus)
    n(`Task moved to "${targetStatus}".`)
  }

  const confirmReview = () => {
    internshipStore.updateTaskStatus(reviewModal.id, 'Reviewed', reviewNote.trim())
    n('Task marked as Reviewed.')
    setReviewModal(null)
  }

  const cancelReview = () => {
    setReviewModal(null)
    forceRevert()
  }

  useEffect(() => {
    let cancelled = false
    loadSortable()
      .then((Sortable) => {
        if (cancelled || !Sortable) return
        BOARD_STAGES.forEach((stage) => {
          const el = columnRefs.current[stage]
          if (!el) return
          sortableInstances.current[stage]?.destroy()
          sortableInstances.current[stage] = new Sortable(el, {
            group: 'tasks-board',
            animation: 150,
            ghostClass: 'task-board-card-ghost',
            onEnd: (evt) => {
              const taskId = evt.item.dataset.taskId
              const fromStatus = evt.from.dataset.status
              const toStatus = evt.to.dataset.status
              const task = tasks.find((entry) => entry.id === taskId)
              if (!task || fromStatus === toStatus) return
              moveTask(task, toStatus)
            },
          })
        })
      })
      .catch(() => n('Drag-and-drop library failed to load.'))
    return () => {
      cancelled = true
      Object.values(sortableInstances.current).forEach((instance) => instance?.destroy())
      sortableInstances.current = {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderKey, tasks])

  return (
    <div className="portal-panel-wrapper">
      <div className="section-title-banner">
        <div>
          <span className="banner-eyebrow"><FiCheck className="text-emerald" /> INTERNSHIP COHORT — FALL 2026</span>
          <h2>Task Board</h2>
          <p>Drag cards between stages, or use Forward / Back for keyboard access. Reviewing prompts for optional feedback.</p>
        </div>
      </div>

      <div className="task-board">
        {BOARD_STAGES.map((stage) => (
          <div className="task-board-column" key={stage}>
            <div className="task-board-column-header">
              <span>{stage}</span>
              <span className="task-board-count">{grouped[stage].length}</span>
            </div>
            <ul
              className="task-board-list"
              data-status={stage}
              ref={(el) => { columnRefs.current[stage] = el }}
            >
              {grouped[stage].map((task) => {
                const overdue = task.status === 'Pending' && task.dueDate && new Date(task.dueDate) < today
                const stageIdx = BOARD_STAGE_INDEX[task.status]
                return (
                  <li className={`task-board-card ${overdue ? 'is-overdue' : ''}`} data-task-id={task.id} key={task.id}>
                    <span className="task-board-card-title">{task.title}</span>
                    <span className="task-board-card-candidate">{candidateName(task.candidateId)}</span>
                    <span className="task-board-card-due">{overdue ? `Overdue: ${task.dueDate}` : `Due ${task.dueDate}`}</span>
                    <div className="task-board-card-actions">
                      <button
                        type="button"
                        className="task-board-move-btn"
                        disabled={stageIdx === 0}
                        aria-label={`Move "${task.title}" back a stage`}
                        onClick={() => moveTask(task, BOARD_STAGES[stageIdx - 1])}
                      >
                        ← Back
                      </button>
                      <button
                        type="button"
                        className="task-board-move-btn"
                        disabled={stageIdx === BOARD_STAGES.length - 1}
                        aria-label={`Move "${task.title}" forward a stage`}
                        onClick={() => moveTask(task, BOARD_STAGES[stageIdx + 1])}
                      >
                        Forward →
                      </button>
                    </div>
                  </li>
                )
              })}
              {grouped[stage].length === 0 && <li className="task-board-empty">No tasks</li>}
            </ul>
          </div>
        ))}
      </div>

      {reviewModal && (
        <div className="portal-modal-overlay" role="dialog" aria-modal="true" aria-label="Review task">
          <div className="portal-modal-box tasks-review-modal">
            <div className="modal-header-row">
              <h3><FiEye /> Mark as Reviewed</h3>
              <button type="button" className="icon-button" onClick={cancelReview} aria-label="Close"><FiX /></button>
            </div>
            <p className="modal-task-title">{reviewModal.title}</p>
            <p className="modal-meta">Candidate: <strong>{candidateName(reviewModal.candidateId)}</strong></p>
            <label className="modal-label" htmlFor="board-review-note">Feedback (optional)</label>
            <textarea
              id="board-review-note"
              className="modal-textarea"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add feedback..."
              rows={4}
            />
            <div className="modal-footer-row">
              <button type="button" className="banner-ghost-btn" onClick={cancelReview}>Cancel</button>
              <button type="button" className="banner-primary-btn" onClick={confirmReview}><FiCheck /> Mark Reviewed</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TasksPanel({ tasks, setTasks, soundEngine: se, notify: n, dataStore: ds }) {
  const [taskFilter, setTaskFilter] = useState('All')
  const [trackFilter, setTrackFilter] = useState('All')
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')

  const visible = tasks.filter((t) => {
    const matchStatus = taskFilter === 'All' || t.status === taskFilter
    const matchTrack = trackFilter === 'All' || t.track === trackFilter
    return matchStatus && matchTrack
  })

  const handleStatusChange = (taskId, newStatus) => {
    se.playClick()
    const next = tasks.map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    setTasks(next)
    ds.saveTasks(next)
    n(`Task marked as "${newStatus}".`)
  }

  const handleOpenReview = (task) => {
    se.playClick()
    setReviewModal(task)
    setReviewNote(task.reviewerNote || '')
  }

  const handleSaveReview = () => {
    se.playClick()
    const next = tasks.map((t) => t.id === reviewModal.id ? { ...t, reviewerNote: reviewNote, status: 'In Review' } : t)
    setTasks(next)
    ds.saveTasks(next)
    n('Review note saved.')
    setReviewModal(null)
  }

  const taskCounts = { All: tasks.length }
  taskStatuses.forEach((s) => { if (s !== 'All') taskCounts[s] = tasks.filter((t) => t.status === s).length })

  const exportTasks = () => {
    internshipStore.exportCsv('virexo-tasks.csv', [
      ['Task', 'Track', 'Assignee', 'Due Date', 'Status'],
      ...visible.map((task) => [task.title, task.track, task.assignee, task.dueDate, task.status]),
    ])
    n('Visible tasks exported.')
  }

  return (
    <div className="portal-panel-wrapper">
      <div className="section-title-banner">
        <div>
          <span className="banner-eyebrow"><FiCheck className="text-emerald" /> INTERNSHIP COHORT — FALL 2026</span>
          <h2>Tasks & Submission Tracker</h2>
          <p>Week 4 of 6 · {tasks.length} tasks across {taskTracks.length - 1} tracks · Review submitted work below.</p>
        </div>
        <div className="tasks-progress-ring-wrap">
          <button type="button" className="banner-ghost-btn" onClick={exportTasks}><FiDownload /> Export CSV</button>
          <svg width="80" height="80" viewBox="0 0 80 80" className="tasks-progress-ring">
            <circle cx="40" cy="40" r="34" strokeWidth="6" fill="none" stroke="rgba(255,255,255,0.1)" />
            <circle
              cx="40" cy="40" r="34" strokeWidth="6" fill="none"
              stroke="var(--theme-accent, #00f2fe)"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 34}
              strokeDashoffset={2 * Math.PI * 34 * (1 - taskCounts.Completed / tasks.length)}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="tasks-ring-label">
            <strong>{Math.round((taskCounts.Completed / tasks.length) * 100)}%</strong>
            <small>Done</small>
          </div>
        </div>
      </div>

      {/* Metric Row */}
      <div className="tasks-metric-row">
        {taskStatuses.filter((s) => s !== 'All').map((s) => (
          <div key={s} className="tasks-metric-chip" style={{ borderColor: `${taskStatusColor[s]}44` }}>
            <span className="tasks-chip-count" style={{ color: taskStatusColor[s] }}>{taskCounts[s]}</span>
            <span className="tasks-chip-label">{s}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="tasks-filters">
        <div className="filter-pill-group">
          {taskStatuses.map((s) => (
            <button key={s} type="button"
              className={`filter-pill-btn ${taskFilter === s ? 'is-active' : ''}`}
              onClick={() => { se.playClick(); setTaskFilter(s) }}
            >
              {s} {s !== 'All' && <span className="pill-count">{taskCounts[s]}</span>}
            </button>
          ))}
        </div>
        <div className="filter-pill-group">
          {taskTracks.map((tr) => (
            <button key={tr} type="button"
              className={`filter-pill-btn filter-pill-sm ${trackFilter === tr ? 'is-active' : ''}`}
              onClick={() => { se.playClick(); setTrackFilter(tr) }}
            >
              {tr}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="tasks-table-wrap">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Track</th>
              <th>Assignee</th>
              <th>Due</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((task) => (
              <tr key={task.id} className="tasks-row">
                <td className="task-title-cell">
                  <span className="task-title">{task.title}</span>
                  {task.reviewerNote && <small className="task-note">"{task.reviewerNote}"</small>}
                </td>
                <td><span className="task-track-chip">{task.track}</span></td>
                <td className="task-assignee">
                  <span className="candidate-avatar-mini" style={{ background: 'var(--theme-accent-gradient, linear-gradient(135deg,#00f2fe,#4facfe))' }}>
                    {task.assignee.split(' ').map((p) => p[0]).join('').slice(0, 2)}
                  </span>
                  {task.assignee}
                </td>
                <td><span className="task-due">{task.dueDate}</span></td>
                <td>
                  <span className="task-status-badge" style={{ background: `${taskStatusColor[task.status]}22`, color: taskStatusColor[task.status], borderColor: `${taskStatusColor[task.status]}55` }}>
                    {task.status}
                  </span>
                </td>
                <td className="task-actions">
                  {task.status === 'Submitted' && (
                    <button type="button" className="task-action-btn task-review-btn" onClick={() => handleOpenReview(task)}>
                      <FiEye /> Review
                    </button>
                  )}
                  {task.status === 'In Review' && (
                    <button type="button" className="task-action-btn task-complete-btn" onClick={() => handleStatusChange(task.id, 'Completed')}>
                      <FiCheck /> Mark Done
                    </button>
                  )}
                  {task.status === 'Pending' && (
                    <button type="button" className="task-action-btn task-remind-btn" onClick={() => n(`Reminder sent to ${task.assignee}.`)}>
                      <FiRefreshCw /> Remind
                    </button>
                  )}
                  {task.status === 'Completed' && (
                    <span className="task-done-tag"><FiCheck /> Approved</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {visible.length === 0 && (
          <div className="tasks-empty">No tasks match your filters.</div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="portal-modal-overlay" role="dialog" aria-modal="true" aria-label="Review task">
          <div className="portal-modal-box tasks-review-modal">
            <div className="modal-header-row">
              <h3><FiEye /> Review Task</h3>
              <button type="button" className="icon-button" onClick={() => setReviewModal(null)} aria-label="Close"><FiX /></button>
            </div>
            <p className="modal-task-title">{reviewModal.title}</p>
            <p className="modal-meta">Submitted by <strong>{reviewModal.assignee}</strong> · Track: <strong>{reviewModal.track}</strong></p>
            <label className="modal-label" htmlFor="review-note">Reviewer Note</label>
            <textarea
              id="review-note"
              className="modal-textarea"
              value={reviewNote}
              onChange={(e) => setReviewNote(e.target.value)}
              placeholder="Add feedback or note..."
              rows={4}
            />
            <div className="modal-footer-row">
              <button type="button" className="banner-ghost-btn" onClick={() => setReviewModal(null)}>Cancel</button>
              <button type="button" className="banner-primary-btn" onClick={handleSaveReview}><FiCheck /> Save & Move to In Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Generic Chart.js canvas: builds once per `deps` change, always destroying the
// previous instance first so switching views/candidates never leaves ghost charts.
function ChartCanvas({ height = 220, buildChart, deps }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    loadChartJs().then((ChartJs) => {
      if (cancelled || !canvasRef.current) return
      chartRef.current?.destroy()
      chartRef.current = buildChart(ChartJs, canvasRef.current)
    })
    return () => {
      cancelled = true
      chartRef.current?.destroy()
      chartRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    const wrap = canvasRef.current?.parentElement
    if (!wrap || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => chartRef.current?.resize())
    observer.observe(wrap)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="progress-chart-canvas-wrap" style={{ height }}>
      <canvas ref={canvasRef} />
    </div>
  )
}

function ProgressPanel({ snapshot, notify, focusCandidateId, themeKey }) {
  const [form, setForm] = useState({ candidateId: snapshot.candidates[0]?.id || '', week: '5', tasksCompleted: '0', tasksTotal: '5', hoursLogged: '0', notes: '' })
  const [errors, setErrors] = useState({})
  const [pendingDelete, setPendingDelete] = useState(null)
  const [chartCandidateId, setChartCandidateId] = useState(snapshot.candidates[0]?.id || '')

  useEffect(() => {
    if (!focusCandidateId) return undefined
    const timeout = window.setTimeout(() => {
      document.querySelector(`[data-candidate-card="${focusCandidateId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 0)
    return () => window.clearTimeout(timeout)
  }, [focusCandidateId])

  const summaries = snapshot.candidates.map((candidate) => {
    const history = snapshot.progress.filter((entry) => entry.candidateId === candidate.id).sort((a, b) => a.week - b.week)
    const average = history.length ? history.reduce((sum, entry) => sum + (entry.tasksTotal ? entry.tasksCompleted / entry.tasksTotal : 0), 0) / history.length : 0
    const recent = history.at(-1)
    const previous = history.at(-2)
    const recentRate = recent?.tasksTotal ? recent.tasksCompleted / recent.tasksTotal : 0
    const previousRate = previous?.tasksTotal ? previous.tasksCompleted / previous.tasksTotal : recentRate
    const trend = recentRate > previousRate ? 'Improving' : recentRate < previousRate ? 'Declining' : 'Steady'
    return { candidate, history, average, trend, standing: recentRate >= 0.7 ? 'On Track' : 'At Risk', hours: history.reduce((sum, entry) => sum + Number(entry.hoursLogged || 0), 0) }
  })

  const trendData = useMemo(() => computeWeeklyTrend(snapshot.progress), [snapshot.progress])
  const candidateCompletion = useMemo(() => computeCandidateWeeklyCompletion(chartCandidateId, snapshot.progress), [chartCandidateId, snapshot.progress])
  const hoursData = useMemo(() => computeHoursPerWeek(snapshot.progress, chartCandidateId || null), [chartCandidateId, snapshot.progress])
  const statusCounts = useMemo(() => computeTaskStatusCounts(snapshot.tasks), [snapshot.tasks])

  const submit = (event) => {
    event.preventDefault()
    const nextErrors = {}
    const completed = Number(form.tasksCompleted)
    const total = Number(form.tasksTotal)
    if (!form.candidateId) nextErrors.candidateId = 'Select a candidate.'
    if (!Number.isInteger(Number(form.week)) || Number(form.week) < 1) nextErrors.week = 'Enter a valid week.'
    if (completed < 0 || total < 0 || completed > total) nextErrors.tasksCompleted = 'Completed tasks must be between 0 and total tasks.'
    if (Number(form.hoursLogged) < 0) nextErrors.hoursLogged = 'Hours cannot be negative.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    internshipStore.addProgress({ id: `progress-${Date.now()}`, candidateId: form.candidateId, week: Number(form.week), tasksCompleted: completed, tasksTotal: total, hoursLogged: Number(form.hoursLogged), notes: form.notes.trim() })
    notify('Progress logged.')
    setForm((current) => ({ ...current, tasksCompleted: '0', hoursLogged: '0', notes: '' }))
  }

  return (
    <div className="portal-panel-wrapper">
      <div className="section-title-banner">
        <div><span className="banner-eyebrow"><FiTrendingUp className="text-cyan" /> WEEKLY DEVELOPMENT</span><h2>Progress & Insights</h2><p>Track weekly delivery, hours, trends, and standing across the internship cohort.</p></div>
      </div>

      <div className="progress-charts-row">
        <div className="portal-card-box progress-chart-card vx-ring-surface">
          <h3>Cohort completion trend</h3>
          <ChartCanvas
            height={220}
            deps={[trendData, themeKey]}
            buildChart={(ChartJs, canvas) => renderTrendLineChart(ChartJs, canvas, trendData)}
          />
        </div>
        <div className="portal-card-box progress-chart-card progress-chart-card-donut vx-ring-surface">
          <h3>Tasks by status</h3>
          <ChartCanvas
            height={220}
            deps={[statusCounts, themeKey]}
            buildChart={(ChartJs, canvas) => renderStatusDonut(ChartJs, canvas, statusCounts)}
          />
        </div>
      </div>

      <div className="portal-card-box vx-ring-surface">
        <div className="box-header-row">
          <h3>Candidate detail</h3>
          <FormField
            label=""
            type="select"
            value={chartCandidateId}
            options={snapshot.candidates.map((candidate) => ({ label: candidate.name, value: candidate.id }))}
            onChange={(event) => setChartCandidateId(event.target.value)}
          />
        </div>
        <div className="progress-charts-row">
          <div className="progress-chart-card">
            <h4>Weekly completion %</h4>
            <ChartCanvas
              height={200}
              deps={[candidateCompletion, themeKey]}
              buildChart={(ChartJs, canvas) => renderCandidateBarChart(ChartJs, canvas, candidateCompletion)}
            />
          </div>
          <div className="progress-chart-card">
            <h4>Hours logged per week</h4>
            <ChartCanvas
              height={200}
              deps={[hoursData, themeKey]}
              buildChart={(ChartJs, canvas) => renderHoursChart(ChartJs, canvas, hoursData)}
            />
          </div>
        </div>
      </div>

      <div className="portal-card-box vx-ring-surface">
        <h3>Log weekly progress</h3>
        <form className="modal-form-grid progress-entry-form" onSubmit={submit} noValidate>
          <FormField label="Candidate" type="select" value={form.candidateId} error={errors.candidateId} options={snapshot.candidates.map((candidate) => ({ label: candidate.name, value: candidate.id }))} onChange={(event) => setForm({ ...form, candidateId: event.target.value })} />
          <div className="form-row"><FormField label="Week" type="number" value={form.week} error={errors.week} onChange={(event) => setForm({ ...form, week: event.target.value })} /><FormField label="Hours logged" type="number" value={form.hoursLogged} error={errors.hoursLogged} onChange={(event) => setForm({ ...form, hoursLogged: event.target.value })} /></div>
          <div className="form-row"><FormField label="Tasks completed" type="number" value={form.tasksCompleted} error={errors.tasksCompleted} onChange={(event) => setForm({ ...form, tasksCompleted: event.target.value })} /><FormField label="Tasks total" type="number" value={form.tasksTotal} onChange={(event) => setForm({ ...form, tasksTotal: event.target.value })} /></div>
          <FormField label="Notes" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} placeholder="Weekly wins, blockers, and next steps" />
          <Button type="submit"><FiPlus /> Log Progress</Button>
        </form>
      </div>
      <div className="progress-summary-grid">
        {summaries.map(({ candidate, history, average, trend, standing, hours }) => (
          <article
            className={`portal-card-box progress-summary-card ${focusCandidateId === candidate.id ? 'is-focused' : ''}`}
            data-candidate-card={candidate.id}
            key={candidate.id}
          >
            <div className="box-header-row"><div><h3>{candidate.name}</h3><p className="box-subtitle">{candidate.department} · {standing}</p></div><span className={`status-chip status-${standing.toLowerCase().replace(' ', '-')}`}>{trend}</span></div>
            <div className="progress-track"><span className="progress-bar" style={{ width: `${Math.round(average * 100)}%` }} /></div>
            <p className="progress-summary-meta">Average {Math.round(average * 100)}% · {hours} hours · {history.length} weeks</p>
            <div className="progress-history-list">{history.map((entry) => <div className="progress-history-row" key={entry.id}><span>Week {entry.week}: {entry.tasksCompleted}/{entry.tasksTotal} tasks</span><button type="button" className="icon-button-small" onClick={() => setPendingDelete(entry)} aria-label={`Delete week ${entry.week} progress`}>×</button></div>)}</div>
            <button
              type="button"
              className="banner-ghost-btn progress-print-btn"
              onClick={() => printReport(buildCandidateReportHtml(candidate, snapshot))}
            >
              <FiDownload /> Print Report
            </button>
          </article>
        ))}
      </div>
      {pendingDelete && <div className="portal-confirm-box" role="dialog"><strong>Delete Week {pendingDelete.week} progress?</strong><p>This action cannot be undone.</p><button type="button" className="banner-ghost-btn" onClick={() => setPendingDelete(null)}>Cancel</button><button type="button" className="banner-primary-btn" onClick={() => { internshipStore.deleteProgress(pendingDelete.id); setPendingDelete(null); notify('Progress entry deleted.') }}>Delete</button></div>}
    </div>
  )
}

// Bulk CSV import preview + confirm, wired to the same internshipStore.addCandidate()
// used everywhere else so validation/persistence never diverges.
function CsvImportModal({ open, onClose, existingCandidates, notify: n }) {
  const [error, setError] = useState('')
  const [rows, setRows] = useState(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [isDragging, setIsDragging] = useState(false)

  const reset = () => { setError(''); setRows(null); setSkipDuplicates(true); setIsDragging(false) }

  const handleClose = () => { reset(); onClose() }

  const processFile = async (file) => {
    setError('')
    setRows(null)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file.')
      return
    }
    try {
      const text = await file.text()
      const { rows: parsed } = parseCsv(text)
      setRows(validateRows(parsed, existingCandidates))
    } catch (err) {
      setError(err.message || 'Could not read that CSV file.')
    }
  }

  const validCount = rows ? rows.filter((row) => row.isValid && !(skipDuplicates && row.duplicateOf)).length : 0
  const totalCount = rows ? rows.length : 0
  const skippedCount = totalCount - validCount

  const confirmImport = () => {
    const toImport = rows.filter((row) => row.isValid && !(skipDuplicates && row.duplicateOf))
    toImport.forEach((row, index) => {
      internshipStore.addCandidate({
        id: `intern-candidate-csv-${Date.now()}-${index}`,
        name: row.name,
        email: row.email,
        department: row.department,
        joinDate: row.joinDate,
        supervisor: row.supervisor,
        status: row.status,
      })
    })
    n(`${toImport.length} candidate${toImport.length === 1 ? '' : 's'} imported successfully.`)
    handleClose()
  }

  return (
    <Modal open={open} onClose={handleClose} label="Import candidates from CSV">
      <div className="modal-inner-head">
        <h3>Import Candidates (CSV)</h3>
        <p>Columns: name, email, department, joinDate, supervisor. Status defaults to "Active".</p>
      </div>

      <label
        className={`csv-dropzone ${isDragging ? 'is-dragging' : ''}`}
        onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault()
          setIsDragging(false)
          processFile(event.dataTransfer.files?.[0])
        }}
      >
        <input type="file" accept=".csv" onChange={(event) => processFile(event.target.files?.[0])} />
        <strong>Drop a CSV file here or click to browse</strong>
        <small>First row must be a header with at least name and email columns.</small>
      </label>

      {error && <p className="field-error csv-import-error" role="alert">{error}</p>}

      {rows && (
        <>
          <p className="csv-import-summary">
            {validCount} of {totalCount} row{totalCount === 1 ? '' : 's'} valid — {skippedCount} will be skipped (see highlighted rows).
          </p>
          <label className="csv-skip-duplicates">
            <input type="checkbox" checked={skipDuplicates} onChange={(event) => setSkipDuplicates(event.target.checked)} />
            Skip duplicates
          </label>
          <div className="csv-preview-table-wrap">
            <table className="csv-preview-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Department</th><th>Join date</th><th>Supervisor</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row) => (
                  <tr key={row.rowIndex} className={!row.isValid ? 'csv-row-error' : row.duplicateOf ? 'csv-row-warning' : ''}>
                    <td>{row.name || '—'}</td>
                    <td>{row.email || '—'}</td>
                    <td>{row.department}</td>
                    <td>{row.joinDate}</td>
                    <td>{row.supervisor}</td>
                    <td>
                      {row.errors.length > 0 && row.errors.join(' ')}
                      {row.errors.length === 0 && row.duplicateOf && `Duplicate of ${row.duplicateOf}.`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 10 && <p className="csv-preview-more">Showing first 10 of {rows.length} rows.</p>}
          </div>
        </>
      )}

      <div className="modal-footer-row">
        <button type="button" className="banner-ghost-btn" onClick={handleClose}>Cancel</button>
        <button type="button" className="banner-primary-btn" disabled={!rows || validCount === 0} onClick={confirmImport}>
          <FiCheck /> Confirm Import
        </button>
      </div>
    </Modal>
  )
}

export default function Portal() {
  const { user, logout } = useAuth()
  const notify = useToast()
  const [dark, setDark, colorTheme, setColorTheme] = useTheme()
  const [tab, setTab] = useState(() => {
    const saved = window.sessionStorage.getItem('virexo-portal-tab')
    return tabs.includes(saved) ? saved : 'Overview'
  })
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('virexo-portal-sidebar-collapsed') === 'true')
  const [clock, setClock] = useState(() => new Date())
  const [isMuted, setIsMuted] = useState(() => soundEngine.isMuted())
  const [replayWelcome, setReplayWelcome] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [readNotifs, setReadNotifs] = useState(() => { try { return JSON.parse(window.localStorage.getItem('virexo-read-notifs')) || [] } catch { return [] } })
  const [leads, setLeads] = useState(() => leadStore.getAll())
  const [leadFilter, setLeadFilter] = useState('All')

  // Accessibility
  const [a11yOpen, setA11yOpen] = useState(false)
  const [a11yPrefs, setA11yPrefs] = useState(() => readA11yPrefs())

  // Data Store state
  const [requests] = useState(() => dataStore.getRequests())
  const [projects, setProjects] = useState(() => dataStore.getProjects())
  const [candidates, setCandidates] = useState(() => dataStore.getCandidates())
  const [performers, setPerformers] = useState(() => dataStore.getPerformers())
  const [activities, setActivities] = useState(() => dataStore.getActivities())
  const leadNotifications = leads.map((lead) => ({ id: lead.id, type: 'lead', title: `New ${lead.type}`, description: `${lead.name || lead.email || 'Website visitor'} submitted ${lead.type.toLowerCase()}.` }))
  const allNotifications = [...leadNotifications, ...activities]
  const unreadNotifCount = allNotifications.filter(a => !readNotifs.includes(a.id)).length
  const [tasks, setTasks] = useState(() => dataStore.getTasks())
  const [taskView, setTaskView] = useState(() => window.localStorage.getItem('virexo-tasks-view') || 'list')
  const internshipSnapshot = useSyncExternalStore(internshipStore.subscribe, internshipStore.getSnapshot, internshipStore.getSnapshot)
  const [focusCandidateId, setFocusCandidateId] = useState(null)

  // Candidate Filters & Modals
  const [candidateQuery, setCandidateQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [candidateModalOpen, setCandidateModalOpen] = useState(false)
  const [csvModalOpen, setCsvModalOpen] = useState(false)
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm)
  const [candidateErrors, setCandidateErrors] = useState({})
  const [activeCandidateDossier, setActiveCandidateDossier] = useState(null)

  // Best Performers Filters & Modals
  const [selectedDepartment, setSelectedDepartment] = useState('All')
  const [activePerformerDossier, setActivePerformerDossier] = useState(null)

  // AI Talent Matcher State
  const [aiSelectedPreset, setAiSelectedPreset] = useState(aiPresetRequirements[0].id)
  const [aiCustomQuery, setAiCustomQuery] = useState('')
  const [aiScanning, setAiScanning] = useState(false)
  const [aiMatches, setAiMatches] = useState([])

  // Project Modals
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [projectForm, setProjectForm] = useState(initialProjectForm)
  const [projectErrors, setProjectErrors] = useState({})

  useEffect(() => {
    applyA11yPrefs(a11yPrefs)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    window.sessionStorage.setItem('virexo-portal-tab', tab)
  }, [tab])

  useEffect(() => {
    window.localStorage.setItem('virexo-portal-sidebar-collapsed', String(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const id = window.setInterval(() => setClock(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => leadStore.subscribe(setLeads), [])

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!event.target.closest('.portal-a11y')) setA11yOpen(false)
      if (!event.target.closest('.portal-profile-wrap')) setProfileOpen(false)
      if (!event.target.closest('.portal-notifications')) setNotificationsOpen(false)
    }
    document.addEventListener('click', closeOnOutsideClick)
    return () => document.removeEventListener('click', closeOnOutsideClick)
  }, [])

  const toggleSound = () => {
    const nextMuted = soundEngine.toggleMute()
    setIsMuted(nextMuted)
    if (!nextMuted) soundEngine.playClick()
    notify(nextMuted ? 'Interface sound muted.' : 'Cyber audio effects enabled.')
  }

  const toggleA11y = (key) => {
    soundEngine.playClick()
    setA11yPrefs((current) => {
      const next =
        key === 'textLevel'
          ? { ...current, textLevel: (current.textLevel + 1) % 3 }
          : { ...current, [key]: !current[key] }
      applyA11yPrefs(next)
      saveA11yPrefs(next)
      return next
    })
  }

  // Statistics Calculations
  const pipelineValue = useMemo(
    () => requests.reduce((total, request) => total + request.total, 0),
    [requests]
  )
  const pipelineSeries = useMemo(
    () => [14, 18, 16, 22, 25, 21, 28, 32, 30, 36, 41, 42 + requests.length],
    [requests.length]
  )
  const categoryCounts = useMemo(
    () =>
      categories
        .filter((c) => c !== 'All')
        .map((category) => ({
          label: category.slice(0, 4),
          value: requests.filter((request) => request.category.includes(category)).length || 3,
        })),
    [requests]
  )

  // Filtered Candidates
  const visibleCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const query = candidateQuery.trim().toLowerCase()
      const matchesQuery =
        !query ||
        `${candidate.name} ${candidate.role} ${(candidate.skills || []).join(' ')}`
          .toLowerCase()
          .includes(query)
      const matchesStatus = selectedStatus === 'All' || candidate.status === selectedStatus
      const matchesCategory = selectedCategory === 'All' || candidate.category === selectedCategory
      return matchesQuery && matchesStatus && matchesCategory
    })
  }, [candidates, candidateQuery, selectedStatus, selectedCategory])

  // Candidates status counts for Kanban pills
  const statusCounts = useMemo(() => {
    const counts = { All: candidates.length }
    candidateStatuses.forEach((st) => {
      if (st !== 'All') {
        counts[st] = candidates.filter((c) => c.status === st).length
      }
    })
    return counts
  }, [candidates])

  // Filtered Best Performers
  const visiblePerformers = useMemo(() => {
    return performers.filter((p) => {
      return selectedDepartment === 'All' || p.department === selectedDepartment
    })
  }, [performers, selectedDepartment])

  // Interactive Kudos appreciation
  const handleAwardKudos = (performer) => {
    soundEngine.playKudos()
    const updated = dataStore.addKudos(performer.id)
    setPerformers(updated)
    const nextActivities = dataStore.logActivity({
      type: 'kudos',
      title: 'Kudos Received',
      description: `${user?.name || 'Executive'} awarded Kudos to ${performer.name} (${performer.role}).`,
    })
    setActivities(nextActivities)
    notify(`Awarded +1 Kudos to ${performer.name}! ⭐`)
  }

  // Update Candidate Status
  const handleSetCandidateStatus = (id, newStatus) => {
    soundEngine.playClick()
    const next = candidates.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    setCandidates(next)
    dataStore.saveCandidates(next)
    const updated = next.find((c) => c.id === id)
    const nextActivities = dataStore.logActivity({
      type: newStatus === 'Hired' ? 'hired' : 'review',
      title: `Status: ${newStatus}`,
      description: `${updated.name} was marked as "${newStatus}" by ${user?.name || 'Talent Lead'}.`,
    })
    setActivities(nextActivities)
    notify(`${updated.name} moved to "${newStatus}".`)
  }

  // Add Candidate Form
  const submitCandidate = (event) => {
    event.preventDefault()
    soundEngine.playClick()
    const next = {}
    if (candidateForm.name.trim().length < 2) next.name = 'Full name is required.'
    if (candidateForm.role.trim().length < 2) next.role = 'Role title is required.'
    if (!(Number(candidateForm.rate) >= 500)) next.rate = 'Enter a valid monthly rate ($500+).'
    setCandidateErrors(next)
    if (Object.keys(next).length) return

    const newCandidate = {
      id: Date.now(),
      name: candidateForm.name.trim(),
      role: candidateForm.role.trim(),
      category: candidateForm.category,
      rate: Number(candidateForm.rate),
      status: 'New',
      experience: candidateForm.experience,
      matchScore: Math.floor(Math.random() * 8) + 92,
      rating: 4.9,
      skills: candidateForm.skills.split(',').map((s) => s.trim()).filter(Boolean),
      bio: candidateForm.bio.trim() || 'Verified candidate in the Virexo talent ecosystem.',
      education: candidateForm.education.trim(),
      github: 'https://github.com',
      avatarColor: 'linear-gradient(135deg, #00f2fe, #a855f7)',
      completedProjects: 0,
    }

    const nextCandidates = [newCandidate, ...candidates]
    setCandidates(nextCandidates)
    dataStore.saveCandidates(nextCandidates)
    const nextActivities = dataStore.logActivity({
      type: 'ai',
      title: 'Candidate Enrolled',
      description: `${newCandidate.name} (${newCandidate.role}) added to the pipeline.`,
    })
    setActivities(nextActivities)
    setCandidateModalOpen(false)
    setCandidateForm(initialCandidateForm)
    soundEngine.playSuccess()
    notify(`${firstName(newCandidate.name)} enrolled in Talent Pipeline.`)
  }

  // Run AI Talent Matching Simulation
  const handleRunAiMatching = () => {
    soundEngine.playScan()
    setAiScanning(true)
    setAiMatches([])

    const targetRequirement =
      aiPresetRequirements.find((r) => r.id === aiSelectedPreset) || aiPresetRequirements[0]
    const query = (aiCustomQuery || targetRequirement.query).toLowerCase()

    setTimeout(() => {
      // Calculate scores dynamically
      const ranked = candidates
        .map((candidate) => {
          let score = candidate.matchScore || 90
          const text = `${candidate.role} ${candidate.category} ${(candidate.skills || []).join(' ')}`.toLowerCase()
          const matchedWords = query.split(' ').filter((word) => word.length > 2 && text.includes(word))
          score = Math.min(99, score + matchedWords.length * 2)

          let reasoning = `Possesses strong fundamentals in ${(candidate.skills || []).slice(0, 3).join(', ')} with ${candidate.experience} experience.`
          if (matchedWords.length >= 2) {
            reasoning = `High keyword density in ${matchedWords.slice(0, 2).join(' & ')}. Excellent architecture match for this sprint.`
          }

          return {
            ...candidate,
            computedMatch: score,
            matchedKeywords: matchedWords,
            reasoning,
          }
        })
        .sort((a, b) => b.computedMatch - a.computedMatch)
        .slice(0, 4)

      setAiMatches(ranked)
      setAiScanning(false)
      soundEngine.playSuccess()
      notify('AI screening completed. Top 4 talent profiles matched.')
    }, 1400)
  }

  // Export CSV
  const exportCandidatesCsv = () => {
    soundEngine.playClick()
    const rows = [
      'Name,Role,Category,Experience,Rate,MatchScore,Rating,Status,Skills',
      ...visibleCandidates.map(
        (c) =>
          `"${c.name}","${c.role}","${c.category}","${c.experience}",$${c.rate},${c.matchScore}%,${c.rating},"${c.status}","${(c.skills || []).join('; ')}"`
      ),
    ]
    downloadCsv('virexo-talent-pipeline.csv', rows)
    notify('Talent Pipeline exported (CSV).')
  }

  // Submit Project Form
  const submitProject = (event) => {
    event.preventDefault()
    soundEngine.playClick()
    const next = {}
    if (projectForm.name.trim().length < 3) next.name = 'Project name is required.'
    if (projectForm.client.trim().length < 2) next.client = 'Client name is required.'
    if (!projectForm.due) next.due = 'Select due date.'
    setProjectErrors(next)
    if (Object.keys(next).length) return

    const newProject = {
      id: `p${Date.now()}`,
      name: projectForm.name.trim(),
      client: projectForm.client.trim(),
      category: projectForm.category,
      progress: 0,
      status: 'Planning',
      due: new Date(projectForm.due).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      team: ['YOU', 'VX'],
    }
    const nextProjects = [newProject, ...projects]
    setProjects(nextProjects)
    dataStore.saveProjects(nextProjects)
    setProjectModalOpen(false)
    setProjectForm(initialProjectForm)
    soundEngine.playSuccess()
    notify(`Project "${newProject.name}" initiated.`)
  }

  return (
    <div className="portal-pro-shell">
      {sidebarOpen && <div className="portal-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar Navigation */}
      <aside className={`portal-sidebar ${sidebarOpen ? 'is-open' : ''} ${sidebarCollapsed ? 'is-collapsed' : ''}`}>
        <div className="portal-brand">
          <span className="portal-brand-logo">V</span>
          <div className="portal-brand-text">
            <strong>Virexo OS</strong>
            <small>Executive Portal</small>
          </div>
        </div>

        <nav className="portal-nav" aria-label="Portal tabs">
          {tabs.map((item) => {
            const getIcon = () => {
              switch (item) {
                case 'Overview':
                  return <FiCpu />
                case 'Candidates':
                  return <FiUsers />
                case 'Leads':
                  return <FiInbox />
                case 'Tasks':
                  return <FiCheck />
                case 'Best Performers':
                  return <FiAward />
                case 'AI Talent Matcher':
                  return <FiZap />
                case 'Projects':
                  return <FiTrendingUp />
                case 'Analytics':
                  return <FiStar />
                case 'Progress':
                  return <FiTrendingUp />
                default:
                  return <FiCpu />
              }
            }
            return (
              <button
                key={item}
                type="button"
                className={`portal-nav-item ${tab === item ? 'is-active' : ''}`}
                onClick={() => {
                  soundEngine.playClick()
                  setTab(item)
                  setSidebarOpen(false)
                }}
              >
                <span className="nav-icon-span">{getIcon()}</span>
                <span>{item}</span>
                {item === 'Candidates' && <span className="nav-badge">{candidates.length}</span>}
                {item === 'Leads' && <span className="nav-badge nav-badge-cyan">{leads.filter((lead) => lead.status === 'New').length}</span>}
                {item === 'Tasks' && <span className="nav-badge nav-badge-cyan">{tasks.length}</span>}
                {item === 'Best Performers' && <span className="nav-badge nav-badge-gold">TOP</span>}
                {item === 'AI Talent Matcher' && <span className="nav-badge nav-badge-cyan">AI</span>}
              </button>
            )
          })}
        </nav>

        {/* Shortcuts Box */}
        <div className="portal-shortcuts-box">
          <span className="portal-shortcuts-label">Quick Actions</span>
          <button
            type="button"
            className="portal-shortcut-btn"
            onClick={() => {
              soundEngine.playClick()
              setTab('Candidates')
              setCandidateModalOpen(true)
              setSidebarOpen(false)
            }}
          >
            <FiPlus /> Add Candidate
          </button>
          <button
            type="button"
            className="portal-shortcut-btn"
            onClick={() => {
              soundEngine.playClick()
              setTab('AI Talent Matcher')
              setSidebarOpen(false)
            }}
          >
            <FiZap /> Run AI Matcher
          </button>
          <button
            type="button"
            className="portal-shortcut-btn"
            onClick={() => {
              soundEngine.playClick()
              setTab('Projects')
              setProjectModalOpen(true)
              setSidebarOpen(false)
            }}
          >
            <FiPlus /> New Project
          </button>
        </div>

        {/* Public Website Switcher in Sidebar */}
        <div className="portal-switch-website-box">
          <Link to="/" className="portal-website-link" onClick={() => soundEngine.playClick()}>
            <FiCompass />
            <div>
              <strong>Open Public Website</strong>
              <small>Explore Home, Services, Nexus ↗</small>
            </div>
          </Link>
        </div>

        {/* Cohort Badge */}
        <div className="portal-cohort-badge">
          <span className="cohort-label">Cohort — Fall 2026</span>
          <small>Virexo Innovations Internship Program • Week 4 of 6</small>
        </div>

        {/* User Badge */}
        <div className="portal-user-profile">
          <div className="portal-user-avatar">{initialsFor(user?.name)}</div>
          <div className="portal-user-meta">
            <strong>{user?.name || 'Executive User'}</strong>
            <span>{user?.email || 'demo@virexo.com'}</span>
          </div>
          <button
            type="button"
            className="portal-sidebar-logout"
            aria-label="Sign out"
            onClick={() => {
              soundEngine.playClick()
              logout()
            }}
          >
            <FiLogOut /> <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="portal-main-area">
        {/* Topbar */}
        <header className="portal-topbar">
          <button
            className="icon-button portal-menu-btn"
            type="button"
            aria-label="Open sidebar"
            onClick={() => {
              soundEngine.playClick()
              setSidebarOpen((open) => !open)
              setSidebarCollapsed((collapsed) => !collapsed)
            }}
          >
            {sidebarOpen ? <FiX /> : <FiMenu />}
          </button>

          <div className="portal-topbar-breadcrumb">
            <strong>{tab}</strong>
            <span className="topbar-subtitle">Virexo Innovations Internship Program</span>
          </div>

          {/* Search */}
          <div className="portal-topbar-search">
            <FiSearch className="topbar-search-icon" />
            <input
              type="search"
              placeholder="Quick search candidates or tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search candidates or tasks"
            />
          </div>

          <div className="portal-topbar-actions">
            {/* Live Clock */}
            <div className="portal-live-clock">
              <span className="live-dot-pulse" />
              <FiClock className="clock-icon" />
              <time>{clock.toLocaleTimeString('en-GB')}</time>
            </div>

            {/* Audio Toggle */}
            <button
              className={`icon-button ${isMuted ? 'muted' : 'active'}`}
              type="button"
              aria-label={isMuted ? 'Enable interface sounds' : 'Mute interface sounds'}
              onClick={toggleSound}
              title={isMuted ? 'Unmute UI sounds' : 'Mute UI sounds'}
            >
              {isMuted ? <FiVolumeX /> : <FiVolume2 />}
            </button>

            {/* Public Website link */}
            <Link
              to="/"
              className="portal-topbar-site-btn"
              onClick={() => soundEngine.playClick()}
              title="Return to Public Website"
            >
              <FiCompass />
              <span>Website</span>
              <FiArrowUpRight />
            </Link>

            {/* Notification Bell */}
            <div className="portal-notifications">
              <button
                className="icon-button portal-notif-btn"
                type="button"
                aria-label={`${unreadNotifCount} notifications`}
                aria-expanded={notificationsOpen}
                onClick={() => {
                  soundEngine.playClick()
                  setNotificationsOpen((open) => !open)
                  setProfileOpen(false)
                }}
                title="Notifications"
              >
                <FiBell />
                {unreadNotifCount > 0 && <span className="portal-notif-badge">{unreadNotifCount}</span>}
              </button>
              {notificationsOpen && (
                <div className="portal-notification-panel" role="dialog" aria-label="Notifications">
                  <div className="portal-notification-header">
                    <strong>Notifications</strong>
                    <span>{unreadNotifCount} new</span>
                  </div>
                  {(allNotifications.length ? allNotifications.slice(0, 7) : [{ id: 'empty', title: 'All caught up', description: 'No new activity yet.' }]).map((item) => (
                    <button
                      className="portal-notification-item"
                      type="button"
                      key={item.id}
                      onClick={() => {
                        soundEngine.playClick()
                        if (item.type === 'lead') setTab('Leads')
                        else if (item.type === 'task' || item.type === 'review') setTab('Tasks')
                        else if (item.type === 'progress') setTab('Progress')
                        else if (item.type === 'candidate') setTab('Candidates')
                        else setTab('Overview')
                        setNotificationsOpen(false)
                          if (item.id !== 'empty' && !readNotifs.includes(item.id)) {
                            const nextRead = [...readNotifs, item.id]
                            setReadNotifs(nextRead)
                            window.localStorage.setItem('virexo-read-notifs', JSON.stringify(nextRead))
                          }
                        }}
                    >
                      <span className={`notification-dot ${item.type || 'info'}`} />
                      <div><strong>{item.title || 'Activity update'}</strong><p>{item.description || item.message}</p></div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="portal-profile-wrap">
              <button
                type="button"
                className="portal-profile-trigger"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={() => {
                  soundEngine.playClick()
                  setProfileOpen((prev) => !prev)
                }}
                title="Account settings"
              >
                <span className="portal-topbar-avatar">{initialsFor(user?.name)}</span>
                <div className="portal-profile-info">
                  <strong>Virexo Innovations</strong>
                  <small>{user?.name || 'Executive User'}</small>
                </div>
              </button>

              {profileOpen && (
                <div className="portal-profile-dropdown">
                  {/* Dark Theme Toggle */}
                  <div className="portal-profile-row theme-toggle-row">
                    <span>Dark Theme</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={dark}
                      className={`portal-theme-switch ${dark ? 'is-on' : ''}`}
                      onClick={() => {
                        soundEngine.playClick()
                        setDark((prev) => !prev)
                      }}
                    >
                      <span className="portal-theme-switch-knob" />
                    </button>
                  </div>

                  {/* Colour Theme Picker */}
                  <div className="portal-profile-row color-row">
                    <span>Theme colour</span>
                    <div className="portal-color-swatches">
                      {Object.entries(COLOR_THEMES).map(([key, theme]) => (
                        <button
                          key={key}
                          type="button"
                          className={`portal-color-swatch ${colorTheme === key ? 'is-active' : ''}`}
                          style={{ background: theme.accentGradient }}
                          aria-label={`Set ${theme.label} theme`}
                          title={theme.label}
                          onClick={() => {
                            soundEngine.playClick()
                            setColorTheme(key)
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="portal-profile-divider" />

                  {/* Replay Welcome */}
                  <button
                    type="button"
                    className="portal-profile-action"
                    onClick={() => {
                      soundEngine.playClick()
                      setReplayWelcome(true)
                      setProfileOpen(false)
                    }}
                  >
                    <FiShield /> Welcome Hub
                  </button>

                  {/* Accessibility */}
                  <button
                    type="button"
                    className="portal-profile-action"
                    onClick={() => {
                      soundEngine.playClick()
                      setA11yOpen((prev) => !prev)
                    }}
                  >
                    A Accessibility
                  </button>
                  {a11yOpen && (
                    <div className="portal-a11y-panel portal-a11y-panel-inline">
                      <button type="button" onClick={() => toggleA11y('textLevel')}>
                        Text size ({a11yPrefs.textLevel === 2 ? '130%' : a11yPrefs.textLevel === 1 ? '115%' : '100%'})
                      </button>
                      <button type="button" aria-pressed={a11yPrefs.contrast} onClick={() => toggleA11y('contrast')}>
                        High contrast
                      </button>
                      <button type="button" aria-pressed={a11yPrefs.motion} onClick={() => toggleA11y('motion')}>
                        Reduce motion
                      </button>
                    </div>
                  )}

                  <div className="portal-profile-divider" />

                  {/* Log Out */}
                  <button
                    type="button"
                    className="portal-profile-action portal-logout-action"
                    onClick={() => {
                      soundEngine.playClick()
                      logout()
                      setProfileOpen(false)
                    }}
                  >
                    <FiLogOut /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Content Panels */}
        <main className="portal-scroll-canvas">
          {/* ===================== TAB 1: OVERVIEW ===================== */}
          {tab === 'Overview' && (
            <div className="portal-panel-wrapper">
              {/* Welcome Banner */}
              <div className="portal-hero-banner">
                <div className="portal-hero-banner-content">
                  <span className="banner-eyebrow">
                    <FiCheck className="text-emerald" /> SYSTEMS SYNCHRONIZED
                  </span>
                  <h2>Welcome back, {firstName(user?.name)}.</h2>
                  <p>
                    Virexo Enterprise Operating Environment is live. Monitoring {candidates.length} talent candidates,{' '}
                    {performers.length} top-rated performers, and ${Math.round(pipelineValue / 1000)}k pipeline value.
                  </p>
                  <div className="banner-actions">
                    <button
                      type="button"
                      className="banner-primary-btn"
                      onClick={() => {
                        soundEngine.playClick()
                        setTab('Candidates')
                      }}
                    >
                      <FiUsers /> Review Talent Pipeline
                    </button>
                    <button
                      type="button"
                      className="banner-ghost-btn"
                      onClick={() => {
                        soundEngine.playClick()
                        setTab('Best Performers')
                      }}
                    >
                      <FiAward /> ⭐ Hall of Fame Podium
                    </button>
                    <button
                      type="button"
                      className="banner-ghost-btn"
                      onClick={() => printReport(buildDashboardReportHtml(internshipSnapshot))}
                    >
                      <FiDownload /> Print Report
                    </button>
                  </div>
                </div>
                <div className="portal-hero-banner-visual">
                  <div className="banner-radar-ring" />
                  <div className="banner-core-stats">
                    <strong>99.8%</strong>
                    <small>SLA Delivery</small>
                  </div>
                </div>
              </div>

              {/* Stat Cards Grid */}
              <div className="portal-stat-grid">
                <div className="portal-stat-card vx-ring-surface">
                  <div className="stat-card-header">
                    <span className="stat-icon-wrap text-cyan">
                      <FiUsers />
                    </span>
                    <span className="stat-trend-tag positive">+14% MoM</span>
                  </div>
                  <span className="stat-title">Candidates in Pipeline</span>
                  <div className="stat-big-val">
                    <StatCounter value={candidates.length} />
                  </div>
                  <small className="stat-sub">{candidates.filter((c) => c.status === 'Shortlisted').length} shortlisted for active sprints</small>
                </div>

                <div className="portal-stat-card vx-ring-surface">
                  <div className="stat-card-header">
                    <span className="stat-icon-wrap text-gold">
                      <FiAward />
                    </span>
                    <span className="stat-trend-tag gold-glow">Top 1% Talent</span>
                  </div>
                  <span className="stat-title">Top Performer Score</span>
                  <div className="stat-big-val">
                    <StatCounter value={99.8} decimals={1} suffix="%" />
                  </div>
                  <small className="stat-sub">Rank #1: Ayesha Khan (34 delivered)</small>
                </div>

                <div className="portal-stat-card vx-ring-surface">
                  <div className="stat-card-header">
                    <span className="stat-icon-wrap text-emerald">
                      <FiTrendingUp />
                    </span>
                    <span className="stat-trend-tag positive">Optimal</span>
                  </div>
                  <span className="stat-title">Active Pipeline Value</span>
                  <div className="stat-big-val">
                    <StatCounter value={Math.round(pipelineValue / 1000)} prefix="$" suffix="k" />
                  </div>
                  <small className="stat-sub">{requests.length} client discovery engagements</small>
                </div>

                <div className="portal-stat-card vx-ring-surface">
                  <div className="stat-card-header">
                    <span className="stat-icon-wrap text-purple">
                      <FiUserCheck />
                    </span>
                    <span className="stat-trend-tag positive">100% On-Time</span>
                  </div>
                  <span className="stat-title">Placed Talent Velocity</span>
                  <div className="stat-big-val">
                    <StatCounter value={24} suffix=" pros" />
                  </div>
                  <small className="stat-sub">Average time-to-deploy: 4.2 days</small>
                </div>
              </div>

              {/* Two Column Layout: Chart + Activity Stream */}
              <div className="portal-overview-cols">
                <div className="portal-card-box vx-ring-surface">
                  <div className="box-header-row">
                    <div>
                      <h3>Pipeline Velocity & Volume</h3>
                      <p className="box-subtitle">Client request growth across the previous 12 months</p>
                    </div>
                    <span className="box-tag">Live Feed</span>
                  </div>
                  <LineChart data={pipelineSeries} labels={months} height={220} />
                </div>

                <div className="portal-card-box vx-ring-surface">
                  <div className="box-header-row">
                    <div>
                      <h3>Live Telemetry & Activity Stream</h3>
                      <p className="box-subtitle">Real-time candidate milestones & sprint signals</p>
                    </div>
                    <button
                      type="button"
                      className="icon-button-small"
                      onClick={() => {
                        soundEngine.playClick()
                        setActivities(dataStore.getActivities())
                      }}
                      title="Refresh activity feed"
                    >
                      <FiRefreshCw />
                    </button>
                  </div>
                  <div className="portal-activity-timeline">
                    {activities.slice(0, 6).map((item) => (
                      <div className="activity-timeline-row" key={item.id}>
                        <div className={`activity-bullet ${item.type || 'info'}`} />
                        <div className="activity-content-col">
                          <div className="activity-title-line">
                            <strong>{item.title}</strong>
                            <time>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                          </div>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB: TASKS ===================== */}
          {tab === 'Tasks' && (
            <>
              <div className="tasks-view-toggle">
                <button
                  type="button"
                  className={taskView === 'list' ? 'is-active' : ''}
                  onClick={() => {
                    soundEngine.playClick()
                    setTaskView('list')
                    window.localStorage.setItem('virexo-tasks-view', 'list')
                  }}
                >
                  List view
                </button>
                <button
                  type="button"
                  className={taskView === 'board' ? 'is-active' : ''}
                  onClick={() => {
                    soundEngine.playClick()
                    setTaskView('board')
                    window.localStorage.setItem('virexo-tasks-view', 'board')
                  }}
                >
                  Board view
                </button>
              </div>
              {taskView === 'list' ? (
                <TasksPanel
                  tasks={tasks}
                  setTasks={setTasks}
                  soundEngine={soundEngine}
                  notify={notify}
                  dataStore={dataStore}
                />
              ) : (
                <TaskBoard notify={notify} />
              )}
            </>
          )}

          {/* ===================== TAB 2: BEST PERFORMERS (HALL OF FAME) ===================== */}
          {tab === 'Best Performers' && (
            <div className="portal-panel-wrapper">
              <div className="section-title-banner">
                <div>
                  <span className="banner-eyebrow">
                    <FiStar className="text-gold" /> VIREXO HALL OF FAME
                  </span>
                  <h2>Best Performers & Talent Champions</h2>
                  <p>
                    Recognizing top engineers, designers, and systems architects with exceptional client satisfaction,
                    flawless on-time delivery, and peer Kudos.
                  </p>
                </div>
                <div className="section-banner-controls">
                  <div className="filter-pill-group">
                    {performerDepartments.map((dept) => (
                      <button
                        key={dept}
                        type="button"
                        className={`filter-pill-btn ${selectedDepartment === dept ? 'is-active' : ''}`}
                        onClick={() => {
                          soundEngine.playClick()
                          setSelectedDepartment(dept)
                        }}
                      >
                        {dept}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3D-Styled Top 3 Podium Showcase */}
              <div className="podium-showcase-container">
                {/* 2nd Place: Silver */}
                {performers[1] && (
                  <div className="podium-slot rank-2">
                    <div className="podium-avatar-shell">
                      <div className="podium-medal-badge silver">🥈 #2</div>
                      <div className="podium-avatar" style={{ background: performers[1].avatarColor }}>
                        {initialsFor(performers[1].name)}
                      </div>
                    </div>
                    <div className="podium-info-card">
                      <h3>{performers[1].name}</h3>
                      <span className="podium-role">{performers[1].role}</span>
                      <span className="podium-dept-chip">{performers[1].department}</span>
                      <div className="podium-kpi-row">
                        <div>
                          <strong>{performers[1].score}%</strong>
                          <small>Score</small>
                        </div>
                        <div>
                          <strong>{performers[1].projectsCompleted}</strong>
                          <small>Projects</small>
                        </div>
                        <div>
                          <strong>{performers[1].kudos}</strong>
                          <small>Kudos</small>
                        </div>
                      </div>
                      <p className="podium-accomplishment">"{performers[1].accomplishment}"</p>
                      <div className="podium-action-bar">
                        <button
                          type="button"
                          className="podium-kudos-btn"
                          onClick={() => handleAwardKudos(performers[1])}
                        >
                          <FiHeart /> +1 Kudos ({performers[1].kudos})
                        </button>
                        <button
                          type="button"
                          className="podium-dossier-btn"
                          onClick={() => setActivePerformerDossier(performers[1])}
                        >
                          <FiEye /> Dossier
                        </button>
                      </div>
                    </div>
                    <div className="podium-pedestal pedestal-silver">
                      <span>2</span>
                    </div>
                  </div>
                )}

                {/* 1st Place: Gold (Center & Elevated) */}
                {performers[0] && (
                  <div className="podium-slot rank-1">
                    <div className="crown-glow">👑</div>
                    <div className="podium-avatar-shell">
                      <div className="podium-medal-badge gold">🥇 #1 MVP</div>
                      <div className="podium-avatar gold-ring" style={{ background: performers[0].avatarColor }}>
                        {initialsFor(performers[0].name)}
                      </div>
                    </div>
                    <div className="podium-info-card highlighted">
                      <span className="mvp-label">EXECUTIVE MVP</span>
                      <h3>{performers[0].name}</h3>
                      <span className="podium-role">{performers[0].role}</span>
                      <span className="podium-dept-chip">{performers[0].department}</span>
                      <div className="podium-kpi-row">
                        <div>
                          <strong className="text-gold">{performers[0].score}%</strong>
                          <small>Score</small>
                        </div>
                        <div>
                          <strong>{performers[0].projectsCompleted}</strong>
                          <small>Projects</small>
                        </div>
                        <div>
                          <strong>{performers[0].kudos}</strong>
                          <small>Kudos</small>
                        </div>
                      </div>
                      <p className="podium-accomplishment">"{performers[0].accomplishment}"</p>
                      <div className="podium-action-bar">
                        <button
                          type="button"
                          className="podium-kudos-btn gold-btn"
                          onClick={() => handleAwardKudos(performers[0])}
                        >
                          <FiHeart /> +1 Kudos ({performers[0].kudos})
                        </button>
                        <button
                          type="button"
                          className="podium-dossier-btn"
                          onClick={() => setActivePerformerDossier(performers[0])}
                        >
                          <FiEye /> Dossier
                        </button>
                      </div>
                    </div>
                    <div className="podium-pedestal pedestal-gold">
                      <span>1</span>
                    </div>
                  </div>
                )}

                {/* 3rd Place: Bronze */}
                {performers[2] && (
                  <div className="podium-slot rank-3">
                    <div className="podium-avatar-shell">
                      <div className="podium-medal-badge bronze">🥉 #3</div>
                      <div className="podium-avatar" style={{ background: performers[2].avatarColor }}>
                        {initialsFor(performers[2].name)}
                      </div>
                    </div>
                    <div className="podium-info-card">
                      <h3>{performers[2].name}</h3>
                      <span className="podium-role">{performers[2].role}</span>
                      <span className="podium-dept-chip">{performers[2].department}</span>
                      <div className="podium-kpi-row">
                        <div>
                          <strong>{performers[2].score}%</strong>
                          <small>Score</small>
                        </div>
                        <div>
                          <strong>{performers[2].projectsCompleted}</strong>
                          <small>Projects</small>
                        </div>
                        <div>
                          <strong>{performers[2].kudos}</strong>
                          <small>Kudos</small>
                        </div>
                      </div>
                      <p className="podium-accomplishment">"{performers[2].accomplishment}"</p>
                      <div className="podium-action-bar">
                        <button
                          type="button"
                          className="podium-kudos-btn"
                          onClick={() => handleAwardKudos(performers[2])}
                        >
                          <FiHeart /> +1 Kudos ({performers[2].kudos})
                        </button>
                        <button
                          type="button"
                          className="podium-dossier-btn"
                          onClick={() => setActivePerformerDossier(performers[2])}
                        >
                          <FiEye /> Dossier
                        </button>
                      </div>
                    </div>
                    <div className="podium-pedestal pedestal-bronze">
                      <span>3</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Complete Leaderboard Grid */}
              <div className="leaderboard-grid-wrapper">
                <h3>All Talent Leaderboard Profiles</h3>
                <div className="leaderboard-cards-grid">
                  {visiblePerformers.map((performer) => (
                    <div className="leaderboard-card" key={performer.id}>
                      <div className="leaderboard-card-top">
                        <div className="leaderboard-rank-pill">Rank #{performer.rank}</div>
                        <div className="leaderboard-badge-list">
                          {(performer.badges || []).map((b) => (
                            <span key={b} className="performer-badge-chip">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="leaderboard-user-row">
                        <div className="leaderboard-avatar" style={{ background: performer.avatarColor }}>
                          {initialsFor(performer.name)}
                        </div>
                        <div>
                          <h4>{performer.name}</h4>
                          <span className="leaderboard-user-role">{performer.role}</span>
                          <span className="leaderboard-user-dept">{performer.department}</span>
                        </div>
                      </div>

                      <div className="leaderboard-metrics-strip">
                        <div>
                          <span>Delivery SLA</span>
                          <strong>{performer.onTimeRate}</strong>
                        </div>
                        <div>
                          <span>Rating</span>
                          <strong className="text-gold">★ {performer.rating}</strong>
                        </div>
                        <div>
                          <span>Score</span>
                          <strong className="text-cyan">{performer.score}%</strong>
                        </div>
                        <div>
                          <span>Streak</span>
                          <strong>{performer.streak}</strong>
                        </div>
                      </div>

                      <div className="leaderboard-card-actions">
                        <button
                          type="button"
                          className="btn-kudos-action"
                          onClick={() => handleAwardKudos(performer)}
                        >
                          <FiHeart className="heart-icon" /> +1 Kudos ({performer.kudos})
                        </button>
                        <button
                          type="button"
                          className="btn-dossier-action"
                          onClick={() => setActivePerformerDossier(performer)}
                        >
                          View Dossier ↗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================== TAB 3: CANDIDATES HUB ===================== */}
          {tab === 'Candidates' && (
            <div className="portal-panel-wrapper">
              <div className="section-title-banner">
                <div>
                  <span className="banner-eyebrow">
                    <FiUsers className="text-cyan" /> TALENT PIPELINE MANAGEMENT
                  </span>
                  <h2>Active Candidate Ecosystem</h2>
                  <p>Screen, interview, and deploy top software engineers, UI/UX virtuosos, and AI researchers.</p>
                </div>
                <div className="section-banner-controls">
                  <Button variant="ghost" onClick={exportCandidatesCsv}>
                    <FiDownload /> Export CSV
                  </Button>
                  <Button variant="ghost" onClick={() => setCsvModalOpen(true)}>
                    <FiUpload /> Import CSV
                  </Button>
                  <Button onClick={() => setCandidateModalOpen(true)}>
                    <FiPlus /> Enroll Candidate
                  </Button>
                </div>
              </div>

              {/* Kanban Status Count Filter Pills */}
              <div className="kanban-status-pills-bar">
                {candidateStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`kanban-pill-btn ${selectedStatus === st ? 'is-active' : ''}`}
                    onClick={() => {
                      soundEngine.playClick()
                      setSelectedStatus(st)
                    }}
                  >
                    <span>{st}</span>
                    <span className="kanban-pill-count">{statusCounts[st] || 0}</span>
                  </button>
                ))}
              </div>

              {/* Filters Bar: Search & Category */}
              <div className="portal-filter-bar">
                <div className="portal-search-box">
                  <FiSearch className="search-icon" />
                  <input
                    type="search"
                    value={candidateQuery}
                    onChange={(e) => setCandidateQuery(e.target.value)}
                    placeholder="Search candidate name, role, or stack (e.g. Next.js, Python)..."
                    aria-label="Search candidates"
                  />
                  {candidateQuery && (
                    <button type="button" className="clear-search-btn" onClick={() => setCandidateQuery('')}>
                      <FiX />
                    </button>
                  )}
                </div>

                <div className="portal-category-select-wrap">
                  <FiFilter className="filter-icon" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => {
                      soundEngine.playClick()
                      setSelectedCategory(e.target.value)
                    }}
                    aria-label="Filter by discipline"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        Discipline: {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Candidates Table / Grid */}
              <div className="candidates-table-card">
                <table className="pro-candidates-table">
                  <thead>
                    <tr>
                      <th>Candidate & Details</th>
                      <th>Discipline</th>
                      <th>Rate & Exp</th>
                      <th>Match & Rating</th>
                      <th>Status</th>
                      <th>Pipeline Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleCandidates.length ? (
                      visibleCandidates.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <div className="candidate-name-cell">
                              <div className="candidate-avatar-bubble" style={{ background: c.avatarColor }}>
                                {initialsFor(c.name)}
                              </div>
                              <div>
                                <strong className="candidate-title">{c.name}</strong>
                                <span className="candidate-subrole">{c.role}</span>
                                <div className="candidate-skills-wrap">
                                  {(c.skills || []).slice(0, 3).map((sk) => (
                                    <span key={sk} className="cand-skill-tag">
                                      {sk}
                                    </span>
                                  ))}
                                  {(c.skills || []).length > 3 && (
                                    <span className="cand-skill-more">+{c.skills.length - 3}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="discipline-tag">{c.category}</span>
                          </td>
                          <td>
                            <strong>${c.rate?.toLocaleString()}/mo</strong>
                            <small className="mut block">{c.experience}</small>
                          </td>
                          <td>
                            <div className="match-cell">
                              <span className="match-score-badge">{c.matchScore}% Match</span>
                              <span className="rating-star-text">★ {c.rating}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-chip status-${c.status.toLowerCase().replace(/\s+/g, '-')}`}>
                              {c.status}
                            </span>
                          </td>
                          <td>
                            <div className="pipeline-action-buttons">
                              <button
                                type="button"
                                className="action-btn shortlist-btn"
                                title="Move to Shortlisted"
                                onClick={() => handleSetCandidateStatus(c.id, 'Shortlisted')}
                              >
                                Shortlist
                              </button>
                              <button
                                type="button"
                                className="action-btn interview-btn"
                                title="Schedule Interview"
                                onClick={() => handleSetCandidateStatus(c.id, 'Interviewing')}
                              >
                                Interview
                              </button>
                              <button
                                type="button"
                                className="action-btn hire-btn"
                                title="Mark Hired"
                                onClick={() => handleSetCandidateStatus(c.id, 'Hired')}
                              >
                                Hire
                              </button>
                              <button
                                type="button"
                                className="action-btn dossier-btn"
                                title="View Complete Dossier"
                                onClick={() => setActiveCandidateDossier(c)}
                              >
                                Dossier ↗
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="candidates-empty-row">
                          <FiUsers className="empty-icon" />
                          <p>No candidates match the active filter or search criteria.</p>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              setSelectedStatus('All')
                              setSelectedCategory('All')
                              setCandidateQuery('')
                            }}
                          >
                            Reset Filters
                          </Button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ===================== TAB 4: AI TALENT MATCHER ===================== */}
          {tab === 'AI Talent Matcher' && (
            <div className="portal-panel-wrapper">
              <div className="section-title-banner">
                <div>
                  <span className="banner-eyebrow">
                    <FiZap className="text-cyan" /> AUTONOMOUS SCREENING ENGINE
                  </span>
                  <h2>AI Candidate Matcher & Screener</h2>
                  <p>
                    Run real-time deep semantic evaluations to find the exact talent fit for active sprint architectures.
                  </p>
                </div>
              </div>

              {/* Requirement Selector & Scanner Interface */}
              <div className="ai-matcher-interface-card">
                <div className="ai-presets-selection">
                  <label className="ai-section-label">Select Sprint Role Preset:</label>
                  <div className="ai-preset-chips-grid">
                    {aiPresetRequirements.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        className={`ai-preset-chip ${aiSelectedPreset === preset.id ? 'is-selected' : ''}`}
                        onClick={() => {
                          soundEngine.playClick()
                          setAiSelectedPreset(preset.id)
                          setAiCustomQuery(preset.query)
                        }}
                      >
                        <strong>{preset.title}</strong>
                        <small>Target Range: {preset.budget}</small>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="ai-custom-query-box">
                  <label htmlFor="ai-query-input" className="ai-section-label">
                    Target Tech Stack & Key Requirements (Semantic Vector Search):
                  </label>
                  <div className="ai-input-row">
                    <input
                      id="ai-query-input"
                      type="text"
                      value={aiCustomQuery}
                      onChange={(e) => setAiCustomQuery(e.target.value)}
                      placeholder="e.g. Next.js, Distributed Go microservices, high-traffic APIs, Docker..."
                    />
                    <button
                      type="button"
                      className="ai-run-scan-btn"
                      disabled={aiScanning}
                      onClick={handleRunAiMatching}
                    >
                      <FiZap className={aiScanning ? 'spin-fast' : ''} />
                      <span>{aiScanning ? 'Evaluating Talent Matrix...' : 'Run AI Screening'}</span>
                    </button>
                  </div>
                </div>

                {/* Animated Scanning Radar Indicator */}
                {aiScanning && (
                  <div className="ai-scanning-status-bar">
                    <div className="scanner-beam" />
                    <span>Analyzing 9 talent profiles against semantic criteria...</span>
                  </div>
                )}
              </div>

              {/* AI Results Section */}
              {aiMatches.length > 0 && !aiScanning && (
                <div className="ai-results-wrapper">
                  <div className="ai-results-header">
                    <h3>Top Matched Talent Recommendations</h3>
                    <span className="ai-confidence-badge">High Confidence (96%+)</span>
                  </div>

                  <div className="ai-matches-grid">
                    {aiMatches.map((cand, idx) => (
                      <div className="ai-match-card" key={cand.id}>
                        <div className="ai-match-card-top">
                          <span className="ai-match-rank">Top Match #{idx + 1}</span>
                          <span className="ai-score-pill">{cand.computedMatch}% Match</span>
                        </div>

                        <div className="ai-candidate-info">
                          <div className="ai-avatar" style={{ background: cand.avatarColor }}>
                            {initialsFor(cand.name)}
                          </div>
                          <div>
                            <h4>{cand.name}</h4>
                            <span className="ai-role">{cand.role}</span>
                            <small className="ai-rate">${cand.rate}/mo · {cand.experience}</small>
                          </div>
                        </div>

                        <div className="ai-reasoning-box">
                          <span className="ai-label">AI Match Rationale:</span>
                          <p>{cand.reasoning}</p>
                        </div>

                        <div className="ai-matched-tags">
                          {(cand.skills || []).map((sk) => (
                            <span key={sk} className="ai-skill-tag">
                              {sk}
                            </span>
                          ))}
                        </div>

                        <div className="ai-card-actions">
                          <button
                            type="button"
                            className="ai-btn-primary"
                            onClick={() => handleSetCandidateStatus(cand.id, 'Interviewing')}
                          >
                            Schedule Interview
                          </button>
                          <button
                            type="button"
                            className="ai-btn-ghost"
                            onClick={() => setActiveCandidateDossier(cand)}
                          >
                            View Full Dossier
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAB 5: PROJECTS ===================== */}
          {tab === 'Projects' && (
            <div className="portal-panel-wrapper">
              <div className="section-title-banner">
                <div>
                  <span className="banner-eyebrow">
                    <FiTrendingUp className="text-emerald" /> SPRINT DELIVERY
                  </span>
                  <h2>Active Projects & Operations</h2>
                  <p>Track milestone completion, sprint progress, and dedicated engineering pods.</p>
                </div>
                <div className="section-banner-controls">
                  <Button onClick={() => setProjectModalOpen(true)}>
                    <FiPlus /> New Project
                  </Button>
                </div>
              </div>

              <div className="ops-project-grid">
                {projects.map((project) => (
                  <article className="ops-project-card" key={project.id}>
                    <div className="ops-project-top">
                      <h3>{project.name}</h3>
                      <span className={`status-chip status-${project.status.toLowerCase().replace(/\s+/g, '-')}`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="mut small">
                      {project.client} · {project.category} · Due {project.due}
                    </p>
                    <div className="progress-track">
                      <span className="progress-bar" style={{ width: `${project.progress}%` }} />
                    </div>
                    <span className="mut small">{project.progress}% complete</span>
                    <div className="ops-project-foot">
                      <span className="avatar-stack">
                        {project.team.map((init) => (
                          <span className="avatar-chip" key={init}>
                            {init}
                          </span>
                        ))}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* ===================== TAB 6: ANALYTICS ===================== */}
          {tab === 'Progress' && (
            <ProgressPanel
              snapshot={internshipSnapshot}
              notify={notify}
              focusCandidateId={focusCandidateId}
              themeKey={`${dark ? 'dark' : 'light'}-${colorTheme}`}
            />
          )}

          {tab === 'Leads' && (
            <div className="portal-panel-wrapper portal-leads-panel">
              <div className="section-title-banner"><div><span className="banner-eyebrow"><FiInbox /> LIVE PIPELINE</span><h2>Enquiries & applications</h2><p>Website contacts and CV applications appear here instantly.</p></div><button type="button" className="banner-primary-btn" onClick={() => downloadCsv('virexo-leads.csv', leads)}><FiDownload /> Export CSV</button></div>
              <div className="portal-stat-grid"><div className="portal-stat-card vx-ring-surface"><span className="stat-title">Total leads</span><div className="stat-big-val">{leads.length}</div></div><div className="portal-stat-card vx-ring-surface"><span className="stat-title">New</span><div className="stat-big-val">{leads.filter((lead) => lead.status === 'New').length}</div></div><div className="portal-stat-card vx-ring-surface"><span className="stat-title">Enquiries</span><div className="stat-big-val">{leads.filter((lead) => lead.type === 'Enquiry').length}</div></div><div className="portal-stat-card vx-ring-surface"><span className="stat-title">CV applications</span><div className="stat-big-val">{leads.filter((lead) => lead.type === 'CV Application').length}</div></div></div>
              <div className="portal-lead-toolbar"><FiFilter /><label htmlFor="lead-filter">Show</label><select id="lead-filter" value={leadFilter} onChange={(event) => setLeadFilter(event.target.value)}><option>All</option><option>Enquiry</option><option>CV Application</option><option>New</option><option>In Review</option><option>Closed</option></select><span><FiHeart /> {getFavourites().length} saved items</span></div>
              <div className="portal-lead-grid">{leads.filter((lead) => leadFilter === 'All' || lead.type === leadFilter || lead.status === leadFilter).map((lead) => <article className="portal-card-box vx-ring-surface" key={lead.id}><div className="portal-lead-head"><span className={`portal-lead-type ${lead.type === 'CV Application' ? 'cv' : ''}`}>{lead.type}</span><time>{new Date(lead.createdAt).toLocaleString()}</time></div><h3>{lead.name || 'Unnamed lead'}</h3><p>{lead.email} {lead.company ? `· ${lead.company}` : ''}</p><p>{lead.description || lead.specialization || 'No additional details.'}</p>{lead.fileName && <small>Attachment: {lead.fileName}</small>}<label>Status<select value={lead.status} onChange={(event) => { leadStore.update(lead.id, { status: event.target.value }); setLeads(leadStore.getAll()) }}><option>New</option><option>In Review</option><option>Closed</option></select></label></article>)}{!leads.length && <div className="portal-card-box vx-ring-surface"><h3>No leads yet</h3><p>Submit the public contact or CV form to test the live pipeline.</p></div>}</div>
            </div>
          )}

          {tab === 'Analytics' && (
            <div className="portal-panel-wrapper">
              <div className="section-title-banner">
                <div>
                  <span className="banner-eyebrow">
                    <FiStar className="text-purple" /> BUSINESS INTELLIGENCE
                  </span>
                  <h2>Platform Intelligence & Telemetry</h2>
                  <p>Overview of inquiries, conversion efficiency, satisfaction SLA, and capacity distribution.</p>
                </div>
              </div>

              <div className="portal-stat-grid">
                <div className="portal-stat-card vx-ring-surface">
                  <span className="stat-title">Client Requests</span>
                  <div className="stat-big-val">
                    <StatCounter value={requests.length} />
                  </div>
                </div>
                <div className="portal-stat-card vx-ring-surface">
                  <span className="stat-title">Conversion Velocity</span>
                  <div className="stat-big-val">
                    <StatCounter value={32} suffix="%" />
                  </div>
                </div>
                <div className="portal-stat-card vx-ring-surface">
                  <span className="stat-title">Client Satisfaction</span>
                  <div className="stat-big-val">
                    <StatCounter value={4.98} decimals={2} />
                  </div>
                </div>
                <div className="portal-stat-card vx-ring-surface">
                  <span className="stat-title">Active Pods</span>
                  <div className="stat-big-val">
                    <StatCounter value={12} suffix=" squads" />
                  </div>
                </div>
              </div>

              <div className="portal-overview-cols">
                <div className="portal-card-box vx-ring-surface">
                  <h3>Pipeline Trajectory (12 Months)</h3>
                  <LineChart data={pipelineSeries} labels={months} />
                </div>
                <div className="portal-card-box vx-ring-surface">
                  <h3>Client Retention & Loyalty</h3>
                  <DonutChart percent={98} label="Client retention" />
                </div>
              </div>

              <div className="portal-card-box vx-ring-surface" style={{ marginTop: '24px' }}>
                <h3>Inquiries by Discipline</h3>
                <BarChart items={categoryCounts} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===================== MODAL: IMPORT CANDIDATES CSV ===================== */}
      <CsvImportModal
        open={csvModalOpen}
        onClose={() => setCsvModalOpen(false)}
        existingCandidates={internshipSnapshot.candidates}
        notify={notify}
      />

      {/* ===================== MODAL 1: ADD CANDIDATE ===================== */}
      <Modal open={candidateModalOpen} onClose={() => setCandidateModalOpen(false)} label="Enroll Candidate">
        <div className="modal-inner-head">
          <h3>Enroll New Talent Profile</h3>
          <p>Add a verified software engineer or designer to the active talent pipeline.</p>
        </div>
        <form onSubmit={submitCandidate} noValidate className="modal-form-grid">
          <FormField
            label="Full Name"
            name="name"
            value={candidateForm.name}
            error={candidateErrors.name}
            onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
            placeholder="e.g. Zaid Malik"
          />
          <FormField
            label="Role / Title"
            name="role"
            value={candidateForm.role}
            error={candidateErrors.role}
            onChange={(e) => setCandidateForm({ ...candidateForm, role: e.target.value })}
            placeholder="e.g. Senior Full-Stack Engineer"
          />
          <div className="form-row">
            <FormField
              label="Discipline"
              name="category"
              type="select"
              value={candidateForm.category}
              onChange={(e) => setCandidateForm({ ...candidateForm, category: e.target.value })}
              options={categories.filter((c) => c !== 'All')}
            />
            <FormField
              label="Monthly Rate ($)"
              name="rate"
              type="number"
              value={candidateForm.rate}
              error={candidateErrors.rate}
              onChange={(e) => setCandidateForm({ ...candidateForm, rate: e.target.value })}
            />
          </div>
          <FormField
            label="Key Skills (comma-separated)"
            name="skills"
            value={candidateForm.skills}
            onChange={(e) => setCandidateForm({ ...candidateForm, skills: e.target.value })}
            placeholder="React, Node.js, GraphQL, PostgreSQL"
          />
          <FormField
            label="Education / Institution"
            name="education"
            value={candidateForm.education}
            onChange={(e) => setCandidateForm({ ...candidateForm, education: e.target.value })}
            placeholder="BS Computer Science, NUST"
          />
          <FormField
            label="Professional Bio / Focus"
            name="bio"
            value={candidateForm.bio}
            onChange={(e) => setCandidateForm({ ...candidateForm, bio: e.target.value })}
            placeholder="Key accomplishments and specialized systems built..."
          />
          <Button type="submit">
            <FiPlus /> Enroll Candidate Profile
          </Button>
        </form>
      </Modal>

      {/* ===================== MODAL 2: CANDIDATE DOSSIER ===================== */}
      <Modal
        open={Boolean(activeCandidateDossier)}
        onClose={() => setActiveCandidateDossier(null)}
        label="Candidate Profile Dossier"
      >
        {activeCandidateDossier && (
          <div className="dossier-modal-content">
            <div className="dossier-header-bar">
              <div
                className="dossier-avatar-large"
                style={{ background: activeCandidateDossier.avatarColor }}
              >
                {initialsFor(activeCandidateDossier.name)}
              </div>
              <div>
                <h2>{activeCandidateDossier.name}</h2>
                <span className="dossier-role-title">{activeCandidateDossier.role}</span>
                <div className="dossier-tags-row">
                  <span className="discipline-tag">{activeCandidateDossier.category}</span>
                  <span className="dossier-status-pill">{activeCandidateDossier.status}</span>
                </div>
              </div>
            </div>

            <div className="dossier-stats-strip">
              <div>
                <span>Monthly Compensation</span>
                <strong>${activeCandidateDossier.rate?.toLocaleString()}/mo</strong>
              </div>
              <div>
                <span>Industry Experience</span>
                <strong>{activeCandidateDossier.experience}</strong>
              </div>
              <div>
                <span>AI Suitability Score</span>
                <strong className="text-cyan">{activeCandidateDossier.matchScore}%</strong>
              </div>
              <div>
                <span>Peer Rating</span>
                <strong className="text-gold">★ {activeCandidateDossier.rating}</strong>
              </div>
            </div>

            <div className="dossier-section">
              <h4>Professional Summary</h4>
              <p>{activeCandidateDossier.bio}</p>
            </div>

            <div className="dossier-section">
              <h4>Verified Tech Stack & Tools</h4>
              <div className="dossier-skills-cluster">
                {(activeCandidateDossier.skills || []).map((sk) => (
                  <span key={sk} className="dossier-skill-pill">
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            <div className="dossier-section">
              <h4>Academic Background</h4>
              <p>{activeCandidateDossier.education}</p>
            </div>

            <div className="dossier-actions-footer">
              <button
                type="button"
                className="dossier-primary-action"
                onClick={() => {
                  handleSetCandidateStatus(activeCandidateDossier.id, 'Interviewing')
                  setActiveCandidateDossier(null)
                }}
              >
                Schedule Technical Interview
              </button>
              <button
                type="button"
                className="dossier-hire-action"
                onClick={() => {
                  handleSetCandidateStatus(activeCandidateDossier.id, 'Hired')
                  setActiveCandidateDossier(null)
                }}
              >
                Send Offer / Mark Hired
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================== MODAL 3: BEST PERFORMER DOSSIER ===================== */}
      <Modal
        open={Boolean(activePerformerDossier)}
        onClose={() => setActivePerformerDossier(null)}
        label="Performer Accolades Dossier"
      >
        {activePerformerDossier && (
          <div className="dossier-modal-content">
            <div className="dossier-header-bar">
              <div
                className="dossier-avatar-large"
                style={{ background: activePerformerDossier.avatarColor }}
              >
                {initialsFor(activePerformerDossier.name)}
              </div>
              <div>
                <h2>{activePerformerDossier.name}</h2>
                <span className="dossier-role-title">{activePerformerDossier.role}</span>
                <div className="dossier-tags-row">
                  <span className="discipline-tag">{activePerformerDossier.department}</span>
                  <span className="podium-medal-badge gold">Rank #{activePerformerDossier.rank}</span>
                </div>
              </div>
            </div>

            <div className="dossier-stats-strip">
              <div>
                <span>Performance Score</span>
                <strong className="text-cyan">{activePerformerDossier.score}%</strong>
              </div>
              <div>
                <span>Completed Projects</span>
                <strong>{activePerformerDossier.projectsCompleted} Sprints</strong>
              </div>
              <div>
                <span>On-Time SLA</span>
                <strong className="text-emerald">{activePerformerDossier.onTimeRate}</strong>
              </div>
              <div>
                <span>Community Kudos</span>
                <strong className="text-gold">♥ {activePerformerDossier.kudos}</strong>
              </div>
            </div>

            <div className="dossier-section">
              <h4>Key Milestone & Accomplishment</h4>
              <p className="accomplishment-highlight">"{activePerformerDossier.accomplishment}"</p>
            </div>

            <div className="dossier-section">
              <h4>Honorary Badges & Recognitions</h4>
              <div className="dossier-skills-cluster">
                {(activePerformerDossier.badges || []).map((badge) => (
                  <span key={badge} className="performer-badge-chip">
                    ✦ {badge}
                  </span>
                ))}
              </div>
            </div>

            <div className="dossier-actions-footer">
              <button
                type="button"
                className="dossier-primary-action"
                onClick={() => {
                  handleAwardKudos(activePerformerDossier)
                  setActivePerformerDossier(null)
                }}
              >
                Award Kudos Appreciation
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* ===================== MODAL 4: NEW PROJECT ===================== */}
      <Modal open={projectModalOpen} onClose={() => setProjectModalOpen(false)} label="Initiate Project">
        <div className="modal-inner-head">
          <h3>Initiate Client Project</h3>
          <p>Create an operational project milestone tracked in the Virexo OS.</p>
        </div>
        <form onSubmit={submitProject} noValidate className="modal-form-grid">
          <FormField
            label="Project Name"
            name="name"
            value={projectForm.name}
            error={projectErrors.name}
            onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
            placeholder="e.g. Aurelia Core Platform v3"
          />
          <FormField
            label="Client Enterprise"
            name="client"
            value={projectForm.client}
            error={projectErrors.client}
            onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
            placeholder="e.g. Aurelia Labs"
          />
          <div className="form-row">
            <FormField
              label="Category"
              name="category"
              type="select"
              value={projectForm.category}
              onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
              options={categories.filter((c) => c !== 'All')}
            />
            <FormField
              label="Target Due Date"
              name="due"
              type="date"
              value={projectForm.due}
              error={projectErrors.due}
              onChange={(e) => setProjectForm({ ...projectForm, due: e.target.value })}
            />
          </div>
          <Button type="submit">Initiate Milestone</Button>
        </form>
      </Modal>

      <PortalCopilotWidget notify={notify} onNavigate={setTab} onFocusCandidate={setFocusCandidateId} />
      <div id="print-report" aria-hidden="true" />

      {/* ===================== REPLAY WELCOME SPLASH ===================== */}
      {replayWelcome && (
        <WelcomeSplash
          user={user}
          onEnterPortal={() => setReplayWelcome(false)}
          onEnterWebsite={() => {
            setReplayWelcome(false)
            soundEngine.playClick()
            window.location.href = '/'
          }}
        />
      )}
    </div>
  )
}
