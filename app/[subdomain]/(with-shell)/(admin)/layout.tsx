export default async function AdminRoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin routes are protected by role-based authorization in the DashboardShell
  // and individual page components. Users with superadmin/admin roles can access
  // these routes from any subdomain.
  
  return children;
}
