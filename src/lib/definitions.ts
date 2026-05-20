export type UserRole = 'landlord' | 'tenant'
export type UnitStatus = 'occupied' | 'vacant'

export interface Profile {
  id: string // UUID matches auth.users.id
  role: UserRole
  tenant_id: string | null
  full_name?: string | null
  created_at: string
}

export interface Tenant {
  id: string
  landlord_id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  status: 'active' | 'inactive'
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

export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved'
export type LeaseStatus = 'active' | 'expired' | 'terminated'

export interface MaintenanceRequest {
  id: string
  unit_id: string
  submitted_by_tenant_id: string | null
  description: string
  resolution_notes: string | null
  reported_at: string
  status: MaintenanceStatus
  resolved_at: string | null
  created_at: string
}

export interface Lease {
  id: string
  landlord_id: string
  unit_id: string
  tenant_id: string
  start_date: string
  end_date: string
  rent_amount: number
  status: LeaseStatus
  created_at: string
}

export interface ExpiringLease extends Lease {
  days_remaining: number
  unit: {
    id: string
    floor: string | null
    buildings: { id: string; name: string }
  }
  tenant: Pick<Tenant, 'id' | 'first_name' | 'last_name'>
}
