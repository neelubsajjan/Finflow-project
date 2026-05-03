import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Tabs, Alert } from '../components/UI'

const TABS = [
  { value:'login',  label:'Sign In' },
  { value:'signup', label:'Sign Up' },
]

export default function AuthPage() {
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode]       = useState('login')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const reset = v => { setMode(v); setError(''); setName(''); setEmail(''); setPass('') }

  const submit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // tiny delay so the button feels responsive
    await new Promise(r => setTimeout(r, 300))

    try {
      if (mode === 'signup') {
        register(name, email, password)      // throws descriptive error on failure
      } else {
        login(email, password)               // throws descriptive error on failure
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', padding:20,
      backgroundImage:'radial-gradient(ellipse at 20% 50%,rgba(91,141,239,.09) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(167,139,250,.08) 0%,transparent 60%)',
    }}>
      <div className="fadeUp" style={{ width:'100%', maxWidth:420 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:30 }}>
          <div style={{ width:62,height:62,background:'linear-gradient(135deg,var(--blue),var(--pur))',borderRadius:20,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:28,marginBottom:14,boxShadow:'0 8px 28px rgba(91,141,239,.35)' }}>
            💰
          </div>
          <h1 style={{ fontSize:30,fontWeight:700,fontFamily:'var(--disp)',background:'linear-gradient(135deg,var(--blue),var(--pur))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:5 }}>
            FinFlow
          </h1>
          <p style={{ color:'var(--text2)',fontSize:14 }}>Smart expense tracking for smart people</p>
        </div>

        {/* Card */}
        <div className="cardLg">
          <Tabs options={TABS} value={mode} onChange={reset} />

          <form onSubmit={submit} noValidate style={{ display:'flex',flexDirection:'column',gap:16,marginTop:22 }}>

            {mode === 'signup' && (
              <div>
                <label style={{ fontSize:12,fontWeight:600,color:'var(--text2)',letterSpacing:'.5px',textTransform:'uppercase',display:'block',marginBottom:6 }}>Full Name</label>
                <input className="inp" placeholder="Neelambika Sajjan"
                  value={name} onChange={e => { setName(e.target.value); setError('') }}
                  autoComplete="name" autoFocus />
              </div>
            )}

            <div>
              <label style={{ fontSize:12,fontWeight:600,color:'var(--text2)',letterSpacing:'.5px',textTransform:'uppercase',display:'block',marginBottom:6 }}>Email Address</label>
              <input type="email" className="inp" placeholder="you@example.com"
                value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                autoComplete="email" autoFocus={mode==='login'} />
            </div>

            <div>
              <label style={{ fontSize:12,fontWeight:600,color:'var(--text2)',letterSpacing:'.5px',textTransform:'uppercase',display:'block',marginBottom:6 }}>Password</label>
              <input type="password" className="inp" placeholder="••••••••"
                value={password} onChange={e => { setPass(e.target.value); setError('') }}
                autoComplete={mode==='login'?'current-password':'new-password'} />
              {mode==='signup' && <p style={{ fontSize:11,color:'var(--text3)',marginTop:4 }}>Minimum 6 characters</p>}
            </div>

            {error && <Alert type="danger">⚠ {error}</Alert>}

            <button type="submit" className="btn btnP" disabled={loading}
              style={{ padding:'13px',fontSize:15,fontWeight:600,marginTop:4 }}>
              {loading
                ? <><span className="spin" style={{ width:16,height:16,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff' }} /> Please wait…</>
                : (mode==='login' ? 'Sign In →' : 'Create Account →')
              }
            </button>
          </form>

          <div style={{ marginTop:16,padding:'11px 13px',background:'var(--bg3)',borderRadius:10,fontSize:12,color:'var(--text2)' }}>
            {mode==='login'
              ? <><strong style={{ color:'var(--text)' }}>New here?</strong> Click "Sign Up" above to create a free account.</>
              : <><strong style={{ color:'var(--text)' }}>✓ No server needed.</strong> Your data is saved securely in your browser.</>
            }
          </div>
        </div>

        <p style={{ textAlign:'center',fontSize:12,color:'var(--text3)',marginTop:20 }}>
          Data stored locally in your browser · No backend required
        </p>
      </div>
    </div>
  )
}
