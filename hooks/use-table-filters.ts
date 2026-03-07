// Hook for managing table filter state with URL sync using nuqs
"use client"

import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { useMemo } from "react"

interface UseTableFiltersOptions {
  /**
   * Default filter values
   */
  defaults?: Record<string, string | string[]>
}

export function useTableFilters(options: UseTableFiltersOptions = {}) {
  const { defaults = {} } = options

  // Define parsers for each filter type
  const filterParsers = useMemo(() => {
    const parsers: Record<string, any> = {}
    
    Object.entries(defaults).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // For array values (checkboxes), use parseAsArrayOf
        parsers[key] = parseAsArrayOf(parseAsString).withDefault(value)
      } else {
        // For single values (select), use parseAsString
        parsers[key] = parseAsString.withDefault(value as string)
      }
    })
    
    return parsers
  }, [defaults])

  const [filters, setFilters] = useQueryStates(filterParsers, {
    history: "push",
    shallow: true,
  })

  return {
    filters,
    setFilters,
    setFilter: (key: string, value: string | string[] | null) => {
      setFilters({ [key]: value })
    },
    clearFilters: () => {
      const clearedFilters: Record<string, null> = {}
      Object.keys(filters).forEach(key => {
        clearedFilters[key] = null
      })
      setFilters(clearedFilters)
    },
  }
}
