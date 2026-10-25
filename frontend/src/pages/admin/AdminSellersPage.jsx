import { useEffect, useState } from 'react'
import Message from '../../components/Message'
import Skeleton from '../../components/Skeleton'
import StatusBadge from '../../components/StatusBadge'
import { getSellers, setSellerApproval } from '../../api/adminApi'

export default function AdminSellersPage() {
  const [status, setStatus] = useState('')
  const [sellers, setSellers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { setLoading(true); getSellers(status).then(setSellers).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)) }, [status])
  async function update(sellerId, approvalStatus) { try { await setSellerApproval(sellerId, approvalStatus); setSellers(await getSellers(status)) } catch (requestError) { setError(requestError.message) } }
  if (loading) return <main className="page" id="main-content"><Skeleton count={2} /></main>
  return <main className="page" id="main-content"><div className="page-header"><div><p className="overline">Admin area</p><h1 className="title-lg">Seller approval</h1></div></div>{error ? <Message>{error}</Message> : null}<div className="admin-toolbar"><label className="field"><span className="field-label">Filter by status</span><select className="input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All sellers</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select></label></div><div className="table-wrap"><table><thead><tr><th>Store</th><th>Email</th><th>Tax ID</th><th>Status</th><th>Action</th></tr></thead><tbody>{sellers.map((seller) => <tr key={seller.userId}><td data-label="Store">{seller.storeName}</td><td data-label="Email">{seller.email}</td><td data-label="Tax ID" className="mono">{seller.taxId}</td><td data-label="Status"><StatusBadge status={seller.approvalStatus} /></td><td data-label="Action"><div className="form-actions"><button className="btn btn-primary" type="button" onClick={() => update(seller.userId, 'APPROVED')}>Approve</button><button className="btn btn-secondary" type="button" onClick={() => update(seller.userId, 'REJECTED')}>Reject</button></div></td></tr>)}</tbody></table></div></main>
}
