export default function CartPage() {
  return <Placeholder title="Cart" />
}

function Placeholder({ title }) {
  return <main className="page"><section className="placeholder"><h1>{title}</h1><p>{title} coming soon</p></section></main>
}
