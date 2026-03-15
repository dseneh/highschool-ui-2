import { Card, CardContent } from "@/components/ui/card";
import { GradeLevelSelect, SectionSelect } from "@/components/shared/data-reusable";

type SectionSelectorCardProps = {
  effectiveGradeLevelId: string;
  effectiveSectionId: string;
  onGradeLevelChange: (value: string) => void;
  onSectionChange: (value: string) => void;
};

export function SectionSelectorCard({
  effectiveGradeLevelId,
  effectiveSectionId,
  onGradeLevelChange,
  onSectionChange,
}: SectionSelectorCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="min-w-45 flex-1 space-y-1.5">
            <GradeLevelSelect
              noTitle
              useUrlState={false}
              searchable
              value={effectiveGradeLevelId}
              onChange={onGradeLevelChange}
              placeholder="Select grade level"
            />
          </div>
          <div className="min-w-45 flex-1 space-y-1.5">
            <SectionSelect
              noTitle
              useUrlState={false}
              searchable
              value={effectiveSectionId}
              onChange={onSectionChange}
              gradeLevelId={effectiveGradeLevelId}
              disabled={!effectiveGradeLevelId}
              placeholder="Select section"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
