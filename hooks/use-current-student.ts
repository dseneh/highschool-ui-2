import { useAuth } from "@/components/portable-auth/src/client";
import { useStudents as useStudentsApi } from "@/lib/api2/student";

/**
 * Hook to fetch the current logged-in student's data.
 * Only works if the current user is a student account type.
 */
export function useCurrentStudent() {
  const { user: currentUser } = useAuth();
  const studentsApi = useStudentsApi();

  // Get the student's ID from their user account
  const studentId = currentUser?.id_number;
  
  // Only fetch if user is a student
  const isStudent = currentUser?.account_type?.toLowerCase() === "student";

  const { data: student, isLoading, error, refetch, isFetching } = studentsApi.getStudent(
    studentId || "",
    {
      enabled: !!studentId && isStudent,
    }
  );

  return {
    student,
    isLoading,
    error,
    refetch,
    isFetching,
    isStudent,
  };
}
