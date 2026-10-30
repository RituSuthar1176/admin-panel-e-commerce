import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Flex } from "theme-ui";
import { FiCheck, FiPlus, FiX } from "react-icons/fi";
import BaseModal from "../base/BaseModal";
import BaseInput from "../base/BaseInput";
import BaseSelect from "../base/BaseSelect";
import BaseMultiSelect from "../base/BaseMultiSelect";
import BaseButton from "../base/BaseButton";
import {
  createAttributeSet,
  getApiErrorMessage,
  getAttributeOptions,
  statusOptions,
  updateAttributeSet,
} from "../../api/attributeSetApi";
import type {
  AttributeOption,
  AttributeSet,
  AttributeSetStatus,
} from "../../api/attributeSetApi";

interface AttributeSetFormModalProps {
  attributeSet: AttributeSet | null; // null = add mode, an attribute set = edit mode
  onClose: () => void;
  onSuccess: (message: string) => void;
}

interface AttributeSetFormValues {
  name: string;
  attributeIds: string[];
  status: AttributeSetStatus;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters.")
    .required("Please enter name."),
  attributeIds: Yup.array()
    .of(Yup.string().required())
    .min(1, "Please select at least one attribute.")
    .required("Please select at least one attribute."),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Please select status.")
    .required("Please select status."),
});

const AttributeSetFormModal = ({
  attributeSet,
  onClose,
  onSuccess,
}: AttributeSetFormModalProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [attributeOptions, setAttributeOptions] = useState<AttributeOption[]>(
    [],
  );
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const isEditMode = attributeSet !== null;

  // Load the attributes for the dropdown when the modal opens
  useEffect(() => {
    let isActive = true;

    getAttributeOptions()
      .then((options) => {
        if (isActive) setAttributeOptions(options);
      })
      .catch((error) => {
        if (isActive) setErrorMessage(getApiErrorMessage(error));
      })
      .finally(() => {
        if (isActive) setIsOptionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const formik = useFormik<AttributeSetFormValues>({
    initialValues: {
      name: attributeSet?.name ?? "",
      attributeIds: attributeSet?.attributeIds ?? [],
      status: attributeSet?.status ?? "active",
    },
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setErrorMessage("");

      const payload = {
        name: values.name.trim(),
        status: values.status,
        attributeIds: values.attributeIds,
      };
      const request = attributeSet
        ? updateAttributeSet(attributeSet.id, payload)
        : createAttributeSet(payload);

      request
        .then(() => {
          onSuccess(
            isEditMode
              ? "Attribute set updated successfully."
              : "Attribute set added successfully.",
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

  // Show an error after the field was visited or the form was submitted
  const getError = (field: keyof AttributeSetFormValues) => {
    const showError = formik.touched[field] || formik.submitCount > 0;
    return showError ? (formik.errors[field] as string | undefined) : undefined;
  };

  return (
    <BaseModal
      title={isEditMode ? "Edit Attribute Set" : "Add Attribute Set"}
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
          error={getError("name")}
        />

        <BaseMultiSelect
          id="attributeIds"
          label="Attribute"
          options={attributeOptions}
          value={formik.values.attributeIds}
          isLoading={isOptionsLoading}
          onChange={(ids) => formik.setFieldValue("attributeIds", ids)}
          onBlur={() => formik.setFieldTouched("attributeIds", true)}
          error={getError("attributeIds")}
        />

        <BaseSelect
          id="status"
          name="status"
          label="Status"
          options={statusOptions}
          value={formik.values.status}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={getError("status")}
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

export default AttributeSetFormModal;
