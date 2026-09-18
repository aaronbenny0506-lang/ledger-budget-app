import { useEffect, useMemo, useState } from 'react'
import EntryForm from './components/EntryForm.jsx'
import Ledger from './components/Ledger.jsx'
import Summary from './components/Summary.jsx'
import CategoryWheel from './components/CategoryWheel.jsx'
import { loadEntries, saveEntries } from './utils/storage.js'
import './index.css'

export default function App() {
  const [entries, setEntries] = useState(() => loadEntries())
  const [filter, setFilter] = useState('all') // all | income | expense

  useEffect(() => {
    saveEntries(entries)
  }, [entries])

  const totals = useMemo(() => {
    const income = entries
      .filter((e) => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0)
    const expense = entries
      .filter((e) => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0)
    return { income, expense, balance: income - expense }
  }, [entries])

  const categoryTotals = useMemo(() => {
    const map = {}
    entries
      .filter((e) => e.type === 'expense')
      .forEach((e) => {
        map[e.category] = (map[e.category] || 0) + e.amount
      })
    return Object.entries(map)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
  }, [entries])

  const visibleEntries = useMemo(() => {
    if (filter === 'all') return entries
    return entries.filter((e) => e.type === filter)
  }, [entries, filter])

  function addEntry(entry) {
    setEntries((prev) => [{ ...entry, id: crypto.randomUUID() }, ...prev])
  }

  function removeEntry(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  return (
    <div className="page">
      <header className="masthead">
        <div className="masthead-inner">
          <p className="masthead-eyebrow">Personal Finance</p>
          <h1 className="masthead-title">The Ledger</h1>
          <p className="masthead-sub">A running record of what comes in and what goes out.</p>
        </div>
      </header>

      <main className="layout">
        <section className="column-main">
          <Summary totals={totals} />
          <EntryForm onAdd={addEntry} />
          <Ledger
            entries={visibleEntries}
            filter={filter}
            onFilterChange={setFilter}
            onRemove={removeEntry}
          />
        </section>

        <aside className="column-side">
          <CategoryWheel data={categoryTotals} total={totals.expense} />
        </aside>
      </main>

      <footer className="page-footer">
        <p>Kept locally in this browser — nothing leaves your device.</p>
      </footer>
    </div>
  )
}
