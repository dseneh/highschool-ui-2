import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function GradesSkeleton() {
  return (
    <PageContent>
      <div className="space-y-4">
        {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-44" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div> */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((card) => (
            <Card key={card} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2.5">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="size-12 rounded-full" />
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {[0, 1].map((chart) => (
            <Card key={chart} className="flex-1 p-5">
              <div className="space-y-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-44" />
                </div>
                <div className="flex items-end gap-8">
                  {[0, 1, 2, 3, 4].map((bar) => (
                    <div key={bar} className="flex flex-col items-center gap-2">
                      <Skeleton
                        className="w-4 rounded-sm"
                        style={{ height: `${20 + ((bar + chart) % 4) * 8}px` }}
                      />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="pb-0 overflow-hidden gap-0 space-y-0">
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-6 w-36 rounded-full" />
          </CardHeader>
          <CardContent className="p-0!">
            <div className="overflow-x-auto h-auto">
              <table className="w-full border-collapse text-sm [&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0 [&_th:last-child]:border-r-0 [&_td:last-child]:border-r-0 [&_thead_th]:border-t-0 [&_tfoot_td]:border-b-0 [&_tbody_tr:last-child_td]:border-b-0">
                <thead>
                  <tr className="bg-muted/60">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <th
                        key={`header-${idx}`}
                        className="border border-border px-3 py-3 text-left"
                      >
                        <Skeleton className="h-4 w-16" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, rowIdx) => (
                    <tr
                      key={`row-${rowIdx}`}
                      className={rowIdx % 2 === 0 ? "bg-background" : "bg-muted/30"}
                    >
                      {Array.from({ length: 7 }).map((__, cellIdx) => (
                        <td
                          key={`cell-${rowIdx}-${cellIdx}`}
                          className="border border-border px-3 py-3"
                        >
                          <Skeleton
                            className={cellIdx === 1 ? "h-4 w-40" : "h-4 w-16"}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/60">
                    <td className="border border-border px-3 py-3" colSpan={2}>
                      <Skeleton className="h-4 w-20" />
                    </td>
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <td key={`footer-${idx}`} className="border border-border px-3 py-3">
                        <Skeleton className="h-4 w-12 mx-auto" />
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContent>
  )
}
