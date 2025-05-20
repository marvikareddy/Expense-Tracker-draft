import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
export function Toaster() {
  const {
    toasts
  } = useToast();
  return <ToastProvider>
      {toasts.map(function ({
      id,
      title,
      description,
      action,
      ...props
    }) {
      return <Toast key={id} className="bg-red-500">
            <div className="grid gap-1">
              {title && <ToastTitle className="rounded-none mx-[100px]">{title}</ToastTitle>}
              {description && <ToastDescription className="mx-[60px]">{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>;
    })}
      <ToastViewport />
    </ToastProvider>;
}