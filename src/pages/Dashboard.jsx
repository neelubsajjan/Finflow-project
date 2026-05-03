import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/db'
import { StatCard, Empty } from '../components/UI'
import TxForm from '../components/TxForm'
import { formatCurrency, formatDate, CATEGORY_ICONS, CHART_COLORS } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [recent,  setRecent]  = useState([])
  const [summary, setSummary] = useState(null)
  const [form,    setForm]    = useState(false)
  const [saving,  setSaving]  = useState(false)

  const load = useCallback(() => {
    setSummary(db.getSummary(user.id))
    setRecent(db.getTransactions(user.id).slice(0, 7))
  }, [user.id])

  useEffect(() => { load() }, [load])

  const handleSave = data => {
    setSaving(true)
    setTimeout(() => {
      try { db.addTransaction(user.id, data); toast.success('Transaction added!'); setForm(false); load() }
      catch (e) { toast.error(e.message) }
      setSaving(false)
    }, 250)
  }

  const now = new Date()
  const greet = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening'
  const bal   = summary?.balance ?? 0

  return (
    <div>
      {/* Header */}
      <div className="row between mb6 fadeUp">
        <div>
          <h1 style={{ fontSize:23,fontWeight:700,fontFamily:'var(--disp)' }}>{greet}, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="muted sm" style={{ marginTop:3 }}>{now.toLocaleDateString('en-IN',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
        </div>
        <button className="btn btnP" onClick={() => setForm(true)} style={{ padding:'11px 20px' }}>+ Add Transaction</button>
      </div>

      {/* Balance hero */}
      <div className="fadeUp d1" style={{ background:'linear-gradient(135deg,#1a2244,#231944)',border:'1px solid rgba(91,141,239,.22)',borderRadius:24,padding:'28px 30px',marginBottom:16,position:'relative',overflow:'hidden' }}>
        <div style={{ position:'absolute',top:-70,right:-70,width:220,height:220,borderRadius:'50%',background:'rgba(91,141,239,.07)' }} />
        <div style={{ position:'absolute',bottom:-80,left:'28%',width:240,height:240,borderRadius:'50%',background:'rgba(167,139,250,.05)' }} />
        <p style={{ fontSize:11,color:'rgba(255,255,255,.4)',letterSpacing:2,marginBottom:9,textTransform:'uppercase' }}>Total Balance</p>
        <div style={{ fontSize:40,fontWeight:700,fontFamily:'var(--disp)',color:'#fff',marginBottom:5 }}>
          {bal < 0 ? '−' : ''}{formatCurrency(Math.abs(bal), user?.currency)}
        </div>
        <p style={{ fontSize:13,color:'rgba(255,255,255,.3)',marginBottom:20 }}>{(summary?.incomeCount||0)+(summary?.expenseCount||0)} total transactions</p>
        <div className="row gap4">
          <div>
            <p style={{ fontSize:11,color:'rgba(34,212,126,.6)',marginBottom:3,letterSpacing:1 }}>INCOME</p>
            <p style={{ fontSize:15,fontWeight:600,color:'var(--green)' }}>{formatCurrency(summary?.income||0,user?.currency)}</p>
          </div>
          <div>
            <p style={{ fontSize:11,color:'rgba(255,107,122,.6)',marginBottom:3,letterSpacing:1 }}>EXPENSES</p>
            <p style={{ fontSize:15,fontWeight:600,color:'var(--red)' }}>{formatCurrency(summary?.expense||0,user?.currency)}</p>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      {summary && (
        <div className="g3 mb5 fadeUp d2">
          <StatCard label="Total Income"   value={formatCurrency(summary.income,  user?.currency)} icon="⬇" color="var(--green)" />
          <StatCard label="Total Expenses" value={formatCurrency(summary.expense, user?.currency)} icon="⬆" color="var(--red)" />
          <StatCard label="Transactions"   value={(summary.incomeCount+summary.expenseCount).toLocaleString()} icon="💳" color="var(--pur)" />
        </div>
      )}

      {/* Top categories */}
      {!!summary?.categoryBreakdown?.length && (
        <div className="card mb5 fadeUp d3">
          <h3 style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Top Spending Categories</h3>
          <div className="col gap3">
            {summary.categoryBreakdown.slice(0,5).map((cat,i) => {
              const pct = summary.expense > 0 ? (cat.total/summary.expense)*100 : 0
              const c   = CHART_COLORS[i]
              return (
                <div key={cat._id}>
                  <div className="row between" style={{ marginBottom:5 }}>
                    <span style={{ fontSize:13,display:'flex',alignItems:'center',gap:6 }}>
                      <span>{CATEGORY_ICONS[cat._id]||'📦'}</span>{cat._id}
                    </span>
                    <span style={{ fontSize:13,fontWeight:600,color:c }}>{formatCurrency(cat.total,user?.currency)}</span>
                  </div>
                  <div style={{ height:5,background:'var(--bg4)',borderRadius:99,overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${pct}%`,background:c,borderRadius:99,transition:'width .6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div className="card fadeUp d4">
        <div className="row between mb4">
          <h3 style={{ fontSize:15,fontWeight:600 }}>Recent Transactions</h3>
          <button onClick={() => navigate('/transactions')} style={{ fontSize:13,color:'var(--blue)',background:'none',border:'none',cursor:'pointer' }}>View all →</button>
        </div>
        {!recent.length
          ? <Empty icon="💳" title="No transactions yet" message="Add your first income or expense to get started."
              action={<button className="btn btnP btnSm" onClick={() => setForm(true)}>+ Add Transaction</button>} />
          : recent.map(tx => (
            <div key={tx.id} style={{ display:'flex',alignItems:'center',gap:12,padding:'11px 0',borderBottom:'1px solid var(--bd)' }}>
              <div style={{ width:40,height:40,borderRadius:10,background:tx.type==='income'?'var(--gBg)':'var(--rBg)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0 }}>
                {CATEGORY_ICONS[tx.category]||(tx.type==='income'?'💵':'💸')}
              </div>
              <div style={{ flex:1,minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{tx.category}</div>
                <div style={{ fontSize:12,color:'var(--text2)' }}>{tx.note||formatDate(tx.date)}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14,fontWeight:700,color:tx.type==='income'?'var(--green)':'var(--red)' }}>
                  {tx.type==='income'?'+':'−'}{formatCurrency(tx.amount,user?.currency)}
                </div>
                <div style={{ fontSize:11,color:'var(--text2)' }}>{formatDate(tx.date)}</div>
              </div>
            </div>
          ))
        }
      </div>

      {form && <TxForm onSave={handleSave} onClose={() => setForm(false)} loading={saving} />}
    </div>
  )
}
