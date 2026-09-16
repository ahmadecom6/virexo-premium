// Print Report — builds a clean, theme-independent print layout from live state and
// triggers window.print() scoped to #print-report only (see the @media print rules in
// site.scss). HTML is generated fresh on every call; nothing is cached or hardcoded.

const ratioOf = (entry) => (entry && entry.tasksTotal ? entry.tasksCompleted / entry.tasksTotal : 0)

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
}

function formatToday() {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

function taskCountsFor(tasks) {
  return {
    Pending: tasks.filter((task) => task.status === 'Pending').length,
    Submitted: tasks.filter((task) => task.status === 'Submitted').length,
    Reviewed: tasks.filter((task) => task.status === 'Reviewed').length,
  }
}

function renderTasksTable(rows, { showCandidate }) {
  if (!rows.length) return '<p>No tasks recorded.</p>'
  return `
    <table class="print-table">
      <thead>
        <tr>
          <th>Task</th>
          ${showCandidate ? '<th>Candidate</th>' : ''}
          <th>Status</th>
          <th>Due date</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (task) => `
          <tr>
            <td>${escapeHtml(task.title)}</td>
            ${showCandidate ? `<td>${escapeHtml(task.candidateName)}</td>` : ''}
            <td>${escapeHtml(task.status)}</td>
            <td>${escapeHtml(task.dueDate)}</td>
          </tr>`
          )
          .join('')}
      </tbody>
    </table>
  `
}

/** Dashboard-wide summary report across every candidate and task. */
export function buildDashboardReportHtml(state) {
  const { candidates, tasks, progress } = state
  const counts = taskCountsFor(tasks)

  const latestRateFor = (candidateId) => {
    const history = progress.filter((entry) => entry.candidateId === candidateId).sort((a, b) => a.week - b.week)
    return ratioOf(history.at(-1))
  }
  const rates = candidates.map((candidate) => latestRateFor(candidate.id))
  const avgCompletion = rates.length ? Math.round((rates.reduce((sum, rate) => sum + rate, 0) / rates.length) * 100) : 0
  const totalHours = progress.reduce((sum, entry) => sum + Number(entry.hoursLogged || 0), 0)
  const onTrack = rates.filter((rate) => rate >= 0.7).length

  const taskRows = tasks
    .slice()
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .map((task) => ({ ...task, candidateName: candidates.find((candidate) => candidate.id === task.candidateId)?.name || 'Unassigned' }))

  return `
    <header class="print-header">
      <h1>Internship Management Portal — Weekly Report</h1>
      <p>Generated ${escapeHtml(formatToday())}</p>
    </header>
    <table class="print-summary-table">
      <tbody>
        <tr><th>Total candidates</th><td>${candidates.length}</td></tr>
        <tr><th>On track</th><td>${onTrack} of ${candidates.length}</td></tr>
        <tr><th>Average completion</th><td>${avgCompletion}%</td></tr>
        <tr><th>Total hours logged</th><td>${totalHours}</td></tr>
        <tr><th>Pending tasks</th><td>${counts.Pending}</td></tr>
        <tr><th>Submitted tasks</th><td>${counts.Submitted}</td></tr>
        <tr><th>Reviewed tasks</th><td>${counts.Reviewed}</td></tr>
      </tbody>
    </table>
    <h2>All tasks</h2>
    ${renderTasksTable(taskRows, { showCandidate: true })}
  `
}

/** Single-candidate detail report. */
export function buildCandidateReportHtml(candidate, state) {
  const { tasks, progress } = state
  const history = progress.filter((entry) => entry.candidateId === candidate.id).sort((a, b) => a.week - b.week)
  const latest = history.at(-1)
  const rate = ratioOf(latest)
  const totalHours = history.reduce((sum, entry) => sum + Number(entry.hoursLogged || 0), 0)
  const candidateTasks = tasks
    .filter((task) => task.candidateId === candidate.id)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  const counts = taskCountsFor(candidateTasks)

  return `
    <header class="print-header">
      <h1>Internship Management Portal — Weekly Report</h1>
      <p>Generated ${escapeHtml(formatToday())}</p>
      <p><strong>${escapeHtml(candidate.name)}</strong> · ${escapeHtml(candidate.department)} · Supervisor: ${escapeHtml(candidate.supervisor)}</p>
    </header>
    <table class="print-summary-table">
      <tbody>
        <tr><th>Status</th><td>${escapeHtml(candidate.status)}</td></tr>
        <tr><th>Standing</th><td>${rate >= 0.7 ? 'On Track' : 'At Risk'}</td></tr>
        <tr><th>Latest completion</th><td>${latest ? Math.round(rate * 100) : 0}% (Week ${latest?.week ?? 'N/A'})</td></tr>
        <tr><th>Total hours logged</th><td>${totalHours}</td></tr>
        <tr><th>Pending tasks</th><td>${counts.Pending}</td></tr>
        <tr><th>Submitted tasks</th><td>${counts.Submitted}</td></tr>
        <tr><th>Reviewed tasks</th><td>${counts.Reviewed}</td></tr>
      </tbody>
    </table>
    <h2>Tasks</h2>
    ${renderTasksTable(candidateTasks, { showCandidate: false })}
  `
}

/** Populates #print-report fresh, prints, then clears it once the print dialog closes. */
export function printReport(html) {
  const container = document.getElementById('print-report')
  if (!container) return
  container.innerHTML = html
  const cleanup = () => {
    container.innerHTML = ''
    window.removeEventListener('afterprint', cleanup)
  }
  window.addEventListener('afterprint', cleanup)
  window.print()
}
