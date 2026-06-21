import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { DistributionDestination, FruitType, HarvestFruitQuality } from '../db/schema'

const destinationOptions: DistributionDestination[] = [
  'Refugee Distribution',
  'Food Pantry',
  'Preservation',
  'Compost'
]

const qualityFields: { field: keyof HarvestFruitQuality; label: string }[] = [
  { field: 'lbsDistributionQuality', label: 'Distribution-quality' },
  { field: 'lbsFirstUse', label: 'First-use / take-home' },
  { field: 'lbsPetAnimalFeed', label: 'Pet / animal feed' },
  { field: 'lbsCompost', label: 'Compost' }
]

export default function ReviewQueue() {
  const properties = useLiveQuery(() => db.properties.toArray(), [])
  const fruitTypes = useLiveQuery(() => db.fruitTypes.toArray(), [])
  const harvests = useLiveQuery(
    () =>
      db.harvests
        .where('status')
        .equals('Completed')
        .and((h) => !h.reviewed && !h.archived)
        .sortBy('date'),
    []
  )

  const propertyName = (id: number) => properties?.find((p) => p.id === id)?.name ?? 'Unknown property'

  if (!harvests) return <p className="text-gray-500">Loading…</p>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Review Queue</h2>
        <span className="text-sm text-gray-500">{harvests.length} waiting</span>
      </div>

      {harvests.length === 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            Nothing waiting on review. Completed harvests land here once crates have been
            consolidated and are ready to sort by quality.
          </p>
        </div>
      )}

      {harvests.map((h) => (
        <HarvestReviewCard
          key={h.id}
          harvestId={h.id!}
          propertyName={propertyName(h.propertyId)}
          date={h.date}
          totalLbs={h.totalLbs}
          destinations={h.distributionDestinations}
          fruitTypes={fruitTypes ?? []}
        />
      ))}
    </div>
  )
}

function HarvestReviewCard({
  harvestId,
  propertyName,
  date,
  totalLbs,
  destinations,
  fruitTypes
}: {
  harvestId: number
  propertyName: string
  date: string
  totalLbs?: number
  destinations: DistributionDestination[]
  fruitTypes: FruitType[]
}) {
  const items = useLiveQuery(() => db.harvestItems.where('harvestId').equals(harvestId).toArray(), [harvestId])
  const quality = useLiveQuery(
    () => db.harvestFruitQuality.where('harvestId').equals(harvestId).toArray(),
    [harvestId]
  )

  const byFruit = new Map<number, number>()
  items?.forEach((i) => byFruit.set(i.fruitTypeId, (byFruit.get(i.fruitTypeId) ?? 0) + (i.lbsHarvested || 0)))
  const fruitIds = Array.from(byFruit.keys())

  const fruitName = (id: number) => fruitTypes.find((f) => f.id === id)?.name ?? 'Unknown fruit'
  const qualityFor = (fruitTypeId: number) => quality?.find((q) => q.fruitTypeId === fruitTypeId)

  async function updateQuality(fruitTypeId: number, patch: Partial<HarvestFruitQuality>) {
    const existing = qualityFor(fruitTypeId)
    if (existing?.id) {
      await db.harvestFruitQuality.update(existing.id, patch)
    } else {
      await db.harvestFruitQuality.add({
        harvestId,
        fruitTypeId,
        lbsDistributionQuality: 0,
        lbsFirstUse: 0,
        lbsPetAnimalFeed: 0,
        lbsCompost: 0,
        ...patch
      })
    }
  }

  async function toggleDestination(dest: DistributionDestination) {
    const next = destinations.includes(dest)
      ? destinations.filter((d) => d !== dest)
      : [...destinations, dest]
    await db.harvests.update(harvestId, { distributionDestinations: next })
  }

  async function markReviewed() {
    await db.harvests.update(harvestId, { reviewed: true })
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div>
        <p className="font-medium text-gray-900">{propertyName}</p>
        <p className="text-sm text-gray-500">
          {date}
          {totalLbs != null ? ` · ${totalLbs} lbs harvested` : ''}
        </p>
      </div>

      <div className="space-y-3">
        {fruitIds.map((fid) => {
          const q = qualityFor(fid)
          const harvested = byFruit.get(fid) ?? 0
          const tierSum =
            (q?.lbsDistributionQuality ?? 0) +
            (q?.lbsFirstUse ?? 0) +
            (q?.lbsPetAnimalFeed ?? 0) +
            (q?.lbsCompost ?? 0)

          return (
            <div key={fid} className="border border-gray-100 rounded-md p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {fruitName(fid)}{' '}
                <span className="text-gray-400 font-normal">— {harvested} lbs harvested</span>
              </p>
              <div className="grid grid-cols-2 gap-3">
                {qualityFields.map(({ field, label }) => (
                  <label key={field} className="text-sm text-gray-600">
                    {label}
                    <input
                      type="number"
                      min={0}
                      inputMode="decimal"
                      defaultValue={(q?.[field] as number) ?? ''}
                      onBlur={(e) =>
                        updateQuality(fid, {
                          [field]: Number(e.target.value) || 0
                        } as Partial<HarvestFruitQuality>)
                      }
                      className="mt-1 w-full border border-gray-300 rounded-md px-2 py-1.5"
                    />
                  </label>
                ))}
              </div>
              {tierSum > 0 && tierSum !== harvested && (
                <p className="text-xs text-amber-600">
                  Tiers add up to {tierSum} lbs — harvest logged {harvested} lbs for this fruit.
                </p>
              )}
            </div>
          )
        })}

        {fruitIds.length === 0 && (
          <p className="text-sm text-gray-500">No per-tree lbs recorded for this harvest yet.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Distribution destination</p>
        <div className="flex flex-wrap gap-3">
          {destinationOptions.map((opt) => (
            <label key={opt} className="text-sm text-gray-600 flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={destinations.includes(opt)}
                onChange={() => toggleDestination(opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={markReviewed}
        className="w-full bg-harvest text-white py-2 rounded-md text-sm font-medium"
      >
        Mark Reviewed
      </button>
    </div>
  )
}
