export const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥' }

export const formatCurrency = (amount, currency = 'INR') => {
  const sym = CURRENCY_SYMBOLS[currency] || '₹'
  const n   = Math.abs(parseFloat(amount) || 0)
  return `${sym}${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export const formatDate = d =>
  new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })

export const todayStr = () => new Date().toISOString().split('T')[0]

export const EXPENSE_CATEGORIES = [
  'Food & Dining', 'Transport', 'Shopping', 'Bills & Utilities',
  'Entertainment', 'Health', 'Education', 'Rent', 'Travel',
  'Groceries', 'Subscriptions', 'Other',
]

export const INCOME_CATEGORIES = [
  'Salary', 'Freelance', 'Business', 'Investment',
  'Rental Income', 'Gift', 'Bonus', 'Refund', 'Other',
]

export const CATEGORY_ICONS = {
  'Food & Dining': '🍽️', 'Transport': '🚗', 'Shopping': '🛍️',
  'Bills & Utilities': '⚡', 'Entertainment': '🎬', 'Health': '💊',
  'Education': '📚', 'Rent': '🏠', 'Travel': '✈️',
  'Groceries': '🛒', 'Subscriptions': '📱', 'Other': '📦',
  'Salary': '💼', 'Freelance': '💻', 'Business': '🏢',
  'Investment': '📈', 'Rental Income': '🏘️', 'Gift': '🎁',
  'Bonus': '🎉', 'Refund': '↩️',
}

export const CHART_COLORS = [
  '#5b8def', '#a78bfa', '#22d47e', '#f0a020',
  '#ff6b7a', '#2dd4bf', '#fb923c', '#e879f9',
  '#38bdf8', '#4ade80', '#fbbf24', '#f87171',
]

export const exportToCSV = transactions => {
  const header = ['Date', 'Type', 'Category', 'Amount', 'Note']
  const rows   = transactions.map(t => [formatDate(t.date), t.type, t.category, t.amount, t.note || ''])
  const csv    = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n')
  const url    = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a      = Object.assign(document.createElement('a'), { href: url, download: `finflow_${todayStr()}.csv` })
  a.click()
  URL.revokeObjectURL(url)
}
