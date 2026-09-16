import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiArrowUpRight, FiClock, FiMail, FiMapPin } from 'react-icons/fi'
import { services } from '../data'
import { useToast } from '../components/useToast'
import { leadStore } from '../utils/leadStore'

const initialFields = { name: '', email: '', phone: '', company: '', service: '', budget: '', timeline: '', contactMethod: '', description: '', consent: false }

function Field({ label, name, value, error, onChange, type = 'text', textarea = false }) {
  const id = `contact-${name}`
  return <div className="field-group"><label htmlFor={id}>{label}</label>{textarea ? <textarea id={id} name={name} rows="5" value={value} onChange={onChange} aria-invalid={Boolean(error)} /> : <input id={id} name={name} type={type} value={value} onChange={onChange} aria-invalid={Boolean(error)} />}{error && <small className="field-error">{error}</small>}</div>
}

function SelectField({ label, name, value, error, onChange, options }) {
  const id = `contact-${name}`
  return <div className="field-group"><label htmlFor={id}>{label}</label><select id={id} name={name} value={value} onChange={onChange} aria-invalid={Boolean(error)}><option value="">Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error && <small className="field-error">{error}</small>}</div>
}

export default function Contact() {
  const [params] = useSearchParams()
  const [values, setValues] = useState({ ...initialFields, service: services.find((service) => service.id === params.get('service'))?.title || '' })
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const notify = useToast()
  const update = (event) => { const { name, value, type, checked } = event.target; setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value })); setErrors((current) => ({ ...current, [name]: '' })) }
  const validate = () => {
    const next = {}
    if (!values.name.trim()) next.name = 'Full name is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = 'Enter a valid email address.'
    if (!/^[+\d][\d\s().-]{7,}$/.test(values.phone)) next.phone = 'Enter a valid phone number.'
    if (!values.company.trim()) next.company = 'Company name is required.'
    if (!values.service) next.service = 'Choose a service.'
    if (!values.budget) next.budget = 'Choose a budget range.'
    if (!values.timeline) next.timeline = 'Choose a timeline.'
    if (!values.contactMethod) next.contactMethod = 'Choose a contact method.'
    if (!values.description.trim()) next.description = 'Project description is required.'
    if (!values.consent) next.consent = 'Please confirm consent.'
    return next
  }
  const submit = (event) => { event.preventDefault(); const next = validate(); setErrors(next); if (Object.keys(next).length) return; leadStore.add('Enquiry', values); setSent(true); notify('Enquiry sent and added to the Portal.') }
  return <section className="contact-page"><div className="contact-page-intro"><span className="eyebrow">Contact / 07</span><h1>Let's make the <em>next step</em> useful.</h1><p>Tell us where you are, what is getting in the way, and what a better outcome would look like.</p><div className="contact-facts"><span><FiMail /> virexoinnovations@gmail.com</span><span><FiClock /> Mon-Fri, 9am-6pm</span><span><FiMapPin /> Islamabad / Remote</span></div></div><div className="contact-form-shell vx-ring-surface">{sent ? <div className="form-success"><span className="success-icon">✓</span><h2>Enquiry received.</h2><p>Thanks for sharing the context. We will review it and reply within one business day.</p><button className="button-ghost" type="button" onClick={() => { setSent(false); setValues(initialFields) }}>Send another enquiry</button></div> : <form className="enquiry-page-form" onSubmit={submit} noValidate><div className="form-row"><Field label="Full name" name="name" value={values.name} error={errors.name} onChange={update} /><Field label="Email address" name="email" type="email" value={values.email} error={errors.email} onChange={update} /></div><div className="form-row"><Field label="Phone number" name="phone" value={values.phone} error={errors.phone} onChange={update} /><Field label="Company name" name="company" value={values.company} error={errors.company} onChange={update} /></div><div className="form-row"><SelectField label="Required service" name="service" value={values.service} error={errors.service} onChange={update} options={services.map((service) => service.title)} /><SelectField label="Estimated budget" name="budget" value={values.budget} error={errors.budget} onChange={update} options={['Under $5k', '$5k - $15k', '$15k - $30k', '$30k+']} /></div><div className="form-row"><SelectField label="Project timeline" name="timeline" value={values.timeline} error={errors.timeline} onChange={update} options={['Exploring', 'Within 1 month', '1-3 months', '3+ months']} /><SelectField label="Preferred contact method" name="contactMethod" value={values.contactMethod} error={errors.contactMethod} onChange={update} options={['Email', 'Phone call', 'WhatsApp', 'Video call']} /></div><Field label="Project description" name="description" value={values.description} error={errors.description} onChange={update} textarea /><label className="consent-field"><input name="consent" type="checkbox" checked={values.consent} onChange={update} /> <span>I agree that Virexo may use these details to respond to my enquiry.</span></label>{errors.consent && <small className="field-error">{errors.consent}</small>}<button className="button-primary" type="submit">Send enquiry <FiArrowUpRight /></button></form>}</div><div className="map-placeholder" aria-label="Map placeholder"><span>MAP / ISLAMABAD</span><i /></div></section>
}
