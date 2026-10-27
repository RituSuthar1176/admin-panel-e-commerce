import { Alert, Flex, Text } from "theme-ui";
import { FiTrash2, FiX } from "react-icons/fi";
import BaseModal from "./BaseModal";
import BaseButton from "./BaseButton";

interface BaseConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  isLoading?: boolean;
  errorMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const BaseConfirmModal = ({
  title,
  message,
  confirmText = "Delete",
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
          variant="danger"
          fullWidth={false}
          icon={<FiTrash2 size={16} />}
          isLoading={isLoading}
          onClick={onConfirm}
        />
      </Flex>
    </BaseModal>
  );
};

export default BaseConfirmModal;
