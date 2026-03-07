import PageLayout from "@/components/dashboard/page-layout";
import { SetupComingSoon } from "@/components/setup/setup-coming-soon";

export default function SemestersPage() {
  return (
    <PageLayout title="Semesters" description="Manage semester terms and timelines">
      <SetupComingSoon title="Semesters" />
    </PageLayout>
  );
}
