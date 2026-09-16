import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { FiActivity, FiAlertTriangle, FiDownload, FiRefreshCw, FiSend, FiX } from 'react-icons/fi'
import { internshipStore } from '../utils/internshipStore'
import {
  answerQuery,
  buildWeeklyDigest,
  dismissInsight,
  downloadText,
  generateInsights,
  isDismissed,
  readDismissed,
  summarizeInsights,
} from '../utils/portalCopilot'
import { soundEngine } from '../utils/audio'

const GROUP_LABEL = { high: 'High priority', medium: 'Needs attention', low: 'Workload notes', positive: 'Highlights' }

export default function PortalCopilotWidget({ notify, onNavigate, onFocusCandidate }) {
  const snapshot = useSyncExternalStore(internshipStore.subscribe, internshipStore.getSnapshot, internshipStore.getSnapshot)
  const [open, setOpen] = useState(false)
  const [dismissedVersion, setDismissedVersion] = useState(0)
  const [question, setQuestion] = useState('')
  const [conversation, setConversation] = useState(() => {
    try { return JSON.parse(window.sessionStorage.getItem('virexo-portal-copilot-chat') || '[]') }
    catch { return [] }
  })
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(() => new Date())

  // Live event listener kept as a belt-and-braces refresh signal, in addition to the
  // useSyncExternalStore subscription above (both are driven by the same mutations).
  useEffect(() => {
    const onChanged = () => setDismissedVersion((version) => version + 1)
    window.addEventListener('portal:data-changed', onChanged)
    return () => window.removeEventListener('portal:data-changed', onChanged)
  }, [])

  useEffect(() => {
    window.sessionStorage.setItem('virexo-portal-copilot-chat', JSON.stringify(conversation))
  }, [conversation])

  const refreshAnalysis = () => {
    soundEngine.playClick()
    setRefreshing(true)
    // Read the persisted store again and emit a fresh snapshot to every portal panel.
    internshipStore.refresh()
    setDismissedVersion((version) => version + 1)
    window.setTimeout(() => {
      setLastRefreshed(new Date())
      setRefreshing(false)
      notify?.('Analysis refreshed from the latest portal data.')
    }, 450)
  }

  const insights = useMemo(() => {
    const dismissed = readDismissed()
    return generateInsights(snapshot).filter((item) => !isDismissed(item, dismissed))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snapshot, dismissedVersion])

  const highCount = insights.filter((item) => item.severity === 'high').length
  const summaryLine = useMemo(() => summarizeInsights(snapshot), [snapshot])

  const grouped = { high: [], medium: [], low: [], positive: [] }
  insights.forEach((item) => grouped[item.severity].push(item))

  const runAction = (item) => {
    soundEngine.playClick()
    const { action } = item
    if (action?.candidateId) {
      onNavigate?.('Progress')
      onFocusCandidate?.(action.candidateId)
    } else if (action?.taskId) {
      internshipStore.addActivity(`Reminder sent for task "${item.message}".`, 'reminder')
      onNavigate?.('Tasks')
      notify?.('Reminder logged and Tasks view opened.')
    } else if (action?.status) {
      internshipStore.addActivity(`Flagged ${item.message.match(/\d+/)?.[0] || 'pending'} submitted task(s) for review follow-up.`, 'reminder')
      onNavigate?.('Tasks')
      notify?.('Pending reviews flagged and Tasks view opened.')
    } else {
      onNavigate?.(action?.tab || 'Overview')
    }
    setOpen(false)
  }

  const dismiss = (item) => {
    dismissInsight(item)
    setDismissedVersion((version) => version + 1)
    notify?.('Insight dismissed.')
  }

  const askCopilot = (event) => {
    event.preventDefault()
    const trimmed = question.trim()
    if (!trimmed) return
    soundEngine.playClick()
    const answer = answerQuery(trimmed, snapshot)
    setConversation((prev) => [...prev, { question: trimmed, answer }].slice(-5))
    setQuestion('')
  }

  const generateDigest = () => {
    soundEngine.playClick()
    downloadText(`virexo-weekly-digest-${new Date().toISOString().slice(0, 10)}.txt`, buildWeeklyDigest(snapshot, insights))
    notify?.('Weekly digest downloaded.')
  }

  return (
    <div className="portal-copilot">
      <button
        type="button"
        className="portal-copilot-trigger"
        aria-label="Open Portal Copilot"
        aria-expanded={open}
        onClick={() => {
          soundEngine.playClick()
          setOpen((prev) => !prev)
        }}
      >
        <FiActivity />
        {highCount > 0 && <span className="portal-copilot-badge">{highCount}</span>}
      </button>

      {open && (
        <div className="portal-copilot-panel" role="dialog" aria-modal="false" aria-label="Portal Copilot">
          <div className="portal-copilot-header">
            <div>
              <strong>Portal Copilot</strong>
              <p>{summaryLine}</p>
            </div>
            <button type="button" className="icon-button" aria-label="Close Portal Copilot" onClick={() => setOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="portal-copilot-actions-row">
            <button
              type="button"
              className="banner-ghost-btn"
              onClick={refreshAnalysis}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? 'is-spinning' : ''} /> {refreshing ? 'Refreshing…' : 'Refresh analysis'}
            </button>
            <button type="button" className="banner-primary-btn" onClick={generateDigest}>
              <FiDownload /> Generate weekly digest
            </button>
          </div>

          <p className="portal-copilot-updated" aria-live="polite">
            {refreshing ? 'Reading the latest candidates, tasks and progress…' : `Updated ${lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          </p>

          <form className="portal-copilot-ask-row" onSubmit={askCopilot}>
            <input
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask Copilot — e.g. who is at risk?"
              aria-label="Ask Portal Copilot a question"
            />
            <button type="submit" className="icon-button" aria-label="Ask">
              <FiSend />
            </button>
          </form>

          {conversation.length > 0 && (
            <div className="portal-copilot-conversation">
              {conversation.map((turn, index) => (
                <div className="portal-copilot-turn" key={`${turn.question}-${index}`}>
                  <p className="portal-copilot-turn-question">You: {turn.question}</p>
                  <p className="portal-copilot-turn-answer">Copilot: {turn.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="portal-copilot-list">
            {insights.length === 0 && <p className="portal-copilot-empty">No active insights. Everything looks healthy.</p>}
            {['high', 'medium', 'low', 'positive'].map(
              (severity) =>
                grouped[severity].length > 0 && (
                  <div className="portal-copilot-group" key={severity}>
                    <span className={`portal-copilot-group-label severity-${severity}`}>{GROUP_LABEL[severity]}</span>
                    {grouped[severity].map((item) => (
                      <div className={`portal-copilot-item severity-${severity}`} key={item.key}>
                        <FiAlertTriangle className="portal-copilot-item-icon" />
                        <div className="portal-copilot-item-body">
                          <p>{item.message}</p>
                          <div className="portal-copilot-item-actions">
                            <button type="button" className="portal-copilot-action-btn" onClick={() => runAction(item)}>
                              {item.actionLabel}
                            </button>
                            <button type="button" className="portal-copilot-dismiss-btn" onClick={() => dismiss(item)}>
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
