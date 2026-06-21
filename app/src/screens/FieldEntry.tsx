import { useParams, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { HarvestItem, RemainingEstimate } from '../db/schema'

const remainingOptions: Exclude<RemainingEstimate, null>[] = ['Low', 'Medium', 'High']

export default function FieldEntry() {
  const { harvestId } = useParams()
  const id = Number(harvestId)
  const navigate = useNavigate()

  const harvest = useLiveQuery(() => db.harvests.get(id), [id])
  const property = useLiveQuery(
    () => (harvest ? db.properties.get(harvest.propertyId) : undefined),
    [harvest]
  )
  const trees = useLiveQuery(
    () => (harvest ? db.trees.where('propertyId').equals(harvest.propertyId).toArray() : []),
    [harvest]
  )
  const fruitTypes = useLiveQuery(() => db.fruitTypes.toArray(), [])
  const items = useLiveQuery(() => db.harvestItems.where('harvestId').equals(id).toArray(), [id])

  const fruitName = (fruitTypeId: number) => fruitTypes?.find((f) => f.id === fruitTypeId)?.name ?? ''
  const itemForTree = (treeId: number) => items?.find((i) => i.treeId === treeId)

  async function updateItem(treeId: number, fruitTypeId: number, patch: Partial<HarvestItem>) {
    const existing = itemForTree(treeId)
    if (existing?.id) {
      await db.harvestItems.update(existing.id, patch)
    } else {
      await db.harvestItems.add({
        harvestId: id,
        treeId,
        fruitTypeId,
        lbsHarvested: 0,
        estimatedFruitRemaining: null,
        ...patch
      })
    }
  }

  async function setStatus(status: 'Completed' | 'Cancelled') {
    const totalLbs = (items ?? []).reduce((sum, i) => sum + (i.lbsHarvested || 0), 0)
    await db.harvests.update(id, { status, totalLbs })
    navigate('/stops')
  }

  if (!harvest || !property) {
    return <p className="text-gray-500">Loading…</p>
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{property.name}</h2>
        <p className="text-sm text-gray-500">{property.address}</p>
        {property.accessNotes && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2 mt-2">
            {property.accessNotes}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {trees?.map((tree) => {
          const item = itemForTree(tree.id!)
          return (
            <div key={tree.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              <p className="font-medium text-gray-800">
                {tree.label ?? fruitName(tree.fruitTypeId)}{' '}
                {tree.ladderRequired && <span className="text-xs text-amber-600">(ladder)</span>}
              </p>

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-gray-600">
                  Lbs harvested
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    defaultValue={item?.lbsHarvested ?? ''}
                    onBlur={(e) =>
                      updateItem(tree.id!, tree.fruitTypeId, { lbsHarvested: Number(e.target.value) || 0 })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5"
                  />
                </label>
                <label className="text-sm text-gray-600">
                  Fruit left on tree
                  <select
                    defaultValue={item?.estimatedFruitRemaining ?? ''}
                    onChange={(e) =>
                      updateItem(tree.id!, tree.fruitTypeId, {
                        estimatedFruitRemaining: (e.target.value || null) as RemainingEstimate
                      })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5"
                  >
                    <option value="">—</option>
                    {remainingOptions.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          )
        })}

        {trees && trees.length === 0 && (
          <p className="text-sm text-gray-500">No trees recorded for this property yet — add them in Admin.</p>
        )}
      </div>

      <label className="block text-sm text-gray-600">
        Notes
        <textarea
          defaultValue={harvest.notes ?? ''}
          onBlur={(e) => db.harvests.update(id, { notes: e.target.value })}
          rows={3}
          className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5"
          placeholder="Site conditions, safety issues, homeowner feedback…"
        />
      </label>

      <p className="text-xs text-gray-500">
        Quality breakdown and distribution destination are entered later, in Review Queue, once
        crates from this visit have been consolidated and sorted by fruit type.
      </p>

      <div className="flex gap-3">
        <button
          onClick={() => setStatus('Completed')}
          className="flex-1 bg-harvest text-white py-2.5 rounded-md font-medium"
        >
          Mark Completed
        </button>
        <button
          onClick={() => setStatus('Cancelled')}
          className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-md font-medium"
        >
          Mark Cancelled
        </button>
      </div>
    </div>
  )
}
