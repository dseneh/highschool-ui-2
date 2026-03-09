"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useStudents as useStudentsApi } from "@/lib/api2/student"
import { useBillings } from "@/lib/api2/billing"
import { useTransactions } from "@/lib/api2/transaction"
import { useAccounts } from "@/lib/api2/bankAccount"
import { useAxiosAuth } from "@/hooks/use-axios-auth"
import { useTenantSubdomain } from "@/hooks/use-tenant-subdomain"
import { PageContent } from "@/components/dashboard/page-content"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateDescription,
} from "@/components/ui/empty-state"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Invoice01Icon,
  DollarCircleIcon,
  Coins01Icon,
  CreditCardIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Cancel01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { getStatusBadgeClass } from "@/lib/status-colors"
import type { CreateTransactionCommand, TransactionDto } from "@/lib/api2/finance-types"
import type { StudentConcessionDto } from "@/lib/api2/billing-types"
import { TuitionPaymentDialog } from "@/components/finance/tuition-payment-dialog"
import { TransactionActionButtons, TransactionDetailDialog } from "@/components/finance/transaction-detail-dialog"
import { toast } from "sonner"
import { getErrorMessage } from "@/lib/utils"
import { getQueryClient } from "@/lib/query-client"
import { PaymentPlan, type PaymentPlanItem } from "@/components/students/payment-plan"
import PageLayout from "@/components/dashboard/page-layout"
import { AddConcessionDialog } from "@/components/students/add-concession-dialog"
import { ConcessionsTab } from "@/components/students/concessions-tab"
import { AuthButton } from "@/components/auth/auth-button"
import { CircleCheck } from "lucide-react"

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function BillingSkeleton() {
  return (
    <PageContent>
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <Skeleton className="lg:col-span-3 h-96 rounded-xl" />
          <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
        </div>
      </div>
    </PageContent>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function StudentBillingPage() {
  const params = useParams()
  const idNumber = params.id_number as string
  const subdomain = useTenantSubdomain()
  const queryClient = getQueryClient()

  const { put, post } = useAxiosAuth()
  const studentsApi = useStudentsApi()
  const billingsApi = useBillings()
  const transactionsApi = useTransactions()
  
  const { data: student, isLoading: studentLoading } = studentsApi.getStudent(idNumber, {
    enabled: !!idNumber && window.location.href.includes("/students/"), // Only fetch if idNumber is present and URL contains "/students/"
  })

  const {
    data: billsResponse,
    isLoading: billsLoading,
    refetch: refetchBills,
    isFetching: isFetchingBills,
  } = studentsApi.getStudentBills(student?.id || "", {
    include_payment_plan: true,
    include_payment_status: true,
  }, {
    enabled: !!student?.id,
  })

  const {
    data: transactionsData,
    isLoading: transactionsLoading,
    refetch: refetchTransactions,
    isFetching: isFetchingTransactions,
  } = studentsApi.getStudentTransactions(student?.id || "", {
    enabled: !!student?.id,
  })
  // Transactions endpoint returns array directly, not paginated
  const transactions = Array.isArray(transactionsData) ? transactionsData : transactionsData?.results || []

  const academicYearId = student?.current_enrollment?.academic_year?.id
  const { data: concessionsResponse } = billingsApi.getStudentConcessions(academicYearId || "", {}, {
    enabled: !!academicYearId,
  })
  
  // Finance data for payment dialog
  const { data: transactionTypesData } = transactionsApi.getTransactionTypes()
  const transactionTypes = (Array.isArray(transactionTypesData) ? transactionTypesData : transactionTypesData?.results) || []
  const { data: paymentMethodsData } = transactionsApi.getPaymentMethods()
  const paymentMethods = (Array.isArray(paymentMethodsData) ? paymentMethodsData : paymentMethodsData?.results) || []
  const { data: bankAccountsData } = useAccounts().getAccounts()
  const bankAccounts = (Array.isArray(bankAccountsData) ? bankAccountsData : bankAccountsData?.results) || []
  
  // Transaction mutation
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false)
  const [isCreatingConcession, setIsCreatingConcession] = useState(false)

  const [showAllBills, setShowAllBills] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showConcessionDialog, setShowConcessionDialog] = useState(false)
  const [editingConcession, setEditingConcession] = useState<StudentConcessionDto | null>(null)
  const [selectedInstallment, setSelectedInstallment] = useState<PaymentPlanItem | null>(null)
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionDto | null>(null)

  const loading = studentLoading || billsLoading || transactionsLoading 
  const fetching = isFetchingBills || isFetchingTransactions

  if (loading) return <BillingSkeleton />
  // Billing data
  const billItems = billsResponse?.bill ?? []
  const apiSummary = billsResponse?.summary
  const billing = student?.current_enrollment?.billing_summary
  const currency = billing?.currency || "$"
  const totalBill = apiSummary?.total_bill ?? billing?.total_bill ?? 0
  const grossTotalBill = apiSummary?.gross_total_bill ?? billing?.gross_total_bill ?? totalBill
  const totalConcession = apiSummary?.total_concession ?? billing?.total_concession ?? 0
  const netTotalBill =
    apiSummary?.net_total_bill ??
    billing?.net_total_bill ??
    Math.max(0, grossTotalBill - totalConcession)
  // Prefer concessions from bill summary; fallback to concessions endpoint (array or paginated)
  const concessionItems =
    apiSummary?.concessions ??
    (Array.isArray(concessionsResponse) ? concessionsResponse : concessionsResponse?.results) ??
    []
  const paid = apiSummary?.paid ?? billing?.paid ?? 0
  const balance = apiSummary?.balance ?? billing?.balance ?? 0
  const tuition = apiSummary?.tuition ?? billing?.tuition ?? 0
  // Prioritize fresh data from bills API over cached student data
  const paymentStatus = apiSummary?.payment_status ?? billing?.payment_status
  const paymentPlan = apiSummary?.payment_plan ?? billing?.payment_plan
  
  // Separate tuition and fee items
  const tuitionItems = billItems.filter((b: any) => ["tuition", "Tuition Fee", "Tuition"].includes(b.type))
  const feeItems = billItems.filter((b: any) => !["tuition", "Tuition Fee", "Tuition"].includes(b.type))

  // Sort transactions newest first
  const sortedTransactions = [...(transactions ?? [])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  // Handle refresh
  const handleRefresh = () => {
    void refetchBills()
    void refetchTransactions()
    void queryClient.invalidateQueries({ queryKey: ["students", subdomain, student?.id] })
    // toast.info("Refreshing billing data...")
  }

  // Handle payment submission
  const handlePaymentSubmit = async (payload: CreateTransactionCommand) => {
    try {
      setIsCreatingTransaction(true)
      await post("/transactions/", payload)
      setShowPaymentDialog(false)

      // Invalidate all related student billing caches so summary/payment plan/payment status
      // are recalculated from backend immediately after posting a payment.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["students", student?.id, "bills"] }),
        queryClient.invalidateQueries({ queryKey: ["students", student?.id, "transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["students", student?.id] }),
        queryClient.invalidateQueries({ queryKey: ["students", subdomain, student?.id] }),
        queryClient.invalidateQueries({ queryKey: ["concessions", "academicYear", academicYearId] }),
      ])

      toast.success("Payment recorded successfully")
      void refetchBills()
      void refetchTransactions()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsCreatingTransaction(false)
    }
  }

  const handleConcessionSubmit = async (payload: {
    concession_type: "percentage" | "flat"
    target: "entire_bill" | "tuition" | "other_fees"
    value: number
    notes?: string
    active?: boolean
    student: string
  }) => {
    try {
      if (!academicYearId) {
        toast.error("Academic year not found")
        return
      }
      
      setIsCreatingConcession(true)
      
      if (editingConcession) {
        await put(`/concessions/${editingConcession.id}/`, {
          concession_type: payload.concession_type,
          target: payload.target,
          value: payload.value,
          notes: payload.notes,
          active: payload.active,
        })
        toast.success("Concession updated successfully")
      } else {
        await post(`/concessions/academic-years/${academicYearId}/`, {
          concession_type: payload.concession_type,
          target: payload.target,
          value: payload.value,
          notes: payload.notes,
          active: payload.active,
          student: student?.id,
        })
        toast.success("Concession applied successfully")
      }
      setShowConcessionDialog(false)
      setEditingConcession(null)
      void refetchBills()
      void queryClient.invalidateQueries({ queryKey: ["concessions"] })
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setIsCreatingConcession(false)
    }
  }

  // Convert installment to transaction for display
  const createInstallmentTransaction = (item: PaymentPlanItem): TransactionDto => {
    return {
      id: item.id,
      transaction_id: item.id,
      student: student.id,
      amount: item.amount,
      date: item.payment_date,
      status: item.cumulative_balance <= 0 ? "approved" : "pending",
      type: "payment-plan",
      transaction_type: {
        id: "payment-plan",
        name: "Payment Plan Installment",
      },
      payment_method: null,
      currency: { symbol: currency },
      reference: `INSTALL-${item.id}`,
      description: `Payment plan installment`,
      notes: `Installment due on ${new Date(item.payment_date).toLocaleDateString()}. Amount: ${currency}${item.amount.toLocaleString()}, Paid: ${currency}${item.amount_paid.toLocaleString()}, Balance: ${currency}${item.balance.toLocaleString()}`,
      created_at: item.payment_date,
      updated_at: item.payment_date,
      created_by: student.id,
      approved_by: item.cumulative_balance <= 0 ? student.id : null,
      approved_at: item.cumulative_balance <= 0 ? item.payment_date : null,
    } as unknown as TransactionDto
  }

  // Handle installment click
  const handleInstallmentClick = (item: PaymentPlanItem) => {
    setSelectedInstallment(item)
  }

  // Handle transaction edit
  const handleTransactionEdit = () => {
    toast.info("Edit functionality coming soon")
  }

  const handleTransactionActionSuccess = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["students", student?.id, "bills"] }),
      queryClient.invalidateQueries({ queryKey: ["students", student?.id, "transactions"] }),
      queryClient.invalidateQueries({ queryKey: ["students", student?.id] }),
      queryClient.invalidateQueries({ queryKey: ["students", subdomain, student?.id] }),
    ])

    void refetchBills()
    void refetchTransactions()
  }

  const disableButtons = !student?.is_enrolled || !balance || balance <= 0 || loading || fetching

  return (
    <PageLayout
    title="Billing & Payments" 
    description="Financial overview and payment history"
    actions={
      <>
      <AuthButton
            roles={["finance", "registrar", "accountant"]}
            variant="default"
            size="sm"
            onClick={() => setShowPaymentDialog(true)}
            disabled={disableButtons}
            icon={<HugeiconsIcon icon={Coins01Icon} className="size-4" />}
          >
            <span className="hidden sm:inline">Make Payment</span>
          </AuthButton>
          <AuthButton
            roles={["finance", "registrar", "accountant"]}
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingConcession(null)
              setShowConcessionDialog(true)
            }}
            disabled={disableButtons}
          >
            <span className="hidden sm:inline">Add Concession</span>
            <span className="sm:hidden">Concession</span>
          </AuthButton>
          {/* <Button
            variant="outline"
            size="icon-sm"
            onClick={handleRefresh}
            icon={<HugeiconsIcon icon={RefreshIcon} className="size-4" />}
            loading={loading || fetching}
            title="Refresh billing data"
          /> */}
      </>
    }
    loading={loading}
    fetching={fetching}
    refreshAction={handleRefresh}
    skeleton={<BillingSkeleton />}
    emptyState={!student}
    globalChildren={
      <>
      <TuitionPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        transactionTypes={transactionTypes ?? []}
        paymentMethods={paymentMethods ?? []}
        bankAccounts={bankAccounts ?? []}
        onSubmit={handlePaymentSubmit}
        submitting={isCreatingTransaction}
        student={student}
        skipSearch={true}
      />

      <AddConcessionDialog
        open={showConcessionDialog}
        onOpenChange={(open) => {
          setShowConcessionDialog(open)
          if (!open) {
            setEditingConcession(null)
          }
        }}
        onSubmit={handleConcessionSubmit}
        submitting={isCreatingConcession}
        student={student}
        skipSearch={true}
        mode={editingConcession ? "edit" : "create"}
        initialValue={editingConcession}
        studentBalance={balance}
        totalBill={totalBill}
        currencySymbol={currency}
      />

      {/* Installment Detail Dialog */}
      <TransactionDetailDialog
        open={selectedInstallment !== null || selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedInstallment(null)
            setSelectedTransaction(null)
          }
        }}
        transaction={selectedInstallment ? createInstallmentTransaction(selectedInstallment) : selectedTransaction}
        currency={currency}
        onEdit={handleTransactionEdit}
      />
      </>
    }
    >
      <div className="space-y-4">
        {/* Success Alert for Paid in Full */}
        {paymentStatus?.is_paid_in_full && (
          <div className="p-3 rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
            <CircleCheck className="size-5 text-emerald-600 dark:text-emerald-400" />
            <div className="text-emerald-800 dark:text-emerald-200 font-medium text-sm">
              Payment Complete! All fees have been paid in full.
            </div>
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Gross Total Bill */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <HugeiconsIcon icon={Invoice01Icon} className="size-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Gross Total</p>
                <p className="text-lg font-bold truncate">{currency}{grossTotalBill.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Concession */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <HugeiconsIcon icon={ArrowDown01Icon} className="size-5 text-purple-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Concession</p>
                <p className="text-lg font-bold text-purple-600 truncate">
                  {currency}{totalConcession.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Net Bill */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-lg bg-green-500/10 flex items-center justify-center">
                <HugeiconsIcon icon={Wallet01Icon} className="size-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Net Bill</p>
                <p className="text-lg font-bold text-green-600 truncate">{currency}{netTotalBill.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Total Paid */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="size-10 shrink-0 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-5 text-emerald-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Total Paid</p>
                <p className="text-lg font-bold text-emerald-600 truncate">{currency}{paid.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          {/* Balance Due */}
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "size-10 shrink-0 rounded-lg flex items-center justify-center",
                balance > 0 ? "bg-red-500/10" : "bg-green-500/10"
              )}>
                <HugeiconsIcon
                  icon={DollarCircleIcon}
                  className={cn("size-5", balance > 0 ? "text-red-600" : "text-green-600")}
                />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-medium">Balance Due</p>
                <p className={cn("text-lg font-bold truncate", balance > 0 ? "text-red-600" : "text-green-600")}>
                  {currency}{balance.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {paymentPlan && paymentPlan.length > 0 && (
          <PaymentPlan 
            key={`payment-plan-${paymentPlan.length}-${JSON.stringify(paymentPlan[paymentPlan.length - 1]).substring(0, 50)}`}
            paymentPlan={paymentPlan as PaymentPlanItem[]} 
            onInstallmentClick={handleInstallmentClick}
          />
        )}

        <Tabs defaultValue="overview">
          <TabsList className="">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="payments">Payment History</TabsTrigger>
            <TabsTrigger value="concessions">Concessions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="p-0 gap-1">
              <div className="p-4 fpb-2 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Fee Breakdown</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {billItems.length} item{billItems.length !== 1 && "s"} · Tuition: {currency}{tuition.toLocaleString()}
                  </p>
                </div>
              </div>
              <CardContent className="p-4 pt-0 space-y-0">
                {billsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                ) : billItems.length > 0 ? (
                  <div className="space-y-1">
                    {tuitionItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                          Tuition
                        </p>
                        {tuitionItems.map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="size-8 rounded-md bg-blue-500/10 flex items-center justify-center shrink-0">
                                <HugeiconsIcon icon={Invoice01Icon} className="size-4 text-blue-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                {item.enrollment?.academic_year && (
                                  <p className="text-[11px] text-muted-foreground">{item.enrollment.academic_year}</p>
                                )}
                              </div>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {currency}{item.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {feeItems.length > 0 && (
                      <div className="mb-3">
                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
                          Fees & Charges
                        </p>
                        {(showAllBills ? feeItems : feeItems.slice(0, 5)).map((item: any) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="size-8 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
                                <HugeiconsIcon icon={Coins01Icon} className="size-4 text-amber-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{item.name}</p>
                                <p className="text-[11px] text-muted-foreground capitalize">{item.type}</p>
                              </div>
                            </div>
                            <span className="text-sm font-semibold tabular-nums">
                              {currency}{item.amount.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {feeItems.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs text-muted-foreground"
                        icon={<HugeiconsIcon icon={showAllBills ? ArrowUp01Icon : ArrowDown01Icon} className="size-3.5" />}
                        onClick={() => setShowAllBills(!showAllBills)}
                      >
                        {showAllBills ? "Show Less" : `Show ${feeItems.length - 5} More`}
                      </Button>
                    )}

                    {/* Total */}
                    <div className="flex items-center justify-between pt-3 mt-2 border-t px-3">
                      <span className="text-sm font-semibold">Gross Total</span>
                      <span className="text-sm font-bold">{currency}{totalBill.toLocaleString()}</span>
                    </div>

                    {totalConcession > 0 && (
                      <>
                        <div className="flex items-center justify-between pt-2 px-3 text-purple-600">
                          <span className="text-sm font-medium">Concession</span>
                          <span className="text-sm font-semibold">-{currency}{totalConcession.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between pt-2 mt-1 border-t px-3">
                          <span className="text-sm font-semibold">Net Total</span>
                          <span className="text-sm font-bold">{currency}{netTotalBill.toLocaleString()}</span>
                        </div>
                      </>
                    )}

                    {concessionItems.length > 0 && (
                      <div className="mt-3 border-t py-2 px-3 border border-dashed border-muted-foreground/20 rounded-xl bg-accent/10">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Applied Concessions
                        </p>
                        <div className="space-y-1.5">
                          {concessionItems.map((item: StudentConcessionDto) => (
                            <div key={item.id} className="flex items-center justify-between gap-2 ftext-xs">
                              <div className="min-w-0">
                                <span className="capitalize text-muted-foreground">
                                  {String(item.target).replace("_", " ")} · {item.concession_type === "percentage" ? `${item.value}%` : `${currency}${Number(item.value).toLocaleString()}`}
                                </span>
                                {item.notes && (
                                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{item.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="font-semibold text-purple-600">-{currency}{Number(item.amount).toLocaleString()}</span>
                                {/* <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => {
                                    setEditingConcession(item)
                                    setShowConcessionDialog(true)
                                  }}
                                  disabled={isCreatingConcession}
                                >
                                  Edit
                                </Button> */}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <EmptyState className="h-48 border-none p-4">
                    <EmptyStateIcon>
                      <HugeiconsIcon icon={Invoice01Icon} />
                    </EmptyStateIcon>
                    <EmptyStateTitle className="text-sm font-medium">No fee items</EmptyStateTitle>
                    <EmptyStateDescription className="text-xs">
                      Bill items will appear here once assigned.
                    </EmptyStateDescription>
                  </EmptyState>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            {transactionsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="h-32 animate-pulse" />
                ))}
              </div>
            ) : sortedTransactions.length > 0 ? (
              <div className="space-y-4">
                {sortedTransactions.map((tx) => (
                  <TransactionCard 
                    key={tx.id} 
                    tx={tx as TransactionDto} 
                    currency={tx.currency?.symbol || currency}
                    onClick={setSelectedTransaction}
                    onEdit={handleTransactionEdit}
                    onActionSuccess={handleTransactionActionSuccess}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6">
                  <EmptyState className="h-48 border-none p-0">
                    <EmptyStateIcon>
                      <HugeiconsIcon icon={CreditCardIcon} />
                    </EmptyStateIcon>
                    <EmptyStateTitle className="text-sm font-medium">No payments yet</EmptyStateTitle>
                    <EmptyStateDescription className="text-xs">
                      Payments will show up here once recorded.
                    </EmptyStateDescription>
                  </EmptyState>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="concessions">
            <ConcessionsTab
              concessions={concessionItems}
              loading={false}
              currencySymbol={currency}
              onEdit={(concession) => {
                setEditingConcession(concession)
                setShowConcessionDialog(true)
              }}
              onDeleteSuccess={() => {
                void refetchBills()
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
      
    </PageLayout>
  )
}

/* ------------------------------------------------------------------ */
/*  Transaction Card                                                   */
/* ------------------------------------------------------------------ */

function TransactionCard({
  tx,
  currency,
  onClick,
  onEdit,
  onActionSuccess,
}: {
  tx: TransactionDto
  currency: string
  onClick?: (tx: TransactionDto) => void
  onEdit?: (tx: TransactionDto) => void
  onActionSuccess?: () => void
}) {
  const dateLabel = new Date(tx.date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })

  const statusConfig = {
    approved: {
      icon: CheckmarkCircle02Icon,
      bgColor: "bg-green-500/10",
      iconColor: "text-green-600",
      label: "Approved",
    },
    pending: {
      icon: Clock01Icon,
      bgColor: "bg-yellow-500/10",
      iconColor: "text-yellow-600",
      label: "Pending",
    },
    rejected: {
      icon: Cancel01Icon,
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600",
      label: "Rejected",
    },
    canceled: {
      icon: Cancel01Icon,
      bgColor: "bg-red-500/10",
      iconColor: "text-red-600",
      label: "Canceled",
    },
  }[tx.status] || {
    icon: Clock01Icon,
    bgColor: "bg-muted/10",
    iconColor: "text-muted-foreground",
    label: tx.status,
  }

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick?.(tx)}
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn("size-10 shrink-0 rounded-lg flex items-center justify-center", statusConfig.bgColor)}>
              <HugeiconsIcon icon={statusConfig.icon} className={cn("size-5", statusConfig.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base mb-1">
                {tx.transaction_type?.name || "Payment"}
              </h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span>{dateLabel}</span>
                {tx.payment_method?.name && (
                  <>
                    <span>•</span>
                    <span>{tx.payment_method.name}</span>
                  </>
                )}
                {tx.reference && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-xs">{tx.reference}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-left sm:text-right shrink-0">
            <Badge className={cn("mb-2", getStatusBadgeClass(tx.status))}>
              {statusConfig.label}
            </Badge>
            <p className="text-2xl font-bold text-green-600">
              {currency}{tx.amount.toLocaleString()}
            </p>
          </div>
        </div>

        <div
          className="mt-4 pt-3 border-t flex items-center justify-start sm:justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          <TransactionActionButtons
            tx={tx}
            compact={false}
            className="w-full sm:w-auto"
            onEdit={onEdit}
            onActionSuccess={onActionSuccess}
          />
        </div>
      </div>
    </Card>
  )
}
