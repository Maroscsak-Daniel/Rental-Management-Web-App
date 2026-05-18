export type UserRole = 'landlord' | 'tenant'
export type UnitStatus = 'occupied' | 'vacant'

export interface Profile {
  id: string // UUID matches auth.users.id
  role: UserRole
  tenant_id: string | null
  created_at: string
}

export interface Building {
  id: string // UUID
  landlord_id: string // UUID
  name: string
  created_at: string
}

export interface Unit {
  id: string // UUID
  building_id: string // UUID
  floor: string | null
  size_sqm: number | null
  rent_amount: number
  status: UnitStatus
  created_at: string
}
