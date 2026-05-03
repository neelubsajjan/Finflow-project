import { useState } from 'react'
import { Modal, Field, Tabs } from './UI'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, todayStr } from '../utils/helpers'

const TYPE_TABS = [
  { value:'expense', label:'Expense', icon:'⬆', color:'var(--red)' },
  { value:'income',  label:'Income',  icon:'⬇', color:'var(--green)' },
]

export default function TxForm({ tx, onSave, onClose, loading }) {
  const [form, setForm] = useState({
    type:     tx?.type     || 'expense',
    amount:   tx?.amount   || '',
    category: tx?.category || '',
    date:     tx?.date     || todayStr(),
    note:     tx?.note     || '',
  })
  const [errs, setErrs] = useState({})

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]:'' })) }

  const cats = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const submit = () => {
    const e = {}
    if (!form.amount || isNaN(form.amount) || +form.amount <= 0) e.amount   = 'Enter a valid amount'
    if (!form.category) e.category = 'Select a category'
    if (!form.date)     e.date     = 'Select a date'
    setErrs(e)
    if (Object.keys(e).length) return
    onSave({ ...form, amount: parseFloat(form.amount) })
  }

  return (
    <Modal title={tx ? 'Edit Transaction' : 'New Transaction'} onClose={onClose}>
      <div className="col" style={{ gap:17 }}>
        <Tabs options={TYPE_TABS} value={form.type} onChange={v => { set('type',v); set('category','') }} />

        <Field label="Amount (₹)" error={errs.amount}>
          <input type="number" className="inp inpXl" placeholder="0.00"
            value={form.amount} min="0.01" step="0.01" autoFocus
            onChange={e => set('amount', e.target.value)} />
        </Field>

        <Field label="Category" error={errs.category}>
          <select className="inp" value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">— Select category —</option>
            {cats.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Date" error={errs.date}>
          <input type="date" className="inp" value={form.date} onChange={e => set('date', e.target.value)} />
        </Field>

        <Field label="Note (optional)">
          <textarea className="inp" rows={2} placeholder="What's this for?"
            value={form.note} onChange={e => set('note', e.target.value)} />
        </Field>

        <button onClick={submit} disabled={loading} style={{
          padding:13,borderRadius:10,border:'none',cursor:'pointer',
          background: form.type==='income'
            ? 'linear-gradient(135deg,#16a862,#22d47e)'
            : 'linear-gradient(135deg,#cc3344,#ff6b7a)',
          color:'#fff',fontSize:15,fontWeight:600,
          display:'flex',alignItems:'center',justifyContent:'center',gap:8,
        }}>
          {loading && <span className="spin" style={{ width:15,height:15,border:'2px solid rgba(255,255,255,.3)',borderTopColor:'#fff' }} />}
          {tx ? 'Update Transaction' : (form.type==='income' ? 'Add Income ⬇' : 'Add Expense ⬆')}
        </button>
      </div>
    </Modal>
  )
}
