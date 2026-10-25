export default function OrdersPage() {
  return <Placeholder title="Orders" />
}

function Placeholder({ title }) {
  return <main className="page" id="main-content"><section className="placeholder"><h1>{title}</h1><p>{title} coming soon</p></section></main>
}
