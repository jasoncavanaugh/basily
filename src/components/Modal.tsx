import * as RadixModal from "@radix-ui/react-dialog";
import { cn } from "src/utils/cn";
interface ModalProps {
  trigger: React.ReactNode;
  open?: { is_open: boolean, on_open_change: () => void };
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  className?: string;
  children?: React.ReactNode;
}

export const Modal: React.FunctionComponent<ModalProps> = ({
  trigger,
  open,
  onEscapeKeyDown
  className = "",
  children,
}) => {
  let radix_props = {}
  if (open) {
    radix_props = { onOpenChange: on_open_change, open: is_open };
  }
  if (onEscapeKeyDown) {
  }

  const openProps = open ? { onOpenChange: on_open_change, open: is_open } : {};
  return (
    <RadixModal.Root {...openProps}>
      <RadixModal.Trigger asChild>{trigger}</RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay
          className={cn(
            "bg-background/80 fixed inset-0 z-20 bg-gray-500 opacity-30 dark:opacity-50",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0"
          )}
        />
        <RadixModal.Content
          className={cn(
            "z-20 shadow-lg duration-500",
            "data-[state=open]:animate-in",
            "data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0",
            "data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95",
            "data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%]",
            "data-[state=open]:slide-in-from-left-1/2",
            "data-[state=open]:slide-in-from-top-[48%]",
            className
          )}
          //className={`modal-open-animation fixed z-20 flex max-w-full rounded-lg drop-shadow-lg ${className}`}
        >
          {children}
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );
};
export default Modal;
