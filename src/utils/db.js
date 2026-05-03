// ─── FinFlow Local Database (localStorage) ───────────────────────────────────
const USERS_KEY = 'ff_users'
const TX_KEY    = 'ff_tx'
const SESSION_KEY = 'ff_session'

const load  = k => { try { return JSON.parse(localStorage.getItem(k)) || [] } catch { return [] } }
const save  = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36)

// Simple password hashing (no backend needed)
const hashPw = pw => {
  let h = 0
  const s = `finflow::${pw}::2024`
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return `$ff$${Math.abs(h).toString(16)}_${btoa(s).slice(0, 16)}`
}
const checkPw = (pw, hash) => hashPw(pw) === hash

export const db = {
  // ── SESSION ────────────────────────────────────────────────────────────────
  getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) } catch { return null }
  },
  setSession(user) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(user)) },
  clearSession()   { sessionStorage.removeItem(SESSION_KEY) },

  // ── AUTH ───────────────────────────────────────────────────────────────────
  register(name, email, password) {
    name     = (name     || '').trim()
    email    = (email    || '').trim().toLowerCase()
    password = (password || '')

    if (!name)              throw new Error('Full name is required.')
    if (name.length < 2)    throw new Error('Name must be at least 2 characters.')
    if (!email)             throw new Error('Email address is required.')
    if (!/\S+@\S+\.\S+/.test(email)) throw new Error('Please enter a valid email address.')
    if (!password)          throw new Error('Password is required.')
    if (password.length < 6) throw new Error('Password must be at least 6 characters.')

    const users = load(USERS_KEY)
    if (users.find(u => u.email === email)) {
      throw new Error('This email is already registered. Please sign in instead.')
    }

    const user = {
      id: genId(),
      name,
      email,
      password: hashPw(password),
      avatar: name[0].toUpperCase(),
      currency: 'INR',
      createdAt: new Date().toISOString(),
    }
    save(USERS_KEY, [...users, user])

    const safe = { ...user }
    delete safe.password
    this.setSession(safe)
    return safe
  },

  login(email, password) {
    email    = (email    || '').trim().toLowerCase()
    password = (password || '')

    if (!email || !password) throw new Error('Please enter your email and password.')

    const users = load(USERS_KEY)
    const user  = users.find(u => u.email === email)
    if (!user || !checkPw(password, user.password)) {
      throw new Error('Incorrect email or password. Please try again.')
    }

    const safe = { ...user }
    delete safe.password
    this.setSession(safe)
    return safe
  },

  logout() { this.clearSession() },

  updateProfile(userId, updates) {
    const users = load(USERS_KEY)
    const idx   = users.findIndex(u => u.id === userId)
    if (idx === -1) throw new Error('User not found.')

    const updated = { ...users[idx], ...updates }
    if (updates.name) updated.avatar = updates.name.trim()[0].toUpperCase()
    users[idx] = updated
    save(USERS_KEY, users)

    const safe = { ...updated }
    delete safe.password
    this.setSession(safe)
    return safe
  },

  changePassword(userId, currentPw, newPw) {
    if (!newPw || newPw.length < 6) throw new Error('New password must be at least 6 characters.')
    const users = load(USERS_KEY)
    const idx   = users.findIndex(u => u.id === userId)
    if (idx === -1) throw new Error('User not found.')
    if (!checkPw(currentPw, users[idx].password)) throw new Error('Current password is incorrect.')
    users[idx].password = hashPw(newPw)
    save(USERS_KEY, users)
    return true
  },

  // ── TRANSACTIONS ───────────────────────────────────────────────────────────
  addTransaction(userId, data) {
    const { type, amount, category, date, note } = data

    if (!['income', 'expense'].includes(type)) throw new Error('Invalid transaction type.')
    if (!amount || isNaN(amount) || +amount <= 0) throw new Error('Please enter a valid amount.')
    if (!category || !category.trim()) throw new Error('Please select a category.')
    if (!date) throw new Error('Please select a date.')

    const tx = {
      id:       genId(),
      userId,
      type,
      amount:   Math.round(parseFloat(amount) * 100) / 100,
      category: category.trim(),
      date,
      note:     (note || '').trim(),
      createdAt: new Date().toISOString(),
    }
    const txs = load(TX_KEY)
    save(TX_KEY, [tx, ...txs])
    return tx
  },

  getTransactions(userId, filters = {}) {
    let txs = load(TX_KEY).filter(t => t.userId === userId)

    if (filters.type && filters.type !== 'all')         txs = txs.filter(t => t.type === filters.type)
    if (filters.category && filters.category !== 'all') txs = txs.filter(t => t.category === filters.category)
    if (filters.month)  txs = txs.filter(t => t.date.startsWith(filters.month))
    if (filters.search) {
      const q = filters.search.toLowerCase()
      txs = txs.filter(t =>
        t.category.toLowerCase().includes(q) ||
        (t.note || '').toLowerCase().includes(q)
      )
    }
    return txs.sort((a, b) => new Date(b.date) - new Date(a.date))
  },

  updateTransaction(userId, id, data) {
    const txs = load(TX_KEY)
    const idx = txs.findIndex(t => t.id === id && t.userId === userId)
    if (idx === -1) throw new Error('Transaction not found.')
    txs[idx] = {
      ...txs[idx],
      type:     data.type     ?? txs[idx].type,
      amount:   data.amount != null ? Math.round(parseFloat(data.amount) * 100) / 100 : txs[idx].amount,
      category: data.category ?? txs[idx].category,
      date:     data.date     ?? txs[idx].date,
      note:     data.note != null ? data.note.trim() : txs[idx].note,
    }
    save(TX_KEY, txs)
    return txs[idx]
  },

  deleteTransaction(userId, id) {
    const txs = load(TX_KEY)
    const next = txs.filter(t => !(t.id === id && t.userId === userId))
    if (next.length === txs.length) throw new Error('Transaction not found.')
    save(TX_KEY, next)
  },

  getSummary(userId) {
    const txs     = load(TX_KEY).filter(t => t.userId === userId)
    const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // Category breakdown
    const catMap = {}
    txs.filter(t => t.type === 'expense').forEach(t => {
      if (!catMap[t.category]) catMap[t.category] = { total: 0, count: 0 }
      catMap[t.category].total += t.amount
      catMap[t.category].count++
    })
    const categoryBreakdown = Object.entries(catMap)
      .map(([_id, v]) => ({ _id, ...v }))
      .sort((a, b) => b.total - a.total)

    // Monthly trend — last 6 months
    const now = new Date()
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const d   = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const mo  = txs.filter(t => t.date.startsWith(key))
      return {
        label:   d.toLocaleDateString('en-IN', { month: 'short' }),
        income:  mo.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
        expense: mo.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      }
    })

    return {
      income, expense,
      balance:      income - expense,
      incomeCount:  txs.filter(t => t.type === 'income').length,
      expenseCount: txs.filter(t => t.type === 'expense').length,
      categoryBreakdown,
      monthlyTrend,
    }
  },
}
