import { createContext, useContext, useMemo, useState } from 'react'
import type { UserRole } from '@/types'

interface RoleContextValue {
  role: UserRole
  userName: string
  setRole: (role: UserRole) => void
  isUser: boolean
  isApprover: boolean
}

const RoleContext = createContext<RoleContextValue | null>(null)

const roleProfiles: Record<UserRole, string> = {
  USER: 'John Doe',
  APPROVER: 'Jane Manager',
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole>('USER')

  const value = useMemo(
    () => ({
      role,
      userName: roleProfiles[role],
      setRole,
      isUser: role === 'USER',
      isApprover: role === 'APPROVER',
    }),
    [role],
  )

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>
}

export function useRole() {
  const context = useContext(RoleContext)
  if (!context) throw new Error('useRole must be used within RoleProvider')
  return context
}
