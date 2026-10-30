import type { Attribute } from "../../api/attributeApi";
import BaseConfirmModal from "../base/BaseConfirmModal";

interface AttributeDeleteModalProps {
  attribute: Attribute;
  isLoading: boolean;
  errorMessage: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const AttributeDeleteModal = ({
  attribute,
  isLoading,
  errorMessage,
  onConfirm,
  onCancel,
}: AttributeDeleteModalProps) => {
  return (
    <BaseConfirmModal
      title="Delete Attribute"
      message={
        <>
          Are you sure you want to delete the attribute{" "}
          <strong>{attribute.name}</strong>?
          This action cannot be undone.
        </>
      }
      confirmText="Delete"
      confirmVariant="danger"
      isLoading={isLoading}
      errorMessage={errorMessage}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
};

export default AttributeDeleteModal;