import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to:'/',             icon:'📊', label:'Dashboard'    },
  { to:'/transactions', icon:'💳', label:'Transactions' },
  { to:'/analytics',   icon:'📈', label:'Analytics'    },
  { to:'/profile',     icon:'👤', label:'Profile'      },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="row gap2" style={{ paddingLeft:8,marginBottom:28 }}>
        <div style={{ width:34,height:34,background:'linear-gradient(135deg,var(--blue),var(--pur))',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>💰</div>
        <span style={{ fontSize:19,fontWeight:700,fontFamily:'var(--disp)',background:'linear-gradient(135deg,var(--blue),var(--pur))',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent' }}>FinFlow</span>
      </div>

      {/* Nav links */}
      <nav style={{ flex:1,display:'flex',flexDirection:'column',gap:3 }}>
        {NAV.map(n => (
          <NavLink key={n.to} to={n.to} end={n.to==='/'}
            style={({ isActive }) => ({
              display:'flex',alignItems:'center',gap:9,padding:'10px 11px',
              borderRadius:10,textDecoration:'none',transition:'all .14s',
              background: isActive ? 'var(--bBg)' : 'transparent',
              color:      isActive ? 'var(--blue)' : 'var(--text2)',
              fontSize:14,fontWeight: isActive ? 600 : 400,
              border: isActive ? '1px solid var(--bBd)' : '1px solid transparent',
            })}>
            <span style={{ fontSize:15 }}>{n.icon}</span>{n.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ borderTop:'1px solid var(--bd)',paddingTop:14 }}>
        <div className="row gap2" style={{ padding:'7px 8px 12px' }}>
          <div style={{ width:33,height:33,borderRadius:'50%',background:'linear-gradient(135deg,var(--blue),var(--pur))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#fff',flexShrink:0 }}>
            {user?.avatar || '?'}
          </div>
          <div style={{ overflow:'hidden',flex:1 }}>
            <div style={{ fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize:11,color:'var(--text2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btnR btnSm" style={{ width:'100%' }}>Sign Out</button>
      </div>
    </aside>
  )
}
