import { ModalProps } from "@mantine/core";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

type Props = {
  onToggleHideForm: () => Promise<void>;
  isHidden: boolean;
} & ModalProps;

const ToggleHideFormModal = ({
  onToggleHideForm,
  isHidden,
  ...props
}: Props) => {
  return (
    <ConfirmModal {...props}>
      <ConfirmModal.Title>
        {isHidden ? "Unhide" : "Hide"} Form
      </ConfirmModal.Title>

      <ConfirmModal.Description>
        Are you sure you want to {isHidden ? "unhide" : "hide"} this form?
      </ConfirmModal.Description>

      <ConfirmModal.Footer>
        <ConfirmModal.CancelButton type="button" onClick={props.onClose}>
          Cancel
        </ConfirmModal.CancelButton>
        <ConfirmModal.ConfirmButton type="button" onClick={onToggleHideForm}>
          Comfirm
        </ConfirmModal.ConfirmButton>
      </ConfirmModal.Footer>
    </ConfirmModal>
  );
};

export default ToggleHideFormModal;
