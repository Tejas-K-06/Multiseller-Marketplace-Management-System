export default function SectionCard({
  title,
  description,
  action,
  children,
  className = '',
  id
}) {
  return (
    <section className={`card section-card${className ? ` ${className}` : ''}`} id={id}>
      {title || description || action ? (
        <header className="section-card-header">
          <div>
            {title ? <h2 className="heading">{title}</h2> : null}
            {description ? <p className="caption">{description}</p> : null}
          </div>
          {action ? <div className="section-card-action">{action}</div> : null}
        </header>
      ) : null}
      {children}
    </section>
  )
}
