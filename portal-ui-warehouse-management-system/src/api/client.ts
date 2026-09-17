export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

let simulateError = false

export function setSimulateError(enabled: boolean) {
  simulateError = enabled
}

export function getSimulateError() {
  return simulateError
}

export async function apiRequest<T>(handler: () => T): Promise<T> {
  const delay = 300 + Math.floor(Math.random() * 500)
  await new Promise((resolve) => setTimeout(resolve, delay))

  if (simulateError) {
    throw new ApiError('Simulated network failure. Toggle off dev error mode to retry.', 503)
  }

  try {
    return handler()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(error instanceof Error ? error.message : 'Unexpected error')
  }
}
