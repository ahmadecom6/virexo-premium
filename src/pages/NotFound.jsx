import { Link } from 'react-router-dom'
export default function NotFound() { return <section className="not-found"><span className="eyebrow">404 / Signal lost</span><h1>This page went <em>off-grid.</em></h1><p>The route you requested does not exist, but there is still a useful way forward.</p><Link className="button-primary" to="/">Return home</Link></section> }
