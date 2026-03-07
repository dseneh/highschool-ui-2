import { NextResponse } from "next/server";

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  status?: string;
}

interface StatsResponse {
  total_students?: number;
  total_staff?: number;
  academic_year?: string;
  total_enrolled?: number;
  pending_bills?: number;
  total_courses?: number;
  active_sections?: number;
  avg_attendance?: number;
}

interface FinanceData {
  month: string;
  collected: number;
  outstanding: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  const { subdomain } = await params;
  if (!subdomain) {
    return NextResponse.json({ error: "Invalid tenant" }, { status: 400 });
  }

  const headers = {
    "X-Tenant": subdomain,
    "Content-Type": "application/json",
  };

  try {
    // Fetch students for the recent activity list
    const studentsRes = await fetch(`${BACKEND_API}/api/v1/students/?limit=5`, {
      headers,
    }).catch(() => null);
    
    const students: Student[] = studentsRes?.ok
      ? (await studentsRes.json()).results || []
      : [];

    // Fetch summary stats (if available; fallback to mock data)
    const statsRes = await fetch(`${BACKEND_API}/api/v1/students/summary/`, {
      headers,
    }).catch(() => null);
    
    const statsData: StatsResponse = statsRes?.ok
      ? await statsRes.json()
      : {};

    // Calculate actual stats or use mock data
    const totalStudents = statsData.total_students || 1250;
    const totalStaff = statsData.total_staff || 85;
    const activeEnrollments = statsData.total_enrolled || 1180;
    const pendingBills = statsData.pending_bills || 145;

    return NextResponse.json({
      alert: {
        pendingLeaves: pendingBills,
        overtimeApprovals: 0, // Not applicable for schools
      },
      stats: [
        {
          title: "Total Students",
          value: totalStudents.toString(),
          subtitle: `${activeEnrollments} enrolled this year`,
          iconKey: "students",
        },
        {
          title: "Staff Members",
          value: totalStaff.toString(),
          subtitle: "Teachers & administrators",
          iconKey: "employees",
        },
        {
          title: "Pending Fee Bills",
          value: pendingBills.toString(),
          subtitle: "Amount outstanding from students",
          iconKey: "invoices",
        },
      ],
      chart: [
        { month: "Jan", moneyIn: 145000, moneyOut: 25000, moneyInChange: 8.5, moneyOutChange: -5.2 },
        { month: "Feb", moneyIn: 168000, moneyOut: 32000, moneyInChange: 12.3, moneyOutChange: 8.7 },
        { month: "Mar", moneyIn: 195000, moneyOut: 48000, moneyInChange: 5.0, moneyOutChange: 0.0 },
        { month: "Apr", moneyIn: 210000, moneyOut: 52000, moneyInChange: 15.2, moneyOutChange: 12.7 },
        { month: "May", moneyIn: 198000, moneyOut: 55000, moneyInChange: -5.4, moneyOutChange: -8.3 },
        { month: "Jun", moneyIn: 175000, moneyOut: 48000, moneyInChange: -10.2, moneyOutChange: -6.5 },
        { month: "Jul", moneyIn: 185000, moneyOut: 42000, moneyInChange: 0.0, moneyOutChange: 14.2 },
        { month: "Aug", moneyIn: 205000, moneyOut: 51000, moneyInChange: 11.8, moneyOutChange: 2.9 },
        { month: "Sep", moneyIn: 220000, moneyOut: 58000, moneyInChange: 0.0, moneyOutChange: -9.1 },
        { month: "Oct", moneyIn: 215000, moneyOut: 55000, moneyInChange: 0.0, moneyOutChange: 0.0 },
        { month: "Nov", moneyIn: 225000, moneyOut: 60000, moneyInChange: 0.0, moneyOutChange: 0.0 },
        { month: "Dec", moneyIn: 240000, moneyOut: 65000, moneyInChange: -7.5, moneyOutChange: -6.2 },
      ],
      employees: students.map((s) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`.trim(),
        email: s.email,
        department: "Student",
        position: "Active",
        status: s.status || "active",
        joinDate: new Date().toISOString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Return fallback data on error
    return NextResponse.json({
      alert: {
        pendingLeaves: 0,
        overtimeApprovals: 0,
      },
      stats: [
        {
          title: "Total Students",
          value: "1250",
          subtitle: "1180 enrolled this year",
          iconKey: "students",
        },
        {
          title: "Staff Members",
          value: "85",
          subtitle: "Teachers & administrators",
          iconKey: "employees",
        },
        {
          title: "Pending Fee Bills",
          value: "145",
          subtitle: "Amount outstanding from students",
          iconKey: "invoices",
        },
      ],
      chart: Array.from({ length: 12 }, (_, i) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
          month: months[i],
          moneyIn: 175000 + Math.random() * 75000,
          moneyOut: 45000 + Math.random() * 25000,
          moneyInChange: Math.random() * 20 - 10,
          moneyOutChange: Math.random() * 20 - 10,
        };
      }),
      employees: [],
    });
  }
}
