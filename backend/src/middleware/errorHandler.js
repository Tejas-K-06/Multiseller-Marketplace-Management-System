export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON body' });
  }

  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body is too large' });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Already exists' });
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return res.status(status).json({ success: false, message });
}
