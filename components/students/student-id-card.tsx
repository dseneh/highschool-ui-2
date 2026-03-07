"use client"

import * as React from "react"
import { DialogBox } from "@/components/ui/dialog-box"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { PrinterIcon } from "@hugeicons/core-free-icons"
import { getStatusBadgeClass } from "@/lib/status-colors"
import type { StudentDto } from "@/lib/api2/student-types"

interface StudentIdCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentDto
  schoolName?: string
}

export function StudentIdCardDialog({
  open,
  onOpenChange,
  student,
  schoolName = "EzySchool",
}: StudentIdCardDialogProps) {
  const cardRef = React.useRef<HTMLDivElement>(null)

  const initials = [student.first_name, student.last_name]
    .filter(Boolean)
    .map((n) => n[0])
    .join("")

  const handlePrint = () => {
    if (!cardRef.current) return

    const printWindow = window.open("", "_blank", "width=450,height=340")
    if (!printWindow) return

    const cardHTML = cardRef.current.innerHTML

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student ID - ${student.full_name}</title>
          <style>
            @page { margin: 0; size: 3.375in 2.125in; }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif; }
            .card {
              width: 3.375in;
              height: 2.125in;
              border: 1px solid #e5e7eb;
              border-radius: 12px;
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .card-header {
              background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
              color: white;
              padding: 8px 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .school-name { font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; }
            .card-type { font-size: 8px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
            .card-body { flex: 1; padding: 10px 14px; display: flex; gap: 12px; }
            .photo {
              width: 60px; height: 72px;
              border-radius: 6px;
              background: #f3f4f6;
              display: flex; align-items: center; justify-content: center;
              font-size: 20px; font-weight: 700; color: #6b7280;
              overflow: hidden; flex-shrink: 0;
              border: 1px solid #e5e7eb;
            }
            .photo img { width: 100%; height: 100%; object-fit: cover; }
            .info { flex: 1; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
            .student-name { font-size: 13px; font-weight: 700; color: #111827; }
            .field { font-size: 9px; color: #6b7280; }
            .field-value { color: #374151; font-weight: 500; }
            .card-footer {
              border-top: 1px solid #e5e7eb;
              padding: 5px 14px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              background: #f9fafb;
            }
            .id-number { font-family: monospace; font-size: 11px; font-weight: 700; color: #1e3a5f; }
            .status { font-size: 8px; padding: 2px 6px; border-radius: 4px; font-weight: 600; text-transform: uppercase; }
            .status-active { background: #dcfce7; color: #166534; }
            .status-inactive { background: #fef3c7; color: #92400e; }
            @media print {
              body { min-height: auto; }
            }
          </style>
        </head>
        <body>
          ${cardHTML}
          <script>window.onload = function() { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const statusActive =
    student.status?.toLowerCase() === "active" ||
    student.status?.toLowerCase() === "enrolled"

  return (
    <DialogBox
      open={open}
      onOpenChange={onOpenChange}
      className="sm:max-w-md"
      title="Student ID Card"
      description="Preview and print the student ID card."
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handlePrint} icon={<HugeiconsIcon icon={PrinterIcon} />}>
            Print
          </Button>
        </div>
      }
    >
      <div className="flex justify-center py-4">
        {/* Card preview */}
        <div ref={cardRef}>
          <div className="card" style={{ width: "3.375in", border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", fontFamily: "system-ui, -apple-system, sans-serif" }}>
            {/* Header */}
            <div className="card-header" style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)", color: "white", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span className="school-name" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" as const }}>
                {schoolName}
              </span>
              <span className="card-type" style={{ fontSize: 8, textTransform: "uppercase" as const, letterSpacing: 1, opacity: 0.8 }}>
                Student ID
              </span>
            </div>

            {/* Body */}
            <div className="card-body" style={{ flex: 1, padding: "10px 14px", display: "flex", gap: 12 }}>
              {/* Photo */}
              <div className="photo" style={{ width: 60, height: 72, borderRadius: 6, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#6b7280", overflow: "hidden", flexShrink: 0, border: "1px solid #e5e7eb" }}>
                {student.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={student.photo} alt={student.full_name} style={{ width: "100%", height: "100%", objectFit: "cover" as const }} />
                ) : (
                  initials
                )}
              </div>

              {/* Info */}
              <div className="info" style={{ flex: 1, display: "flex", flexDirection: "column" as const, justifyContent: "center", gap: 2 }}>
                <div className="student-name" style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                  {student.full_name}
                </div>
                {student.current_grade_level && (
                  <div className="field" style={{ fontSize: 9, color: "#6b7280" }}>
                    Grade: <span className="field-value" style={{ color: "#374151", fontWeight: 500 }}>{student.current_grade_level.name}</span>
                  </div>
                )}
                {student.current_enrollment?.section && (
                  <div className="field" style={{ fontSize: 9, color: "#6b7280" }}>
                    Section: <span className="field-value" style={{ color: "#374151", fontWeight: 500 }}>{student.current_enrollment.section.name}</span>
                  </div>
                )}
                {student.date_of_birth && (
                  <div className="field" style={{ fontSize: 9, color: "#6b7280" }}>
                    DOB: <span className="field-value" style={{ color: "#374151", fontWeight: 500 }}>
                      {new Date(student.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="card-footer" style={{ borderTop: "1px solid #e5e7eb", padding: "5px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9fafb" }}>
              <span className="id-number" style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: "#1e3a5f" }}>
                {student.id_number}
              </span>
              <span
                className={`status ${statusActive ? "status-active" : "status-inactive"}`}
                style={{
                  fontSize: 8,
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontWeight: 600,
                  textTransform: "uppercase" as const,
                  background: statusActive ? "#dcfce7" : "#fef3c7",
                  color: statusActive ? "#166534" : "#92400e",
                }}
              >
                {student.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* On-screen preview badge */}
      <div className="flex justify-center">
        <Badge variant="secondary" className={getStatusBadgeClass(student.status)}>
          {student.status}
        </Badge>
      </div>
    </DialogBox>
  )
}
