import { useFormik } from "formik";
import type { FormikErrors } from "formik";
import { Box, Flex } from "theme-ui";
import { FiPlus, FiX } from "react-icons/fi";
import BaseModal from "../base/BaseModal";
import BaseInput from "../base/BaseInput";
import BaseSelect from "../base/BaseSelect";
import BaseImageUpload from "../base/BaseImageUpload";
import BaseButton from "../base/BaseButton";
import { productStatusOptions, validateVariantRow } from "../../api/productApi";
import type {
  AttributeRef,
  ProductStatus,
  VariantRow,
} from "../../api/productApi";

interface VariantFormModalProps {
  attributes: AttributeRef[]; // the attributes of the chosen attribute set
  existingCodes: string[]; // the SKUs already in the table
  onClose: () => void;
  onAdd: (row: VariantRow) => void;
}

interface VariantFormValues {
  title: string;
  code: string;
  availableQuantity: string;
  onHandQuantity: string;
  fakePrice: string;
  price: string;
  status: ProductStatus;
  images: File[];
  attributeValues: Record<string, string>;
}

let rowCounter = 0;
const createRowKey = () => `variant-${Date.now()}-${rowCounter++}`;

const gridSx = {
  display: "grid",
  gridTemplateColumns: ["1fr", "1fr 1fr"],
  columnGap: 3,
} as const;

const VariantFormModal = ({
  attributes,
  existingCodes,
  onClose,
  onAdd,
}: VariantFormModalProps) => {
  const formik = useFormik<VariantFormValues>({
    initialValues: {
      title: "",
      code: "",
      availableQuantity: "",
      onHandQuantity: "",
      fakePrice: "",
      price: "",
      status: "active",
      images: [],
      attributeValues: {},
    },
    validate: (values) => {
      const errors = validateVariantRow(
        values,
      ) as FormikErrors<VariantFormValues>;

      if (
        !errors.code &&
        existingCodes.includes(values.code.trim().toLowerCase())
      ) {
        errors.code = "This SKU is already used.";
      }
      return errors;
    },
    onSubmit: (values) => {
      onAdd({
        key: createRowKey(),
        title: values.title.trim(),
        code: values.code.trim(),
        availableQuantity: values.availableQuantity.trim(),
        onHandQuantity: values.onHandQuantity.trim(),
        fakePrice: values.fakePrice.trim(),
        price: values.price.trim(),
        status: values.status,
        images: values.images,
        attributes: attributes.map((attribute) => ({
          attributeId: attribute.id,
          name: attribute.name,
          value: values.attributeValues[attribute.id]?.trim() ?? "",
        })),
      });
    },
  });

  // Show an error after the field was visited or the form was submitted
  const getError = (
    field:
      | "title"
      | "code"
      | "availableQuantity"
      | "onHandQuantity"
      | "fakePrice"
      | "price"
      | "status",
  ) => {
    const showError = formik.touched[field] || formik.submitCount > 0;
    const error = formik.errors[field];

    return showError && typeof error === "string" ? error : undefined;
  };

  return (
    <BaseModal title="Add Variant" onClose={onClose} maxWidth={640}>
      <form onSubmit={formik.handleSubmit} noValidate>
        <Box sx={gridSx}>
          <BaseInput
            id="title"
            name="title"
            label="Variant"
            placeholder="For example Red - XL"
            maxLength={100}
            autoFocus
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("title")}
          />
          <BaseInput
            id="code"
            name="code"
            label="SKU"
            placeholder="Enter SKU"
            maxLength={50}
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("code")}
          />
          <BaseInput
            id="availableQuantity"
            name="availableQuantity"
            label="Available Quantity"
            placeholder="0"
            inputMode="numeric"
            maxLength={9}
            value={formik.values.availableQuantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("availableQuantity")}
          />
          <BaseInput
            id="onHandQuantity"
            name="onHandQuantity"
            label="On Hand Quantity"
            placeholder="0"
            inputMode="numeric"
            maxLength={9}
            value={formik.values.onHandQuantity}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("onHandQuantity")}
          />
          <BaseInput
            id="fakePrice"
            name="fakePrice"
            label="Fake Price"
            placeholder="0.00"
            inputMode="decimal"
            maxLength={12}
            value={formik.values.fakePrice}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("fakePrice")}
          />
          <BaseInput
            id="price"
            name="price"
            label="Price"
            placeholder="0.00"
            inputMode="decimal"
            maxLength={12}
            value={formik.values.price}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("price")}
          />
          <BaseSelect
            id="status"
            name="status"
            label="Status"
            options={productStatusOptions}
            value={formik.values.status}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={getError("status")}
          />
        </Box>

        {/* One value for each attribute of the attribute set, such as Color or Size */}
        {attributes.length > 0 && (
          <Box sx={gridSx}>
            {attributes.map((attribute) => (
              <BaseInput
                key={attribute.id}
                id={`attribute-${attribute.id}`}
                label={attribute.name || "Attribute"}
                placeholder={`Enter ${attribute.name || "value"}`}
                isRequired={false}
                maxLength={100}
                value={formik.values.attributeValues[attribute.id] ?? ""}
                onChange={(event) =>
                  formik.setFieldValue("attributeValues", {
                    ...formik.values.attributeValues,
                    [attribute.id]: event.target.value,
                  })
                }
              />
            ))}
          </Box>
        )}

        <BaseImageUpload
          id="variantImages"
          label="Variant Images"
          multiple
          maxFiles={5}
          files={formik.values.images}
          onChange={(files) => formik.setFieldValue("images", files)}
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
            text="Add Variant"
            fullWidth={false}
            icon={<FiPlus size={16} />}
          />
        </Flex>
      </form>
    </BaseModal>
  );
};

export default VariantFormModal;
