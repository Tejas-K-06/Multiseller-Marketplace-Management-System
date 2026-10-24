export function isMockMode() {
  return import.meta.env.VITE_USE_MOCK === 'true'
}
