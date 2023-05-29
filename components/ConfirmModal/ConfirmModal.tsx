import { ActionIcon, Container, Modal, ModalProps } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import CancelButton from "./CancelButton";
import ConfirmButton from "./ConfirmButton";
import Description from "./Description";
import Footer from "./Footer";
import Title from "./Title";

const ConfirmModal = ({ children, ...props }: ModalProps) => {
  return (
    <Modal withCloseButton={false} size={512} {...props} padding={0} centered>
      <Container m={0} px={40} py={32} fluid pos="relative">
        <ActionIcon
          size="md"
          onClick={props.onClose}
          aria-label="close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
          }}
        >
          <IconX size={16} />
        </ActionIcon>
        {children}
      </Container>
    </Modal>
  );
};

export default ConfirmModal;

ConfirmModal.Title = Title;
ConfirmModal.Description = Description;
ConfirmModal.Footer = Footer;
ConfirmModal.CancelButton = CancelButton;
ConfirmModal.ConfirmButton = ConfirmButton;
