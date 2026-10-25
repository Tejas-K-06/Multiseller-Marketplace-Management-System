export function notFound(req, res, next) {
  res.status(404).json({ success: false, message: 'Route not found' });
}

export function errorHandler(err, req, res, next) {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ success: false, message: 'Already exists' });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;
  return res.status(status).json({ success: false, message });
}
