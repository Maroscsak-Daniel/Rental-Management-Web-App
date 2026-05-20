-- Run in Supabase SQL Editor before Phase 5 features

CREATE TYPE notification_type AS ENUM (
  'lease_expiry',
  'payment_overdue',
  'maintenance_stale'
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  reference_id uuid NOT NULL,
  message varchar(500) NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_landlord_unread_idx
  ON notifications (landlord_id, created_at DESC)
  WHERE is_read = false;

CREATE UNIQUE INDEX notifications_unread_dedup_idx
  ON notifications (landlord_id, type, reference_id)
  WHERE is_read = false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Landlords select own notifications"
  ON notifications FOR SELECT
  USING (landlord_id = auth.uid());

CREATE POLICY "Landlords update own notifications"
  ON notifications FOR UPDATE
  USING (landlord_id = auth.uid())
  WITH CHECK (landlord_id = auth.uid());
