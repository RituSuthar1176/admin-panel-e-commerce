import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Flex } from "theme-ui";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import BaseModal from "../base/BaseModal";
import BaseInput from "../base/BaseInput";
import BaseButton from "../base/BaseButton";
import {
  createAttribute,
  getApiErrorMessage,
  updateAttribute,
} from "../../api/attributeApi";
import type { Attribute } from "../../api/attributeApi";

interface AttributeFormModalProps {
  attribute: Attribute | null; // null = add mode, an attribute = edit mode
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface AttributeFormValues {
  name: string;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters.")
    .required("Please enter name."),
});

const AttributeFormModal = ({
  attribute,
  onClose,
  onSuccess,
}: AttributeFormModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const isEditMode = attribute !== null;

  const formik = useFormik<AttributeFormValues>({
    initialValues: { name: attribute?.name ?? "" },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setErrorMessage("");
      const name = values.name.trim();

      const request = attribute
        ? updateAttribute(attribute.id, name)
        : createAttribute(name);

      request
        .then(() => {
          onSuccess(
            isEditMode
              ? "Attribute updated successfully."
              : "Attribute added successfully.",
          );
        })
        .catch((error) => {
          setErrorMessage(getApiErrorMessage(error));
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  return (
    <BaseModal
      title={isEditMode ? "Edit Attribute" : "Add Attribute"}
      onClose={onClose}
    >
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <form onSubmit={formik.handleSubmit}>
        <BaseInput
          id="name"
          name="name"
          label="Name"
          placeholder="Enter name"
          autoFocus
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.name ? formik.errors.name : undefined}
        />

        <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 3 }}>
          <BaseButton
            text="Cancel"
            type="button"
            variant="secondary"
            fullWidth={false}
            icon={<FiX size={16} />}
            onClick={onClose}
          />
          <BaseButton
            text={isEditMode ? "Update" : "Submit"}
            fullWidth={false}
            icon={isEditMode ? <FiCheck size={16} /> : <FiPlus size={16} />}
            isLoading={formik.isSubmitting}
          />
        </Flex>
      </form>
    </BaseModal>
  );
};

export default AttributeFormModal;
