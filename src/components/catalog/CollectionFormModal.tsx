import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Flex } from "theme-ui";
import { FiArrowRight, FiCheck, FiX } from "react-icons/fi";
import BaseModal from "../base/BaseModal";
import BaseInput from "../base/BaseInput";
import BaseRadioGroup from "../base/BaseRadioGroup";
import BaseButton from "../base/BaseButton";
import ComponentLoader from "../loaders/ComponentLoader";
import CollectionTreeSelect from "./CollectionTreeSelect";
import {
  collectionStatusOptions,
  createCollection,
  getApiErrorMessage,
  getCollectionDetails,
  getCollectionOptions,
  updateCollection,
} from "../../api/collectionApi";
import type {
  CollectionOption,
  CollectionStatus,
} from "../../api/collectionApi";

interface CollectionFormModalProps {
  collectionId: string | null; // null = add mode, an id = edit mode
  onClose: () => void;
  onCreated: (collectionId: string) => void; // add mode. An empty id means the backend did not return one.
  onUpdated: () => void; // edit mode
}

interface CollectionFormValues {
  name: string;
  status: CollectionStatus;
  parentIds: string[];
}

const emptyValues: CollectionFormValues = {
  name: "",
  status: "active",
  parentIds: [],
};

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters.")
    .required("Please enter name."),
  status: Yup.string()
    .oneOf(["active", "inactive"], "Please select status.")
    .required("Please select status."),
  parentIds: Yup.array()
    .of(Yup.string().required())
    .max(1, "Only one parent collection can be saved right now."),
});

// A collection cannot be its own parent, or the parent of its own children.
// Removing its branch from the list prevents that.
const removeBranch = (
  options: CollectionOption[],
  id: string,
): CollectionOption[] =>
  options
    .filter((option) => option.id !== id)
    .map((option) => ({
      ...option,
      children: removeBranch(option.children, id),
    }));

const CollectionFormModal = ({
  collectionId,
  onClose,
  onCreated,
  onUpdated,
}: CollectionFormModalProps) => {
  const isEditMode = collectionId !== null;

  const [errorMessage, setErrorMessage] = useState("");
  const [parentOptions, setParentOptions] = useState<CollectionOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [initialValues, setInitialValues] =
    useState<CollectionFormValues>(emptyValues);
  const [isDetailsLoading, setIsDetailsLoading] = useState(isEditMode);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  // Load the parent collections when the popup opens
  useEffect(() => {
    let isActive = true;

    getCollectionOptions()
      .then((options) => {
        if (isActive) setParentOptions(options);
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

  // Edit mode: load the saved values of the collection
  useEffect(() => {
    if (!collectionId) return;

    let isActive = true;

    getCollectionDetails(collectionId)
      .then((details) => {
        if (isActive)
          setInitialValues({
            name: details.name,
            status: details.status,
            parentIds: details.parentIds,
          });
      })
      .catch((error) => {
        if (isActive) {
          setErrorMessage(getApiErrorMessage(error));
          setHasLoadFailed(true);
        }
      })
      .finally(() => {
        if (isActive) setIsDetailsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [collectionId]);
  
  
  const formik = useFormik<CollectionFormValues>({
    initialValues,
    enableReinitialize: true, // fills the form when the saved values arrive
    validationSchema,
    onSubmit: (values, { setSubmitting }) => {
      setErrorMessage("");

      const payload = {
        name: values.name.trim(),
        status: values.status,
        parentIds: values.parentIds,
      };

      const request = collectionId
        ? updateCollection(collectionId, payload).then(() => onUpdated())
        : createCollection(payload).then((newId) => onCreated(newId));

      request
        .catch((error) => {
          setErrorMessage(getApiErrorMessage(error));
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
  });

  // Show an error after the field was visited or the form was submitted
  const getError = (field: "name" | "status" | "parentIds") => {
    const showError = formik.touched[field] || formik.submitCount > 0;
    const error = formik.errors[field];

    return showError && typeof error === "string" ? error : undefined;
  };

  const visibleOptions = collectionId
    ? removeBranch(parentOptions, collectionId)
    : parentOptions;

  return (
    <BaseModal
      title={isEditMode ? "Edit Collection" : "Add Collection"}
      onClose={onClose}
    >
      {errorMessage && <Alert>{errorMessage}</Alert>}

      {isDetailsLoading ? (
        <Flex sx={{ justifyContent: "center", py: 5 }}>
          <ComponentLoader size={32} />
        </Flex>
      ) : hasLoadFailed ? (
        <Flex sx={{ justifyContent: "flex-end", mt: 3 }}>
          <BaseButton
            text="Close"
            type="button"
            variant="secondary"
            fullWidth={false}
            onClick={onClose}
          />
        </Flex>
      ) : (
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

          <BaseRadioGroup
            label="Status"
            name="status"
            options={collectionStatusOptions}
            value={formik.values.status}
            onChange={(value) => formik.setFieldValue("status", value)}
            onBlur={() => formik.setFieldTouched("status", true)}
            error={getError("status")}
          />

          <CollectionTreeSelect
            label="Parent Collection"
            options={visibleOptions}
            selectedIds={formik.values.parentIds}
            isLoading={isOptionsLoading}
            onChange={(ids) => formik.setFieldValue("parentIds", ids)}
            error={getError("parentIds")}
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
              text={isEditMode ? "Update" : "Add and Next"}
              fullWidth={false}
              icon={
                isEditMode ? <FiCheck size={16} /> : <FiArrowRight size={16} />
              }
              isLoading={formik.isSubmitting}
            />
          </Flex>
        </form>
      )}
    </BaseModal>
  );
};

export default CollectionFormModal;
