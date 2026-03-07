"use client"

import { useParams, redirect } from "next/navigation"

/**
 * Redirect /students/{id_number}/overview -> /students/{id_number}
 * The overview content lives at the index route.
 */
export default function StudentOverviewRedirect() {
  const params = useParams()
  const idNumber = params.id_number as string
  redirect(`/students/${idNumber}`)
}
