import '@testing-library/jest-dom/vitest'
import { resetStore } from '@/mock/store'

beforeEach(() => {
  localStorage.clear()
  resetStore()
})
