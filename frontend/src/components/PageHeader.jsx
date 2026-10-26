export default function PageHeader({
  overline,
  title,
  description,
  action,
  titleClassName = 'title-lg',
  titleId,
  children,
  className = ''
}) {
  return (
    <header className={`page-header${className ? ` ${className}` : ''}`}>
      <div>
        {overline ? <p className="overline">{overline}</p> : null}
        <h1 className={titleClassName} id={titleId}>
          {title}
        </h1>
        {description ? (
          <p className="body page-header-description">{description}</p>
        ) : null}
        {children}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </header>
  )
}
