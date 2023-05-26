import { ModalProps } from "@mantine/core";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

type Props = {
  onDeleteForm: () => Promise<void>;
} & ModalProps;

const DeleteFormModal = ({ onDeleteForm, ...props }: Props) => {
  return (
    <ConfirmModal {...props}>
      <ConfirmModal.Title>Delete Form</ConfirmModal.Title>

      <ConfirmModal.Description>
        Are you sure you want to delete this form?
      </ConfirmModal.Description>

      <ConfirmModal.Footer>
        <ConfirmModal.CancelButton
          color="red"
          type="button"
          onClick={props.onClose}
        >
          Cancel
        </ConfirmModal.CancelButton>
        <ConfirmModal.ConfirmButton
          color="red"
          type="button"
          onClick={onDeleteForm}
        >
          Confirm
        </ConfirmModal.ConfirmButton>
      </ConfirmModal.Footer>
    </ConfirmModal>
  );
};

export default DeleteFormModal;
