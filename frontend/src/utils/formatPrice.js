const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
})

export default function formatPrice(value) {
  return formatter.format(value)
}
