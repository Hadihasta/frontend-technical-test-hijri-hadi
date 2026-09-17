import { createRootRoute } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { AppLayout } from '@/components/layout/app-layout'
import { QueryProvider } from '@/providers/query-provider'
import { RoleProvider } from '@/providers/role-provider'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <QueryProvider>
      <RoleProvider>
        <AppLayout />
        <Toaster position="top-right" richColors closeButton />
      </RoleProvider>
    </QueryProvider>
  )
}
