export default function OrderDetailPage() {
  return <Placeholder title="Order detail" />
}

function Placeholder({ title }) {
  return <main className="page" id="main-content"><section className="placeholder"><h1>{title}</h1><p>{title} coming soon</p></section></main>
}
