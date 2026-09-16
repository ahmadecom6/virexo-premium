const severityRank = { high: 0, medium: 1, low: 2, positive: 3 }

const dateOnly = (value) => new Date(`${value}T00:00:00`)
const daysBetween = (from, to) => Math.max(0, Math.floor((to - from) / 86400000))
const candidateName = (state, candidateId) => state.candidates.find((candidate) => candidate.id === candidateId)?.name || 'Unknown candidate'
const currentWeek = (state) => Math.max(1, ...state.progress.map((entry) => Number(entry.week) || 0))
const progressRate = (entry) => entry?.tasksTotal ? Number(entry.tasksCompleted || 0) / Number(entry.tasksTotal) : 0
const historyFor = (state, candidateId) => state.progress.filter((entry) => entry.candidateId === candidateId).sort((a, b) => Number(a.week) - Number(b.week))

const insight = (type, severity, message, relatedId, actionLabel, action, signature = message) => ({
  type,
  severity,
  message,
  relatedId,
  actionLabel,
  action,
  key: `${type}:${relatedId}`,
  signature,
})

export function generateInsights(state, now = new Date()) {
  const insights = []
  const week = currentWeek(state)
  const overdueTasks = state.tasks.filter((task) => task.status === 'Pending' && dateOnly(task.dueDate) < dateOnly(now.toISOString().slice(0, 10)))

  overdueTasks.forEach((task) => {
    const overdueDays = daysBetween(dateOnly(task.dueDate), dateOnly(now.toISOString().slice(0, 10)))
    insights.push(insight('overdue-task', 'high', `${candidateName(state, task.candidateId)}'s task '${task.title}' is ${overdueDays} days overdue.`, task.id, 'Go to task', { tab: 'Tasks', taskId: task.id }))
  })

  state.candidates.forEach((candidate) => {
    const history = historyFor(state, candidate.id)
    const current = history.find((entry) => Number(entry.week) === week) || history.at(-1)
    if (!current || progressRate(current) < 0.7) {
      insights.push(insight('at-risk-candidate', 'medium', `${candidate.name} has logged no progress this week — check in with them.`, candidate.id, 'View candidate', { tab: 'Candidates', candidateId: candidate.id }))
    }

    if (history.length >= 3) {
      const rates = history.slice(-3).map(progressRate)
      if (rates[0] > rates[1] && rates[1] > rates[2]) {
        insights.push(insight('declining-trend', 'medium', `${candidate.name}'s completion rate has dropped for 2 weeks in a row (from ${Math.round(rates[0] * 100)}% to ${Math.round(rates[2] * 100)}%).`, candidate.id, 'View progress', { tab: 'Progress', candidateId: candidate.id }))
      }
    }

    const candidateTasks = state.tasks.filter((task) => task.candidateId === candidate.id)
    const openTasks = candidateTasks.filter((task) => task.status !== 'Reviewed').length
    const averageOpen = state.candidates.length ? state.tasks.filter((task) => task.status !== 'Reviewed').length / state.candidates.length : 0
    if (openTasks > averageOpen + 1) {
      insights.push(insight('workload-imbalance', 'low', `${candidate.name} has ${openTasks} open tasks, well above the average of ${averageOpen.toFixed(1)}.`, candidate.id, 'View candidate', { tab: 'Candidates', candidateId: candidate.id }))
    }

    if (current && progressRate(current) === 1) {
      insights.push(insight('positive-highlight', 'positive', `${candidate.name} completed all tasks this week — nice work.`, candidate.id, 'View progress', { tab: 'Progress', candidateId: candidate.id }))
    }
  })

  const waitingReviews = state.tasks.filter((task) => task.status === 'Submitted' && task.submittedDate && daysBetween(dateOnly(task.submittedDate), dateOnly(now.toISOString().slice(0, 10))) > 3)
  if (waitingReviews.length) {
    insights.push(insight('review-bottleneck', 'medium', `${waitingReviews.length} tasks have been waiting for review for over 3 days.`, 'submitted-reviews', 'Show pending reviews', { tab: 'Tasks', status: 'Submitted' }))
  }

  return insights.sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
}

export function summarizeInsights(state) {
  const week = currentWeek(state)
  const atRisk = state.candidates.filter((candidate) => {
    const current = historyFor(state, candidate.id).find((entry) => Number(entry.week) === week)
    return !current || progressRate(current) < 0.7
  }).length
  const awaitingReview = state.tasks.filter((task) => task.status === 'Submitted').length
  return `You have ${state.candidates.length - atRisk} candidates on track, ${atRisk} at risk, and ${awaitingReview} tasks awaiting review.`
}

export function buildWeeklyDigest(state, insights) {
  const lines = [
    'VIREXO PORTAL COPILOT — WEEKLY DIGEST',
    `Generated: ${new Date().toLocaleString()}`,
    '',
    summarizeInsights(state),
    `Candidates: ${state.candidates.length}`,
    `Tasks: ${state.tasks.length}`,
    `Reviewed tasks: ${state.tasks.filter((task) => task.status === 'Reviewed').length}`,
    `Progress records: ${state.progress.length}`,
    '',
    'INSIGHTS',
    ...insights.map((item) => `[${item.severity.toUpperCase()}] ${item.message}`),
  ]
  return lines.join('\n')
}

// Dismissed-insight persistence, keyed by insight.key + the signature true at dismiss
// time. If the underlying numbers change (task becomes overdue by a different margin,
// completion rate moves, etc.) the signature no longer matches and it resurfaces.
const DISMISS_KEY = 'virexo-copilot-dismissed'

export function readDismissed() {
  try {
    return JSON.parse(window.localStorage.getItem(DISMISS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function isDismissed(item, dismissedMap) {
  return dismissedMap[item.key] === item.signature
}

export function dismissInsight(item) {
  const map = readDismissed()
  map[item.key] = item.signature
  window.localStorage.setItem(DISMISS_KEY, JSON.stringify(map))
}

export function downloadText(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

// Advanced mode: answers a free-text question by computing over live state, not by
// matching against a canned script. Keyword routing only decides WHICH computation to
// run; every number/name in the reply is derived from `state` at call time.
export function answerQuery(question, state, now = new Date()) {
  const q = question.trim().toLowerCase()
  const today = dateOnly(now.toISOString().slice(0, 10))
  const week = currentWeek(state)

  const named = state.candidates.find((candidate) => q.includes(candidate.name.toLowerCase()))
  if (named) {
    const history = historyFor(state, named.id)
    const latest = history.at(-1)
    const rate = progressRate(latest)
    const openTasks = state.tasks.filter((task) => task.candidateId === named.id && task.status !== 'Reviewed').length
    return `${named.name} — status: ${named.status}, week ${latest?.week ?? 'N/A'} completion: ${Math.round(rate * 100)}%, ${openTasks} open task(s), standing: ${rate >= 0.7 ? 'On Track' : 'At Risk'}.`
  }

  if (q.includes('overdue')) {
    const overdue = state.tasks.filter((task) => task.status === 'Pending' && dateOnly(task.dueDate) < today)
    if (!overdue.length) return 'No tasks are currently overdue.'
    return `${overdue.length} overdue task(s): ${overdue
      .map((task) => `${candidateName(state, task.candidateId)} — "${task.title}" (${daysBetween(dateOnly(task.dueDate), today)}d overdue)`)
      .join('; ')}.`
  }

  if (q.includes('risk')) {
    const atRisk = state.candidates.filter((candidate) => {
      const current = historyFor(state, candidate.id).find((entry) => Number(entry.week) === week)
      return !current || progressRate(current) < 0.7
    })
    if (!atRisk.length) return 'No candidates are currently at risk.'
    return `${atRisk.length} candidate(s) at risk: ${atRisk.map((candidate) => candidate.name).join(', ')}.`
  }

  if (q.includes('review')) {
    const awaiting = state.tasks.filter((task) => task.status === 'Submitted')
    if (!awaiting.length) return 'No tasks are awaiting review.'
    return `${awaiting.length} task(s) awaiting review: ${awaiting.map((task) => `"${task.title}" (${candidateName(state, task.candidateId)})`).join('; ')}.`
  }

  if (q.includes('average') || q.includes('completion') || q.includes('progress')) {
    const rates = state.candidates.map((candidate) => progressRate(historyFor(state, candidate.id).at(-1)))
    const average = rates.length ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0
    return `Cohort average completion this week (week ${week}) is ${Math.round(average * 100)}%.`
  }

  if (q.includes('workload') || q.includes('busiest') || q.includes('most tasks')) {
    const counts = state.candidates.map((candidate) => ({
      candidate,
      count: state.tasks.filter((task) => task.candidateId === candidate.id && task.status !== 'Reviewed').length,
    }))
    const busiest = counts.sort((a, b) => b.count - a.count)[0]
    if (!busiest || !busiest.count) return 'No open tasks are currently assigned.'
    return `${busiest.candidate.name} currently carries the most open tasks (${busiest.count}).`
  }

  if (q.includes('best') || q.includes('top') || q.includes('highlight')) {
    const rising = state.candidates
      .map((candidate) => ({ candidate, rate: progressRate(historyFor(state, candidate.id).at(-1)) }))
      .filter((entry) => entry.rate === 1)
      .map((entry) => entry.candidate.name)
    if (!rising.length) return 'No candidate has hit 100% completion this week yet.'
    return `Completed all tasks this week: ${rising.join(', ')}.`
  }

  const insights = generateInsights(state, now)
  if (!insights.length) return 'Everything looks healthy right now — no active insights.'
  return `Top thing to look at: ${insights[0].message}`
}
