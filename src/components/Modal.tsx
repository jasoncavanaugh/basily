import * as RadixModal from "@radix-ui/react-dialog";
interface ModalProps {
  trigger: JSX.Element;
  open?: boolean;
  on_open_change?: () => void;
  className?: string;
  children?: React.ReactNode
}

export const Modal: React.FunctionComponent<ModalProps> = ({ trigger, open, on_open_change, className = "", children }) => {
  return (
    <RadixModal.Root onOpenChange={on_open_change} open={open}>
      <RadixModal.Trigger asChild>{trigger}</RadixModal.Trigger>
      <RadixModal.Portal>
        <RadixModal.Overlay className="modal-overlay bg-gray-500" />
        <RadixModal.Content
          className={`modal-open-animation fixed z-20 flex max-w-full rounded-lg bg-white drop-shadow-lg ${className}`}
        >
          {children}
        </RadixModal.Content>
      </RadixModal.Portal>
    </RadixModal.Root>
  );

};
export default Modal;
