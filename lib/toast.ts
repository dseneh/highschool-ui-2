import { toast, type ExternalToast } from "sonner"

/* ------------------------------------------------------------------ */
/*  Styled toast helper                                                */
/*                                                                     */
/*  Usage:                                                             */
/*    showToast.success("Student updated", "Changes saved")            */
/*    showToast.error("Update failed", getErrorMessage(err))           */
/*    showToast.warning("Re-enrollment", "This will reset data")       */
/*    showToast.info("Refreshing…", "Please wait")                     */
/* ------------------------------------------------------------------ */

type ToastType = "success" | "error" | "warning" | "info"

const typeStyles: Record<ToastType, { classNames: { description: string } }> = {
  success: {
    classNames: {
      description: "!text-green-600 dark:!text-green-400",
    },
  },
  error: {
    classNames: {
      description: "!text-red-600 dark:!text-red-400",
    },
  },
  warning: {
    classNames: {
      description: "!text-orange-600 dark:!text-orange-400",
    },
  },
  info: {
    classNames: {
      description: "!text-blue-600 dark:!text-blue-400",
    },
  },
}

function createToast(
  type: ToastType,
  title: string,
  description?: string,
  options?: ExternalToast
) {
  const style = typeStyles[type]

  return toast[type](title, {
    description,
    classNames: description ? style.classNames : undefined,
    ...options,
  })
}

export const showToast = {
  success: (title: string, description?: string, options?: ExternalToast) =>
    createToast("success", title, description, options),

  error: (title: string, description?: string, options?: ExternalToast) =>
    createToast("error", title, description, options),

  warning: (title: string, description?: string, options?: ExternalToast) =>
    createToast("warning", title, description, options),

  info: (title: string, description?: string, options?: ExternalToast) =>
    createToast("info", title, description, options),
}
