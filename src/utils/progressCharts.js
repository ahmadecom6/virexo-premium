// Progress Charts — Chart.js (loaded via CDN) rendering + pure data computations.
// Every function here reads from the existing internshipStore state (candidates/tasks/
// progress); nothing is invented or hardcoded. The same compute functions are reused
// everywhere a count/percentage is displayed so charts and stat cards can never drift
// out of sync with each other.

let chartJsPromise = null

export function loadChartJs() {
  if (window.Chart) return Promise.resolve(window.Chart)
  if (chartJsPromise) return chartJsPromise
  chartJsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js'
    script.onload = () => resolve(window.Chart)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return chartJsPromise
}

// Reads live theme colors from CSS custom properties instead of hardcoding hex values,
// so charts follow the dark/light toggle and the active accent color automatically.
export function readChartTheme() {
  const styles = getComputedStyle(document.documentElement)
  const pick = (name, fallback) => styles.getPropertyValue(name).trim() || fallback
  return {
    text: pick('--text-secondary', '#94a3b8'),
    grid: pick('--border-color', 'rgba(148,163,184,0.15)'),
    accent: pick('--theme-accent', '#00f2fe'),
    accentBright: pick('--theme-accent-bright', '#38bdf8'),
  }
}

const ratioOf = (entry) => (entry && entry.tasksTotal ? entry.tasksCompleted / entry.tasksTotal : 0)

/** Average completion % across all candidates, grouped by week number. */
export function computeWeeklyTrend(progress) {
  const weeks = [...new Set(progress.map((entry) => entry.week))].sort((a, b) => a - b)
  const averages = weeks.map((week) => {
    const entries = progress.filter((entry) => entry.week === week)
    const total = entries.reduce((sum, entry) => sum + ratioOf(entry), 0)
    return entries.length ? Math.round((total / entries.length) * 100) : 0
  })
  return { weeks, averages }
}

/** One candidate's completion % per week, sorted ascending by week. */
export function computeCandidateWeeklyCompletion(candidateId, progress) {
  const history = progress.filter((entry) => entry.candidateId === candidateId).sort((a, b) => a.week - b.week)
  return { weeks: history.map((entry) => entry.week), rates: history.map((entry) => Math.round(ratioOf(entry) * 100)) }
}

/** Hours logged per week, optionally filtered to a single candidate. */
export function computeHoursPerWeek(progress, candidateId = null) {
  const filtered = candidateId ? progress.filter((entry) => entry.candidateId === candidateId) : progress
  const weeks = [...new Set(filtered.map((entry) => entry.week))].sort((a, b) => a - b)
  const hours = weeks.map((week) =>
    filtered.filter((entry) => entry.week === week).reduce((sum, entry) => sum + Number(entry.hoursLogged || 0), 0)
  )
  return { weeks, hours }
}

/** Live task counts by status — the single source any status donut/stat card must use. */
export function computeTaskStatusCounts(tasks) {
  return {
    Pending: tasks.filter((task) => task.status === 'Pending').length,
    Submitted: tasks.filter((task) => task.status === 'Submitted').length,
    Reviewed: tasks.filter((task) => task.status === 'Reviewed').length,
  }
}

// --- Chart.js instance builders (caller owns destroy/recreate lifecycle) ---------

export function renderTrendLineChart(ChartJs, canvas, { weeks, averages }) {
  const theme = readChartTheme()
  return new ChartJs(canvas, {
    type: 'line',
    data: {
      labels: weeks.map((week) => `Week ${week}`),
      datasets: [
        {
          label: 'Average completion %',
          data: averages,
          borderColor: theme.accent,
          backgroundColor: `${theme.accent}33`,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: theme.accent,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: theme.text }, grid: { color: theme.grid } },
        y: { min: 0, max: 100, ticks: { color: theme.text, callback: (value) => `${value}%` }, grid: { color: theme.grid } },
      },
      plugins: { legend: { labels: { color: theme.text } } },
    },
  })
}

export function renderCandidateBarChart(ChartJs, canvas, { weeks, rates }) {
  const theme = readChartTheme()
  return new ChartJs(canvas, {
    type: 'bar',
    data: {
      labels: weeks.map((week) => `Week ${week}`),
      datasets: [
        {
          label: 'Completion %',
          data: rates,
          backgroundColor: rates.map((rate) => (rate >= 70 ? '#10b981' : '#f59e0b')),
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: theme.text }, grid: { display: false } },
        y: { min: 0, max: 100, ticks: { color: theme.text, callback: (value) => `${value}%` }, grid: { color: theme.grid } },
      },
      plugins: { legend: { display: false } },
    },
  })
}

export function renderHoursChart(ChartJs, canvas, { weeks, hours }) {
  const theme = readChartTheme()
  return new ChartJs(canvas, {
    type: 'bar',
    data: {
      labels: weeks.map((week) => `Week ${week}`),
      datasets: [{ label: 'Hours logged', data: hours, backgroundColor: theme.accentBright, borderRadius: 6 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { ticks: { color: theme.text }, grid: { display: false } },
        y: { ticks: { color: theme.text }, grid: { color: theme.grid } },
      },
      plugins: { legend: { labels: { color: theme.text } } },
    },
  })
}

export function renderStatusDonut(ChartJs, canvas, counts) {
  const theme = readChartTheme()
  return new ChartJs(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Pending', 'Submitted', 'Reviewed'],
      datasets: [{ data: [counts.Pending, counts.Submitted, counts.Reviewed], backgroundColor: ['#f59e0b', '#38bdf8', '#10b981'], borderWidth: 0 }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: theme.text } } },
    },
  })
}
