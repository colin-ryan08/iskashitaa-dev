import { useState } from 'react'
import { db } from '../db/db'
import { loadSampleData } from '../data/sampleData'

export default function Admin() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function clearAllData() {
    const confirmed = window.confirm(
      'This permanently deletes every property, tree, harvest, and volunteer stored on this device. This cannot be undone. Continue?'
    )
    if (!confirmed) return

    setBusy(true)
    setMessage(null)
    await db.transaction(
      'rw',
      [
        db.properties,
        db.fruitTypes,
        db.trees,
        db.harvests,
        db.harvestItems,
        db.harvestFruitQuality,
        db.volunteers,
        db.shiftAttendance,
        db.dropOffs,
        db.dropOffItems
      ],
      async () => {
        await Promise.all([
          db.properties.clear(),
          db.fruitTypes.clear(),
          db.trees.clear(),
          db.harvests.clear(),
          db.harvestItems.clear(),
          db.harvestFruitQuality.clear(),
          db.volunteers.clear(),
          db.shiftAttendance.clear(),
          db.dropOffs.clear(),
          db.dropOffItems.clear()
        ])
      }
    )
    setBusy(false)
    setMessage('All local data cleared.')
  }

  async function reloadSampleData() {
    setBusy(true)
    setMessage(null)
    await loadSampleData()
    setBusy(false)
    setMessage('Sample data loaded.')
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-lg border border-dashed border-gray-300 p-6 space-y-2">
        <h2 className="text-lg font-semibold text-gray-700">Admin</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Manage properties, trees, fruit types, and volunteers directly — the field-data
          equivalents of editing records in Salesforce, without a separate session. Coming soon.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-red-200 p-4 space-y-3">
        <p className="text-sm font-medium text-red-700">Reset local data</p>
        <p className="text-xs text-gray-500">
          Wipes everything stored on this device — properties, trees, harvests, volunteers. Use
          this between test runs, or to clear the sample data before entering real properties.
        </p>
        <div className="flex gap-3">
          <button
            onClick={clearAllData}
            disabled={busy}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Clear all local data
          </button>
          <button
            onClick={reloadSampleData}
            disabled={busy}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Load sample data
          </button>
        </div>
        {message && <p className="text-xs text-gray-500">{message}</p>}
      </div>
    </div>
  )
}
