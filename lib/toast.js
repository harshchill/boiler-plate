// Simple DOM-based toast utility (no external deps)
// Usage: import { toast } from '../../lib/toast'
export function _createContainer() {
  if (typeof document === 'undefined') return null
  let container = document.getElementById('app-toast-container')
  if (!container) {
    container = document.createElement('div')
    container.id = 'app-toast-container'
    container.style.position = 'fixed'
    container.style.zIndex = '9999'
    container.style.right = '1rem'
    container.style.top = '1rem'
    container.style.display = 'flex'
    container.style.flexDirection = 'column'
    container.style.gap = '0.5rem'
    document.body.appendChild(container)
  }
  return container
}

function _makeToastElement(message, type) {
  const el = document.createElement('div')
  el.textContent = message
  el.style.minWidth = '220px'
  el.style.maxWidth = '420px'
  el.style.padding = '0.6rem 0.9rem'
  el.style.borderRadius = '0.6rem'
  el.style.boxShadow = '0 6px 18px rgba(0,0,0,0.08)'
  el.style.color = '#0f172a'
  el.style.fontSize = '0.9rem'
  el.style.fontWeight = '600'
  el.style.opacity = '0'
  el.style.transition = 'opacity 240ms ease, transform 240ms ease'
  el.style.transform = 'translateY(-6px)'

  switch (type) {
    case 'success':
      el.style.background = '#ecfccb'
      el.style.border = '1px solid #bef264'
      break
    case 'error':
      el.style.background = '#fee2e2'
      el.style.border = '1px solid #fca5a5'
      break
    default:
      el.style.background = '#e6f2ff'
      el.style.border = '1px solid #93c5fd'
      break
  }

  return el
}

function _show(message, type = 'info', duration = 3500) {
  if (typeof document === 'undefined') return
  const container = _createContainer()
  if (!container) return

  const el = _makeToastElement(message, type)
  container.appendChild(el)

  // trigger in
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })

  // remove after duration
  const hide = () => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(-6px)'
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el)
    }, 260)
  }

  const t = setTimeout(hide, duration)
  // allow click to dismiss early
  el.addEventListener('click', () => {
    clearTimeout(t)
    hide()
  })
}

export const toast = {
  success: (msg, opts) => _show(msg, 'success', opts?.duration || 3500),
  error: (msg, opts) => _show(msg, 'error', opts?.duration || 4500),
  info: (msg, opts) => _show(msg, 'info', opts?.duration || 3000),
}

export default toast
