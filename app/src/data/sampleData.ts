import { db } from '../db/db'

// Loads one example property with two trees and a scheduled harvest for today, so the app
// has something to show in the live preview before real properties are entered.
export async function loadSampleData() {
  const existing = await db.properties.count()
  if (existing > 0) return

  const orangeId = await db.fruitTypes.add({ name: 'Orange', variety: 'Valencia', season: 'Spring' })
  const grapefruitId = await db.fruitTypes.add({ name: 'Grapefruit', season: 'Winter' })

  const propertyId = await db.properties.add({
    name: 'Smith Residence',
    address: '123 Calle Verde, Tucson, AZ 85716',
    contactName: 'Jane Smith',
    contactPhone: '(520) 555-0142',
    preferredContactMethod: 'Text',
    accessNotes: 'Side gate, code 4521. Friendly dog. Ladder needed for the grapefruit tree.'
  })

  await db.trees.add({
    propertyId,
    fruitTypeId: orangeId,
    label: 'Orange Tree #1',
    locationOnProperty: 'Backyard, near fence',
    ladderRequired: false,
    estimatedYield: 80
  })

  await db.trees.add({
    propertyId,
    fruitTypeId: grapefruitId,
    label: 'Grapefruit Tree #1',
    locationOnProperty: 'Side yard',
    ladderRequired: true,
    estimatedYield: 120
  })

  await db.harvests.add({
    propertyId,
    date: new Date().toISOString().slice(0, 10),
    harvestLeadName: 'Unassigned',
    status: 'Scheduled',
    distributionDestinations: [],
    addedInField: false,
    archived: false,
    reviewed: false
  })
}
