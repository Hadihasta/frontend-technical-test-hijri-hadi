import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Home,
  Package,
  ShoppingCart,
} from 'lucide-react'

export const navIcons: Record<string, LucideIcon> = {
  dashboard: Home,
  requests: FileText,
  orders: ShoppingCart,
  inventory: Package,
}
