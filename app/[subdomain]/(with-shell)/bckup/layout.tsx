"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useNavigation } from "@/contexts/navigation-context";

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { setMainNavigation } = useNavigation();
  const params = useParams();

  useEffect(() => {
    if (!params.id_number) {
      setMainNavigation();
    }
  }, [params.id_number, setMainNavigation]);

  return <>{children}</>;
}

