export type UserRole = 'landlord' | 'tenant'
export type UnitStatus = 'occupied' | 'vacant'
export type LeaseStatus = 'active' | 'expired' | 'terminated'

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

export interface Tenant {
  id: string // UUID
  landlord_id: string // UUID
  first_name: string
  last_name: string
  email: string
  phone: string | null
  created_at: string
}

export interface Lease {
  id: string // UUID
  landlord_id: string // UUID
  tenant_id: string // UUID
  unit_id: string // UUID
  start_date: string
  end_date: string
  rent_amount: number
  status: LeaseStatus
  created_at: string
}

export interface TenantDocument {
  id: string // UUID
  landlord_id: string // UUID
  tenant_id: string | null
  unit_id: string | null
  file_name: string
  file_path: string // Supabase Storage path
  file_size: number // bytes
  mime_type: string
  created_at: string
}
