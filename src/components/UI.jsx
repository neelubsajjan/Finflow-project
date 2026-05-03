import { useEffect } from 'react'

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.76)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9000,padding:'20px',backdropFilter:'blur(5px)' }}>
      <div className="scaleIn" style={{ background:'var(--card)',border:'1.5px solid var(--bd2)',borderRadius:20,width:'100%',maxWidth:470,maxHeight:'92vh',overflowY:'auto' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',padding:'17px 22px',borderBottom:'1px solid var(--bd)' }}>
          <h3 style={{ fontSize:16,fontWeight:600 }}>{title}</h3>
          <button onClick={onClose} style={{ width:28,height:28,borderRadius:'50%',background:'var(--bg3)',color:'var(--text2)',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
        </div>
        <div style={{ padding:22 }}>{children}</div>
      </div>
    </div>
  )
}

export function Field({ label, error, children }) {
  return (
    <div className="col" style={{ gap:6 }}>
      {label && <label style={{ fontSize:12,fontWeight:600,color:'var(--text2)',letterSpacing:'.5px',textTransform:'uppercase' }}>{label}</label>}
      {children}
      {error && <span style={{ fontSize:12,color:'var(--red)' }}>⚠ {error}</span>}
    </div>
  )
}

export function Tabs({ options, value, onChange }) {
  return (
    <div style={{ display:'flex',background:'var(--bg3)',borderRadius:10,padding:4,gap:3 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex:1,padding:'8px 10px',borderRadius:7,border:'none',cursor:'pointer',
          background: value===o.value ? (o.color || 'var(--blue)') : 'transparent',
          color: value===o.value ? '#fff' : 'var(--text2)',
          fontSize:13,fontWeight: value===o.value ? 600 : 400,transition:'all .15s',
        }}>
          {o.icon && <span style={{ marginRight:4 }}>{o.icon}</span>}{o.label}
        </button>
      ))}
    </div>
  )
}

export function StatCard({ label, value, icon, color='var(--blue)', cls='' }) {
  return (
    <div className={`card fadeUp ${cls}`}>
      <div className="row between" style={{ marginBottom:10 }}>
        <span style={{ fontSize:13,color:'var(--text2)',fontWeight:500 }}>{label}</span>
        {icon && <span style={{ fontSize:20 }}>{icon}</span>}
      </div>
      <div style={{ fontSize:21,fontWeight:700,color,fontFamily:'var(--disp)' }}>{value}</div>
    </div>
  )
}

export function Empty({ icon='📊', title, message, action }) {
  return (
    <div style={{ textAlign:'center',padding:'52px 20px',color:'var(--text2)' }}>
      <div style={{ fontSize:44,marginBottom:12 }}>{icon}</div>
      <h3 style={{ fontSize:16,fontWeight:600,color:'var(--text)',marginBottom:6 }}>{title}</h3>
      {message && <p style={{ fontSize:14,marginBottom:18 }}>{message}</p>}
      {action}
    </div>
  )
}

export function Alert({ type='info', children }) {
  const m = {
    info:    { bg:'var(--bBg)', bd:'var(--bBd)', c:'var(--blue)' },
    success: { bg:'var(--gBg)', bd:'var(--gBd)', c:'var(--green)' },
    danger:  { bg:'var(--rBg)', bd:'var(--rBd)', c:'var(--red)' },
    warning: { bg:'var(--aBg)', bd:'var(--aBd)', c:'var(--amb)' },
  }
  const s = m[type] || m.info
  return <div style={{ background:s.bg,border:`1px solid ${s.bd}`,color:s.c,borderRadius:10,padding:'10px 14px',fontSize:13 }}>{children}</div>
}
