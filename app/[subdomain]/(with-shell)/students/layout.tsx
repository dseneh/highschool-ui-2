"use client";

import { useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { setMainNavigation } = useNavigation();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    // Only reset to main navigation when on the students list page,
    // NOT when on a student detail page (which has its own layout)
    if (!params.id_number) {
      setMainNavigation();
    }
  }, [setMainNavigation, params.id_number, pathname]);

  return <>{children}</>;
}
