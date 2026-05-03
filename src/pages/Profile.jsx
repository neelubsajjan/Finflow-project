import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/db'
import { Alert } from '../components/UI'
import { formatCurrency, exportToCSV, CURRENCY_SYMBOLS } from '../utils/helpers'
import toast from 'react-hot-toast'

const TABS = ['profile','security','data']

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const [tab, setTab] = useState('profile')

  const summary = db.getSummary(user.id)

  // Profile form
  const [pName,     setPName]     = useState(user?.name||'')
  const [pCurrency, setPCurrency] = useState(user?.currency||'INR')
  const [pSaving,   setPSaving]   = useState(false)

  // Password form
  const [pwCur,  setPwCur]  = useState('')
  const [pwNew,  setPwNew]  = useState('')
  const [pwConf, setPwConf] = useState('')
  const [pwErr,  setPwErr]  = useState('')
  const [pwOk,   setPwOk]   = useState(false)
  const [pwSave, setPwSave] = useState(false)

  const saveProfile = () => {
    if (!pName.trim()) { toast.error('Name is required'); return }
    setPSaving(true)
    setTimeout(() => {
      try {
        const u = db.updateProfile(user.id, { name:pName.trim(), currency:pCurrency })
        updateUser(u)
        toast.success('Profile updated!')
      } catch(e) { toast.error(e.message) }
      setPSaving(false)
    }, 250)
  }

  const savePassword = () => {
    setPwErr(''); setPwOk(false)
    if (!pwCur || !pwNew || !pwConf) { setPwErr('All fields are required.'); return }
    if (pwNew.length < 6) { setPwErr('New password must be at least 6 characters.'); return }
    if (pwNew !== pwConf) { setPwErr('Passwords do not match.'); return }
    setPwSave(true)
    setTimeout(() => {
      try { db.changePassword(user.id, pwCur, pwNew); setPwOk(true); setPwCur(''); setPwNew(''); setPwConf(''); toast.success('Password changed!') }
      catch(e) { setPwErr(e.message) }
      setPwSave(false)
    }, 250)
  }

  const doExport = () => {
    const txs = db.getTransactions(user.id)
    if (!txs.length) { toast.error('No transactions to export.'); return }
    exportToCSV(txs)
    toast.success('CSV downloaded!')
  }

  const lbl = s => (
    <label style={{ fontSize:12,fontWeight:600,color:'var(--text2)',letterSpacing:'.5px',textTransform:'uppercase',display:'block',marginBottom:6 }}>{s}</label>
  )

  return (
    <div style={{ maxWidth:580 }}>
      <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'var(--disp)',marginBottom:22 }} className="fadeUp">Profile</h1>

      {/* Avatar card */}
      <div className="card fadeUp d1" style={{ display:'flex',alignItems:'center',gap:18,marginBottom:18 }}>
        <div style={{ width:68,height:68,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--pur))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:700,color:'#fff',flexShrink:0 }}>
          {user?.avatar||'?'}
        </div>
        <div>
          <h2 style={{ fontSize:19,fontWeight:700,marginBottom:3 }}>{user?.name}</h2>
          <p style={{ color:'var(--text2)',fontSize:14 }}>{user?.email}</p>
          <p style={{ color:'var(--text3)',fontSize:12,marginTop:3 }}>Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN',{month:'long',year:'numeric'}) : '—'}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="g4 mb5 fadeUp d2">
        {[
          { l:'Transactions', v:(summary.incomeCount+summary.expenseCount).toString(),           c:'var(--blue)' },
          { l:'Net Balance',  v:formatCurrency(Math.abs(summary.balance),user?.currency),        c:summary.balance>=0?'var(--green)':'var(--red)' },
          { l:'Income',       v:formatCurrency(summary.income,user?.currency),                   c:'var(--green)' },
          { l:'Expenses',     v:formatCurrency(summary.expense,user?.currency),                  c:'var(--red)' },
        ].map(s => (
          <div key={s.l} style={{ background:'var(--bg3)',border:'1px solid var(--bd)',borderRadius:12,padding:'13px 14px' }}>
            <p style={{ fontSize:11,color:'var(--text2)',marginBottom:5 }}>{s.l}</p>
            <p style={{ fontSize:15,fontWeight:600,color:s.c }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex',gap:3,background:'var(--bg3)',borderRadius:10,padding:4,marginBottom:18 }} className="fadeUp d3">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex:1,padding:'8px',borderRadius:7,border:'none',cursor:'pointer',
            background:tab===t?'var(--blue)':'transparent',
            color:tab===t?'#fff':'var(--text2)',
            fontSize:13,fontWeight:tab===t?600:400,textTransform:'capitalize',
          }}>
            {t==='profile'?'👤 Profile':t==='security'?'🔐 Security':'📦 Data'}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab==='profile' && (
        <div className="card fadeIn col" style={{ gap:18 }}>
          <div>{lbl('Full Name')}<input className="inp" value={pName} onChange={e=>setPName(e.target.value)} /></div>
          <div>{lbl('Email')}<input className="inp" value={user?.email} disabled /></div>
          <div>
            {lbl('Currency')}
            <select className="inp" value={pCurrency} onChange={e=>setPCurrency(e.target.value)}>
              {Object.entries(CURRENCY_SYMBOLS).map(([code,sym]) => <option key={code} value={code}>{sym} {code}</option>)}
            </select>
          </div>
          <button className="btn btnP" onClick={saveProfile} disabled={pSaving} style={{ alignSelf:'flex-start',padding:'10px 24px' }}>
            {pSaving?'Saving…':'Save Changes'}
          </button>
        </div>
      )}

      {/* Security tab */}
      {tab==='security' && (
        <div className="card fadeIn col" style={{ gap:18 }}>
          <Alert type="info">🔐 Passwords are hashed and never stored in plain text.</Alert>
          <div>{lbl('Current Password')}<input type="password" className="inp" placeholder="••••••••" value={pwCur} onChange={e=>{setPwCur(e.target.value);setPwErr('');setPwOk(false)}} /></div>
          <div>{lbl('New Password')}<input type="password" className="inp" placeholder="Min 6 characters" value={pwNew} onChange={e=>{setPwNew(e.target.value);setPwErr('');setPwOk(false)}} /></div>
          <div>{lbl('Confirm New Password')}<input type="password" className="inp" placeholder="Repeat new password" value={pwConf} onChange={e=>{setPwConf(e.target.value);setPwErr('');setPwOk(false)}} /></div>
          {pwErr && <Alert type="danger">⚠ {pwErr}</Alert>}
          {pwOk  && <Alert type="success">✓ Password updated successfully!</Alert>}
          <button className="btn btnP" onClick={savePassword} disabled={pwSave} style={{ alignSelf:'flex-start',padding:'10px 24px' }}>
            {pwSave?'Updating…':'Update Password'}
          </button>
        </div>
      )}

      {/* Data tab */}
      {tab==='data' && (
        <div className="card fadeIn col" style={{ gap:18 }}>
          <div>
            <h3 style={{ fontSize:15,fontWeight:600,marginBottom:6 }}>Export Your Data</h3>
            <p className="muted sm" style={{ marginBottom:12 }}>Download all transactions as a CSV file for Excel or Google Sheets.</p>
            <button className="btn btnA" onClick={doExport}>📥 Download CSV</button>
          </div>
          <div style={{ height:1,background:'var(--bd)' }} />
          <div>
            <h3 style={{ fontSize:15,fontWeight:600,color:'var(--red)',marginBottom:6 }}>Sign Out</h3>
            <p className="muted sm" style={{ marginBottom:12 }}>Your data stays safe in your browser storage.</p>
            <button className="btn btnR" onClick={logout}>Sign Out</button>
          </div>
        </div>
      )}
    </div>
  )
}
