import { useState } from 'react'

const questions = [
  { label: 'What do you need?', options: [['New Website', 'Scalable Digital Product Engineering'], ['App Development', 'Scalable Digital Product Engineering'], ['Digital Strategy', 'AI-Powered Workflow & Process Automation']] },
  { label: 'What is your timeline?', options: [['ASAP', ''], ['1-3 Months', ''], ['Flexible', '']] },
  { label: 'What is your budget range?', options: [['Starter', ''], ['Growth', ''], ['Enterprise', '']] },
]

function downloadPdf(summary) {
  const loadPdf = () => new Promise((resolve, reject) => {
    if (window.jspdf) return resolve(window.jspdf)
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    script.onload = () => resolve(window.jspdf)
    script.onerror = reject
    document.head.appendChild(script)
  })
  return loadPdf().then(({ jsPDF }) => {
    const documentPdf = new jsPDF()
    documentPdf.setTextColor(13, 27, 42)
    documentPdf.setFontSize(22)
    documentPdf.text('Virexo Innovations', 20, 25)
    documentPdf.setFontSize(12)
    documentPdf.text('Project estimate summary', 20, 36)
    documentPdf.text(summary, 20, 55, { maxWidth: 170 })
    documentPdf.save('virexo-project-summary.pdf')
  })
}

export default function EstimateTool() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const selectedService = questions[0].options.find(([label]) => label === answers[0])?.[1] || 'Scalable Digital Product Engineering'
  const choose = (answer) => { const next = [...answers]; next[step] = answer; setAnswers(next); setStep(step + 1) }
  const reset = () => { setAnswers([]); setStep(0) }
  const timeframe = answers[1] === 'ASAP' ? 'A focused first milestone in 2-4 weeks' : answers[1] === '1-3 Months' ? 'A structured launch plan in 1-3 months' : 'A flexible roadmap shaped around your priorities'

  return <aside className="estimate-tool vx-ring-surface" aria-label="Quick project estimate">
    <div className="estimate-tool-head"><div><span className="eyebrow">Quick estimate</span><h3>Shape the next step</h3></div><span className="estimate-progress" aria-live="polite">{step < 3 ? `Step ${step + 1} of 3` : 'Your starting point'}</span></div>
    {step < 3 ? <><div className="estimate-question">{questions[step].label}</div><div className="estimate-options">{questions[step].options.map(([label]) => <button key={label} type="button" onClick={() => choose(label)}>{label}</button>)}</div></> : <div className="estimate-result" data-estimate-result><span className="eyebrow">Recommended direction</span><strong>{selectedService}</strong><p>{timeframe}. We can shape the scope around a {answers[2].toLowerCase()} investment level.</p><div className="estimate-result-actions"><a className="button-primary" href="/contact">Start an enquiry <span>→</span></a><button className="button-ghost" type="button" onClick={() => downloadPdf(`Recommended service: ${selectedService}\nTimeline: ${answers[1]}\nBudget: ${answers[2]}\n\nContact Virexo Innovations to discuss your project.`)}>Download summary as PDF</button><button className="button-ghost" type="button" onClick={reset}>Start over</button></div></div>}
  </aside>
}
