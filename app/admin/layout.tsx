import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - EzySchool",
  description: "Superadmin control panel for tenant management",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
