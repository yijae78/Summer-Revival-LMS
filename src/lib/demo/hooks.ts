/**
 * Helper to create a TanStack Query-like return value for demo mode.
 * Avoids firing real queries when Supabase is not connected.
 */
export function createDemoQueryResult<T>(data: T) {
  return {
    data,
    isLoading: false,
    isPending: false,
    isError: false,
    error: null,
    isSuccess: true,
    isFetching: false,
    refetch: () => Promise.resolve({ data, isLoading: false, isPending: false, isError: false, error: null, isSuccess: true, isFetching: false }),
  } as const
}
