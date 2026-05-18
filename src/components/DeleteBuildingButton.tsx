'use client'

import { deleteBuilding } from '@/app/buildings/actions'

interface DeleteBuildingButtonProps {
  id: string
  name?: string
  isDetail?: boolean
}

export default function DeleteBuildingButton({ id, name, isDetail }: DeleteBuildingButtonProps) {
  const handleDelete = async () => {
    // We could add a confirmation dialog here if we wanted
    const result = await deleteBuilding(id)
    if (result?.error) {
      alert(result.error)
    }
  }

  return (
    <button 
      type="button" 
      onClick={handleDelete}
      className={isDetail 
        ? "inline-flex items-center rounded-md bg-red-900/50 border border-red-500/20 px-3 py-2 text-sm font-semibold text-red-400 shadow-sm hover:bg-red-900/70"
        : "text-red-400 hover:text-red-300"
      }
    >
      Delete{name ? <span className="sr-only">, {name}</span> : null}
    </button>
  )
}
