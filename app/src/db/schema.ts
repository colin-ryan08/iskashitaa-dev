// Local data model — mirrors the Salesforce object model in Section 4 of the design doc.
// `externalId` / `qbCustomerId` / `qbItemId` fields exist so a future Salesforce/QuickBooks
// sync can match records without creating duplicates (see design doc Section 10).

export type HarvestStatus = 'Scheduled' | 'Completed' | 'Cancelled'
export type RemainingEstimate = 'Low' | 'Medium' | 'High' | null
export type DistributionDestination =
  | 'Refugee Distribution'
  | 'Food Pantry'
  | 'Preservation'
  | 'Compost'

export interface Property {
  id?: number
  externalId?: string // Salesforce Account ID, once synced
  qbCustomerId?: string // QuickBooks Customer match (Section 10 mapping)
  name: string
  address: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  preferredContactMethod?: string
  accessNotes?: string // gate, dog, ladder, etc.
  latitude?: number
  longitude?: number
  isRecipientOrg?: boolean // Account record type: Property vs. Recipient Org
  lastSyncedAt?: string
}

export interface FruitType {
  id?: number
  externalId?: string
  name: string
  variety?: string
  season?: string
  typicalYieldRangeLow?: number
  typicalYieldRangeHigh?: number
}

export interface Tree {
  id?: number
  externalId?: string
  qbItemId?: string // QuickBooks Item match (Section 10 mapping)
  propertyId: number
  fruitTypeId: number
  label?: string // e.g. "Orange Tree #1" — helps Leads tell trees apart on-site
  locationOnProperty?: string
  ladderRequired: boolean
  estimatedYield?: number
}

export interface Harvest {
  id?: number
  externalId?: string
  propertyId: number
  date: string // ISO date (yyyy-mm-dd)
  harvestLeadName: string
  status: HarvestStatus
  totalLbs?: number
  distributionDestinations: DistributionDestination[]
  notes?: string
  progressionNotes?: string // "ready to advance to Step X" type notes, recommended field
  visitOrder?: number
  addedInField: boolean // true if this stop wasn't pre-scheduled
  archived: boolean
}

export interface HarvestItem {
  id?: number
  externalId?: string
  harvestId: number
  treeId: number
  fruitTypeId: number
  lbsHarvested: number
  lbsDistributionQuality: number
  lbsFirstUse: number
  lbsPetAnimalFeed: number
  lbsCompost: number
  estimatedFruitRemaining: RemainingEstimate // closes the capture-rate gap (Section "Known Gaps")
}

export interface Volunteer {
  id?: number
  externalId?: string
  name: string
  phone?: string
  email?: string
  progressionStep?: string
  totalHours?: number
  refugeeParticipant: boolean
}

export interface VolunteerShiftAttendance {
  id?: number
  externalId?: string
  volunteerId: number
  harvestId: number
  hours?: number
  progressionStepAtTime?: string
  roleAssigned?: string
  walkIn: boolean // true if added on-site, not pre-scheduled
  noShow: boolean
}

export interface DropOff {
  id?: number
  externalId?: string
  recipientPropertyId: number // Account (Recipient Org)
  date: string
  totalLbs?: number
  distributionType: DistributionDestination
  archived: boolean
}

export interface DropOffItem {
  id?: number
  externalId?: string
  dropOffId: number
  fruitTypeId: number
  lbs: number
}
