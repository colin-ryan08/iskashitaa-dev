import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router-dom'
import { db } from '../db/db'
import { loadSampleData } from '../data/sampleData'

const statusStyles: Record<string, string> = {
  Scheduled: 'bg-yellow-100 text-yellow-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-gray-200 text-gray-600'
}

export default function TodaysStops() {
  const today = new Date().toISOString().slice(0, 10)

  const harvests = useLiveQuery(
    () => db.harvests.where('date').equals(today).and((h) => !h.archived).sortBy('visitOrder'),
    [today]
  )
  const properties = useLiveQuery(() => db.properties.toArray(), [])

  const propertyName = (id: number) => properties?.find((p) => p.id === id)?.name ?? 'Unknown property'
  const propertyAddress = (id: number) => properties?.find((p) => p.id === id)?.address ?? ''

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Today's Stops</h2>
        <span className="text-sm text-gray-500">{today}</span>
      </div>

      {harvests && harvests.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center space-y-3">
          <p className="text-gray-600">No stops scheduled for today yet.</p>
          <button
            onClick={() => loadSampleData()}
            className="bg-harvest text-white px-4 py-2 rounded-md text-sm"
          >
            Load sample data
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {harvests?.map((h) => (
          <li key={h.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">{propertyName(h.propertyId)}</p>
                <p className="text-sm text-gray-500">{propertyAddress(h.propertyId)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${statusStyles[h.status]}`}>
                {h.status}
              </span>
            </div>
            <Link to={`/field/${h.id}`} className="mt-3 inline-block text-sm font-medium text-harvest">
              Open field entry →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
