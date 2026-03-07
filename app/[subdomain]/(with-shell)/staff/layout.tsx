"use client";

import { useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { setMainNavigation } = useNavigation();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    // Only reset to main navigation when on the staff list page,
    // NOT when on a staff detail page (which has its own layout)
    if (!params.id_number) {
      setMainNavigation();
    }
  }, [setMainNavigation, params.id_number, pathname]);

  return <>{children}</>;
}
