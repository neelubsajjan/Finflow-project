import { useEffect, useState } from 'react'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Filler, Tooltip, Legend } from 'chart.js'
import { useAuth } from '../context/AuthContext'
import { db } from '../utils/db'
import { Empty } from '../components/UI'
import { formatCurrency, CHART_COLORS, CATEGORY_ICONS } from '../utils/helpers'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, LineElement, PointElement, Filler, Tooltip, Legend)

const GRID = { color:'rgba(255,255,255,0.04)' }
const TICK = { color:'#8888aa', font:{ size:11 } }
const fmtY = v => v>=1000 ? '₹'+(v/1000).toFixed(0)+'k' : '₹'+v

export default function Analytics() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)

  useEffect(() => { setSummary(db.getSummary(user.id)) }, [user.id])

  if (!summary || (!summary.income && !summary.expense)) {
    return (
      <div>
        <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'var(--disp)',marginBottom:24 }}>Analytics</h1>
        <Empty icon="📈" title="No data yet" message="Add some transactions to see charts and insights." />
      </div>
    )
  }

  const labels    = summary.monthlyTrend.map(m => m.label)
  const incData   = summary.monthlyTrend.map(m => m.income)
  const expData   = summary.monthlyTrend.map(m => m.expense)
  const netData   = summary.monthlyTrend.map(m => m.income - m.expense)
  const cats      = summary.categoryBreakdown
  const savRate   = summary.income > 0 ? ((summary.income-summary.expense)/summary.income)*100 : 0
  const savColor  = savRate >= 20 ? 'var(--green)' : savRate >= 0 ? 'var(--amb)' : 'var(--red)'

  const baseOpts = { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }

  return (
    <div>
      <h1 style={{ fontSize:22,fontWeight:700,fontFamily:'var(--disp)',marginBottom:22 }} className="fadeUp">Analytics</h1>

      {/* KPI */}
      <div className="g3 mb5 fadeUp d1">
        {[
          { label:'Total Income',   val:formatCurrency(summary.income,  user?.currency), color:'var(--green)', icon:'⬇' },
          { label:'Total Expenses', val:formatCurrency(summary.expense, user?.currency), color:'var(--red)',   icon:'⬆' },
          { label:'Savings Rate',   val:`${savRate.toFixed(1)}%`,                        color:savColor,       icon:'💰' },
        ].map(k => (
          <div key={k.label} className="card" style={{ textAlign:'center',padding:20 }}>
            <div style={{ fontSize:28,marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontSize:11,color:'var(--text2)',letterSpacing:1,marginBottom:6 }}>{k.label.toUpperCase()}</div>
            <div style={{ fontSize:22,fontWeight:700,color:k.color,fontFamily:'var(--disp)' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card mb4 fadeUp d2">
        <div className="row between mb4">
          <div>
            <h3 style={{ fontSize:15,fontWeight:600 }}>Income vs Expenses</h3>
            <p style={{ fontSize:12,color:'var(--text2)',marginTop:2 }}>Last 6 months</p>
          </div>
          <div className="row gap3" style={{ fontSize:12 }}>
            {[['var(--green)','Income'],['var(--red)','Expense']].map(([c,l]) => (
              <span key={l} style={{ display:'flex',alignItems:'center',gap:5,color:'var(--text2)' }}>
                <span style={{ width:10,height:10,borderRadius:2,background:c,display:'inline-block' }} />{l}
              </span>
            ))}
          </div>
        </div>
        <div style={{ height:220 }}>
          <Bar data={{ labels, datasets:[
            { label:'Income',  data:incData, backgroundColor:'rgba(34,212,126,.75)', borderRadius:6, borderSkipped:false },
            { label:'Expense', data:expData, backgroundColor:'rgba(255,107,122,.75)', borderRadius:6, borderSkipped:false },
          ]}} options={{ ...baseOpts, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:fmtY}} }}} />
        </div>
      </div>

      {/* Line chart */}
      <div className="card mb4 fadeUp d3">
        <h3 style={{ fontSize:15,fontWeight:600,marginBottom:4 }}>Net Savings Trend</h3>
        <p style={{ fontSize:12,color:'var(--text2)',marginBottom:14 }}>Monthly balance (income − expenses)</p>
        <div style={{ height:190 }}>
          <Line data={{ labels, datasets:[{
            label:'Net', data:netData,
            borderColor:'var(--blue)', backgroundColor:'rgba(91,141,239,.1)',
            fill:true, tension:.4, pointBackgroundColor:'var(--blue)', pointRadius:5, pointHoverRadius:7,
          }]}} options={{ ...baseOpts, scales:{ x:{grid:GRID,ticks:TICK}, y:{grid:GRID,ticks:{...TICK,callback:fmtY}} }}} />
        </div>
      </div>

      {/* Doughnut + category list */}
      {!!cats.length && (
        <div className="g2 fadeUp d4">
          <div className="card">
            <h3 style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Spending Breakdown</h3>
            <div style={{ height:220 }}>
              <Doughnut data={{ labels:cats.map(c=>c._id), datasets:[{ data:cats.map(c=>c.total), backgroundColor:CHART_COLORS.slice(0,cats.length), borderWidth:0, hoverOffset:10 }] }}
                options={{ ...baseOpts, cutout:'65%', plugins:{ legend:{ display:true, position:'right', labels:{ color:'#8888aa',font:{size:11},boxWidth:10,padding:10 } } } }} />
            </div>
          </div>
          <div className="card">
            <h3 style={{ fontSize:15,fontWeight:600,marginBottom:14 }}>Category Breakdown</h3>
            <div className="col gap3">
              {cats.slice(0,6).map((cat,i) => {
                const pct = summary.expense>0 ? (cat.total/summary.expense)*100 : 0
                const c   = CHART_COLORS[i%CHART_COLORS.length]
                return (
                  <div key={cat._id}>
                    <div className="row between" style={{ marginBottom:4 }}>
                      <span style={{ fontSize:13,display:'flex',alignItems:'center',gap:5,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>
                        {CATEGORY_ICONS[cat._id]||'📦'} {cat._id}
                      </span>
                      <span style={{ fontSize:12,color:c,fontWeight:600 }}>{pct.toFixed(1)}%</span>
                    </div>
                    <div style={{ height:4,background:'var(--bg4)',borderRadius:99,overflow:'hidden' }}>
                      <div style={{ height:'100%',width:`${pct}%`,background:c,borderRadius:99,transition:'width .6s ease' }} />
                    </div>
                    <div style={{ fontSize:11,color:'var(--text2)',marginTop:3,textAlign:'right' }}>
                      {formatCurrency(cat.total,user?.currency)} · {cat.count} txn{cat.count!==1?'s':''}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
