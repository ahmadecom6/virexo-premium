import { Link } from 'react-router-dom'

export default function PrivacyPolicy() {
  return (
    <>
      <section className="page-hero">
        <span className="eyebrow">Legal / Privacy</span>
        <h1>Privacy Policy</h1>
        <p>We are committed to respecting the privacy of every person who interacts with Virexo Innovations.</p>
      </section>

      <section className="page-section privacy-policy-page">
        <div className="privacy-copy">
          <article>
            <h2>Information we collect</h2>
            <p>We may collect personal information such as your name, email address, phone number, company details, and project enquiries when you contact us or submit a form.</p>
          </article>

          <article>
            <h2>How we use it</h2>
            <p>We use that information to respond to enquiries, discuss project requirements, manage communication, and improve the experience of our service and website.</p>
          </article>

          <article>
            <h2>Cookies and preferences</h2>
            <p>We may use cookies or local storage to remember theme choices, consent preferences, and website behaviour that improves usability. We do not sell personal information.</p>
          </article>

          <article>
            <h2>Data retention</h2>
            <p>We retain contact and enquiry information only for as long as needed to manage the relationship, complete requested services, or meet legal or business obligations.</p>
          </article>

          <article>
            <h2>Your rights</h2>
            <p>You may contact us at any time to request access to, correction of, or deletion of personal information you have shared with us, subject to applicable legal requirements.</p>
          </article>

          <article>
            <h2>Contact</h2>
            <p>If you have any privacy questions, please reach out to Virexo Innovations at virexoinnovations@gmail.com.</p>
          </article>
        </div>

        <div className="privacy-side-card">
          <h3>Quick summary</h3>
          <ul>
            <li>We only collect information needed for communication and project work.</li>
            <li>We use local preferences for website usability and consent.</li>
            <li>We do not use invasive advertising tracking.</li>
            <li>We keep communication practical and respectful.</li>
          </ul>
          <Link className="button-primary" to="/contact">Contact us</Link>
        </div>
      </section>
    </>
  )
}
