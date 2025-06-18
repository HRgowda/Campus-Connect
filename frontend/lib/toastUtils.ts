import { toast } from "sonner"

export const showSuccessToast = (message: string) => {
  toast(message, {
    style: {
      backgroundColor: "#14532D",
      color: "#fff",
      border: "1px solid #4ADE80",
    },
  })
}

export const showErrorToast = (message: string) => {
  toast(message, {
    style: {
      backgroundColor: "#7F1D1D",
      color: "#fff",
      border: "1px solid #F87171",
    },
  })
}

export const showInfoToast = (message: string) => {
  toast(message, {
    style: {
      backgroundColor: "#1E3A8A",
      color: "#fff",
      border: "1px solid #60A5FA",
    },
  })
}
