import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/db'
import { Empty, Alert } from '../components/UI'
import TxForm from '../components/TxForm'
import { formatCurrency, formatDate, exportToCSV, EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_ICONS } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Transactions() {
  const { user } = useAuth()
  const [txs,     setTxs]     = useState([])
  const [filters, setFilters] = useState({ type:'all', category:'all', search:'', month:'' })
  const [form,    setForm]    = useState(false)
  const [editTx,  setEditTx]  = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [delId,   setDelId]   = useState(null)
  const [csvMsg,  setCsvMsg]  = useState(false)

  const load = useCallback(() => {
    setTxs(db.getTransactions(user.id, filters))
  }, [user.id, filters])

  useEffect(() => { load() }, [load])

  const sf = (k, v) => setFilters(p => ({ ...p, [k]: v, ...(k==='type'?{category:'all'}:{}) }))

  const handleSave = data => {
    setSaving(true)
    setTimeout(() => {
      try {
        if (editTx) { db.updateTransaction(user.id, editTx.id, data); toast.success('Updated!') }
        else        { db.addTransaction(user.id, data);               toast.success('Added!') }
        setForm(false); setEditTx(null); load()
      } catch(e) { toast.error(e.message) }
      setSaving(false)
    }, 250)
  }

  const handleDelete = id => {
    if (!window.confirm('Delete this transaction?')) return
    setDelId(id)
    setTimeout(() => {
      try { db.deleteTransaction(user.id, id); toast.success('Deleted'); load() }
      catch(e) { toast.error(e.message) }
      setDelId(null)
    }, 200)
  }

  const handleExport = () => { exportToCSV(txs); setCsvMsg(true); setTimeout(()=>setCsvMsg(false),2500) }

  const cats = filters.type==='income' ? INCOME_CATEGORIES : filters.type==='expense' ? EXPENSE_CATEGORIES : [...INCOME_CATEGORIES,...EXPENSE_CATEGORIES]
  const totalInc = txs.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0)
  const totalExp = txs.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0)

  // last 12 months for the month filter
  const months = Array.from({length:12},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-i)
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
  })

  return (
    <div>
      {/* Header */}
      <div className="row between mb5 fadeUp">
        <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'var(--disp)' }}>Transactions</h1>
        <div className="row gap2">
          <button className="btn btnA btnSm" onClick={handleExport}>📥 Export CSV</button>
          <button className="btn btnP" onClick={() => { setEditTx(null); setForm(true) }}>+ Add</button>
        </div>
      </div>

      {csvMsg && <div style={{ marginBottom:12 }}><Alert type="success">✓ CSV exported successfully!</Alert></div>}

      {/* Filters */}
      <div className="card mb4 fadeUp d1" style={{ padding:'14px 16px' }}>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr 1fr',gap:10 }}>
          <input className="inp" placeholder="🔍 Search…" value={filters.search}
            onChange={e => sf('search', e.target.value)} style={{ fontSize:13 }} />
          <select className="inp" value={filters.type} onChange={e => sf('type', e.target.value)} style={{ fontSize:13 }}>
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
          <select className="inp" value={filters.category} onChange={e => sf('category', e.target.value)} style={{ fontSize:13 }}>
            <option value="all">All Categories</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="inp" value={filters.month} onChange={e => sf('month', e.target.value)} style={{ fontSize:13 }}>
            <option value="">All Months</option>
            {months.map(m => <option key={m} value={m}>{new Date(m+'-01').toLocaleDateString('en-IN',{month:'long',year:'numeric'})}</option>)}
          </select>
        </div>
      </div>

      {/* Summary strip */}
      {!!txs.length && (
        <div className="row gap4 fadeUp d2" style={{ padding:'9px 14px',background:'var(--card)',border:'1px solid var(--bd)',borderRadius:10,marginBottom:12,fontSize:13,flexWrap:'wrap' }}>
          <span className="muted">{txs.length} records</span>
          <span style={{ color:'var(--green)' }}>▲ Income: {formatCurrency(totalInc,user?.currency)}</span>
          <span style={{ color:'var(--red)' }}>▼ Expenses: {formatCurrency(totalExp,user?.currency)}</span>
          <span style={{ fontWeight:600,color:totalInc-totalExp>=0?'var(--green)':'var(--red)' }}>
            Net: {totalInc-totalExp>=0?'+':'−'}{formatCurrency(Math.abs(totalInc-totalExp),user?.currency)}
          </span>
        </div>
      )}

      {/* List */}
      <div className="card fadeUp d3" style={{ padding:0,overflow:'hidden' }}>
        {!txs.length
          ? <Empty icon="🔍" title="No transactions found" message="Try changing filters or add a new transaction."
              action={<button className="btn btnP btnSm" onClick={() => setForm(true)}>+ Add Transaction</button>} />
          : txs.map((tx, i) => (
            <div key={tx.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'13px 16px',borderBottom:i<txs.length-1?'1px solid var(--bd)':'none',transition:'background .14s',cursor:'default' }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--bg3)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>

              <div style={{ width:42,height:42,borderRadius:11,background:tx.type==='income'?'var(--gBg)':'var(--rBg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                {CATEGORY_ICONS[tx.category]||(tx.type==='income'?'💵':'💸')}
              </div>

              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:2 }}>
                  <span style={{ fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tx.category}</span>
                  <span className={`badge ${tx.type==='income'?'bInc':'bExp'}`}>{tx.type}</span>
                </div>
                <div style={{ fontSize:12,color:'var(--text2)' }}>{tx.note && `${tx.note} · `}{formatDate(tx.date)}</div>
              </div>

              <div style={{ fontSize:15,fontWeight:700,color:tx.type==='income'?'var(--green)':'var(--red)',marginRight:8,textAlign:'right' }}>
                {tx.type==='income'?'+':'−'}{formatCurrency(tx.amount,user?.currency)}
              </div>

              <div style={{ display:'flex',gap:4,flexShrink:0 }}>
                <button onClick={() => { setEditTx(tx); setForm(true) }}
                  style={{ width:32,height:32,borderRadius:7,background:'var(--bBg)',color:'var(--blue)',border:'1px solid var(--bBd)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }} title="Edit">✏️</button>
                <button onClick={() => handleDelete(tx.id)} disabled={delId===tx.id}
                  style={{ width:32,height:32,borderRadius:7,background:'var(--rBg)',color:'var(--red)',border:'1px solid var(--rBd)',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',opacity:delId===tx.id?.5:1 }} title="Delete">
                  {delId===tx.id?'⏳':'🗑️'}
                </button>
              </div>
            </div>
          ))
        }
      </div>

      {form && <TxForm tx={editTx} onSave={handleSave} onClose={() => { setForm(false); setEditTx(null) }} loading={saving} />}
    </div>
  )
}
