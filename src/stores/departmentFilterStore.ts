import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DepartmentFilterState {
  department: string
  setDepartment: (department: string) => void
  resetDepartment: () => void
}

export const useDepartmentFilterStore = create<DepartmentFilterState>()(
  persist(
    (set) => ({
      department: 'all',
      setDepartment: (department: string) => set({ department }),
      resetDepartment: () => set({ department: 'all' }),
    }),
    { name: 'department-filter' }
  )
)
