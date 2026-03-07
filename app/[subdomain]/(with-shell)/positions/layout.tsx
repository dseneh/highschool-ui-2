"use client";

import { useEffect } from "react";
import { usePathname, useParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";

export default function PositionsLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { setMainNavigation } = useNavigation();
  const pathname = usePathname();
  const params = useParams();

  useEffect(() => {
    // Reset to main navigation for positions page
    setMainNavigation();
  }, [setMainNavigation, pathname]);

  return <>{children}</>;
}
