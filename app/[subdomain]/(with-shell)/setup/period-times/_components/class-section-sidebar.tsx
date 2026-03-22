import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { useState } from "react";
import { useQueryState } from "nuqs";
import { GradeLevelDto } from "@/lib/api2/grade-level-types";

type ClassSectionSidebarProps = {
  loading: boolean;
  selectedSectionId: string | null;
  filteredGradeLevels: GradeLevelDto[];
};
export default function ClassSectionSidebar({
  loading,
  selectedSectionId,
  filteredGradeLevels,
}: ClassSectionSidebarProps) {
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [, setGradeLevelId] = useQueryState("gradeLevel", { defaultValue: "" });
  const [, setSectionId] = useQueryState("section", { defaultValue: "" });

  return (
    <div className="flex gap-0 -mx-1" style={{ height: "calc(100vh - 160px)" }}>
      <div className="w-56 shrink-0 border-r flex flex-col">
        <div className="px-2 fpb-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Find class..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="space-y-2 pt-1 px-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg" />
              ))}
            </div>
          ) : filteredGradeLevels.length === 0 ? (
            <p className="text-xs text-muted-foreground px-2 pt-3">
              {sidebarSearch
                ? "No sections match your search."
                : "No grade levels found."}
            </p>
          ) : (
            <div className="fspace-y-4 pt-1">
              {filteredGradeLevels.map((gl) => (
                <div key={gl.id}>
                  {/* <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
                      {gl.name}
                    </p> */}
                  {gl.sections.length > 0 && (
                    <div className="fspace-y-0.5 border-b py-1.5">
                      {gl.sections.map((sec) => {
                        const isActive = sec.id === selectedSectionId;
                        return (
                          <button
                            key={sec.id}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground font-semibold"
                                : "hover:bg-muted text-foreground",
                            )}
                            onClick={() => {
                              setSectionId(sec.id);
                              setGradeLevelId(gl.id);
                            }}
                          >
                            {sec.section_class}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
