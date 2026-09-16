export default function PageHeader({ eyebrow, title, description }) {
  return (
    <section className="page-hero">
      <span className="eyebrow">{eyebrow}</span>
      <h1 dangerouslySetInnerHTML={{ __html: title }} />
      {description && <p>{description}</p>}
    </section>
  )
}
