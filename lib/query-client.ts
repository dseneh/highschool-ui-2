import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from "@tanstack/react-query"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30_000, // 30 seconds
        gcTime: 1000 * 60 * 5, // 5 minutes garbage collection
      },
      mutations: {
        retry: 1,
      },
      dehydrate: {
        // Include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

/**
 * Returns a singleton QueryClient on the browser and a fresh one on the server.
 * Import this wherever you need the query client outside of React context
 * (e.g. server components, route handlers, prefetching).
 */
export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  }
  // Browser: reuse single instance to avoid re-creating on re-renders
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}
