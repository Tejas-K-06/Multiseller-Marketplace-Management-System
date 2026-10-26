import { useEffect, useRef } from 'react'

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', onConfirm, onClose }) {
  const dialogRef = useRef(null)
  const lastFocusRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      lastFocusRef.current = document.activeElement
      dialog.showModal()
      const firstButton = dialog.querySelector('button')
      firstButton?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }

    if (!open && lastFocusRef.current) {
      lastFocusRef.current.focus()
      lastFocusRef.current = null
    }
  }, [open])

  function handleCancel(event) {
    event.preventDefault()
    onClose()
  }

  return (
    <dialog className="confirm-dialog" ref={dialogRef} onCancel={handleCancel}>
      <h2 className="heading">{title}</h2>
      {description ? <p className="body">{description}</p> : null}
      <div className="inline-actions">
        <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
          Keep
        </button>
        <button className="btn btn-secondary btn-sm" type="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}
