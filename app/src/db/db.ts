import Dexie, { type Table } from 'dexie'
import type {
  Property,
  FruitType,
  Tree,
  Harvest,
  HarvestItem,
  HarvestFruitQuality,
  Volunteer,
  VolunteerShiftAttendance,
  DropOff,
  DropOffItem
} from './schema'

export class IskashitaaDB extends Dexie {
  properties!: Table<Property, number>
  fruitTypes!: Table<FruitType, number>
  trees!: Table<Tree, number>
  harvests!: Table<Harvest, number>
  harvestItems!: Table<HarvestItem, number>
  harvestFruitQuality!: Table<HarvestFruitQuality, number>
  volunteers!: Table<Volunteer, number>
  shiftAttendance!: Table<VolunteerShiftAttendance, number>
  dropOffs!: Table<DropOff, number>
  dropOffItems!: Table<DropOffItem, number>

  constructor() {
    super('iskashitaa-harvest-db')
    this.version(1).stores({
      properties: '++id, name, qbCustomerId',
      fruitTypes: '++id, name',
      trees: '++id, propertyId, fruitTypeId, qbItemId',
      harvests: '++id, propertyId, date, status, archived',
      harvestItems: '++id, harvestId, treeId, fruitTypeId',
      volunteers: '++id, name',
      shiftAttendance: '++id, volunteerId, harvestId',
      dropOffs: '++id, date, archived',
      dropOffItems: '++id, dropOffId, fruitTypeId'
    })

    // v2: quality breakdown moved from per-tree (HarvestItem) to per-fruit-type-per-harvest
    // (HarvestFruitQuality), reflecting that crates get consolidated by fruit type before
    // sorting. Added `reviewed` to Harvest so Review Queue can find what still needs sorting.
    this.version(2).stores({
      properties: '++id, name, qbCustomerId',
      fruitTypes: '++id, name',
      trees: '++id, propertyId, fruitTypeId, qbItemId',
      harvests: '++id, propertyId, date, status, archived, reviewed',
      harvestItems: '++id, harvestId, treeId, fruitTypeId',
      harvestFruitQuality: '++id, harvestId, fruitTypeId, &[harvestId+fruitTypeId]',
      volunteers: '++id, name',
      shiftAttendance: '++id, volunteerId, harvestId',
      dropOffs: '++id, date, archived',
      dropOffItems: '++id, dropOffId, fruitTypeId'
    }).upgrade(async (tx) => {
      await tx
        .table('harvests')
        .toCollection()
        .modify((h) => {
          h.reviewed = false
        })
    })
  }
}

export const db = new IskashitaaDB()
