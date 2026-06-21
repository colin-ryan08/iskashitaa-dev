import Dexie, { type Table } from 'dexie'
import type {
  Property,
  FruitType,
  Tree,
  Harvest,
  HarvestItem,
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
  }
}

export const db = new IskashitaaDB()
