'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_TOTAL_STORAGE = 1 * 1024 * 1024 * 1024 // 1GB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

export async function uploadDocument(formData: FormData) {
  const supabase = await createClient()

  const file = formData.get('file') as File
  const tenantId = formData.get('tenant_id') as string | null
  const unitId = formData.get('unit_id') as string | null

  if (!file || file.size === 0) {
    return { error: 'No file selected.' }
  }

  if (!tenantId && !unitId) {
    return { error: 'Document must be attached to a tenant or unit.' }
  }

  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: 'Only PDF, JPG, and PNG files are allowed.' }
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.` }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Check total storage quota
  const { data: storageData } = await supabase
    .from('documents')
    .select('file_size')
    .eq('landlord_id', user.id)

  const totalUsed = storageData?.reduce((sum, doc) => sum + doc.file_size, 0) || 0

  if (totalUsed + file.size > MAX_TOTAL_STORAGE) {
    const usedMB = Math.round(totalUsed / 1024 / 1024)
    return { error: `Storage limit reached (${usedMB}MB / 1000MB used). Delete some files to free up space.` }
  }

  // Sanitize filename
  const timestamp = Date.now()
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const entityFolder = tenantId ? `tenant_${tenantId}` : `unit_${unitId}`
  const storagePath = `${user.id}/${entityFolder}/${timestamp}_${sanitizedName}`

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(storagePath, file, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  // Insert document record
  const { error: dbError } = await supabase.from('documents').insert({
    landlord_id: user.id,
    tenant_id: tenantId,
    unit_id: unitId,
    file_name: file.name,
    file_path: storagePath,
    file_size: file.size,
    mime_type: file.type,
  })

  if (dbError) {
    // Rollback: remove from storage
    await supabase.storage.from('documents').remove([storagePath])
    return { error: `Failed to save document record: ${dbError.message}` }
  }

  if (tenantId) {
    revalidatePath(`/tenants/${tenantId}`)
  }
  if (unitId) {
    revalidatePath(`/units/${unitId}`)
  }
  return { success: true }
}

export async function deleteDocument(documentId: string) {
  const supabase = await createClient()

  // Get document details
  const { data: doc, error: fetchError } = await supabase
    .from('documents')
    .select('file_path, tenant_id, unit_id')
    .eq('id', documentId)
    .single()

  if (fetchError || !doc) {
    return { error: 'Document not found.' }
  }

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([doc.file_path])

  if (storageError) {
    return { error: `Failed to delete file: ${storageError.message}` }
  }

  // Delete record
  const { error: dbError } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)

  if (dbError) {
    return { error: dbError.message }
  }

  if (doc.tenant_id) {
    revalidatePath(`/tenants/${doc.tenant_id}`)
  }
  if (doc.unit_id) {
    revalidatePath(`/units/${doc.unit_id}`)
  }
  return { success: true }
}

export async function getDocumentUrl(filePath: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600) // 1 hour expiry

  if (error) {
    return { error: error.message }
  }

  return { url: data.signedUrl }
}
