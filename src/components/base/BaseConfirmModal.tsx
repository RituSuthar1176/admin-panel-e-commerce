import type { ReactNode } from "react";
import { Alert, Flex, Text } from "theme-ui";
import { FiTrash2, FiX } from "react-icons/fi";
import BaseModal from "./BaseModal";
import BaseButton from "./BaseButton";

interface BaseConfirmModalProps {
  title: string;
  message: ReactNode; // plain text, or text with bold parts
  confirmText?: string;
  confirmIcon?: ReactNode;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const BaseConfirmModal = ({
  title,
  message,
  confirmText = "Delete",
  confirmIcon = <FiTrash2 size={16} />,
  confirmVariant = "danger",
  isLoading = false,
  errorMessage = "",
  onConfirm,
  onCancel,
}: BaseConfirmModalProps) => {
  return (
    <BaseModal title={title} onClose={onCancel}>
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <Text sx={{ display: "block", mb: 4, wordBreak: "break-word" }}>
        {message}
      </Text>

      <Flex sx={{ justifyContent: "flex-end", gap: 3 }}>
        <BaseButton
          text="Cancel"
          type="button"
          variant="secondary"
          fullWidth={false}
          icon={<FiX size={16} />}
          onClick={onCancel}
        />
        <BaseButton
          text={confirmText}
          type="button"
          variant={confirmVariant}
          fullWidth={false}
          icon={confirmIcon}
          isLoading={isLoading}
          onClick={onConfirm}
        />
      </Flex>
    </BaseModal>
  );
};

export default BaseConfirmModal;
