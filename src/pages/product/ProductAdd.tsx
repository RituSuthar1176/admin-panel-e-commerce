import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Box, Flex, Heading, Text } from "theme-ui";
import {
  FiArrowRight,
  FiClipboard,
  FiInfo,
  FiPackage,
  FiPlus,
  FiX,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import BaseButton from "../../components/base/BaseButton";
import BaseImageUpload from "../../components/base/BaseImageUpload";
import BaseInput from "../../components/base/BaseInput";
import BaseSelect from "../../components/base/BaseSelect";
import BaseTabs from "../../components/base/BaseTabs";
import BaseTextArea from "../../components/base/BaseTextArea";
import VariantFormModal from "../../components/product/VariantFormModal";
import VariantTable from "../../components/product/VariantTable";
import {
  createProduct,
  getApiErrorMessage,
  getAttributeSets,
  validateVariants,
} from "../../api/productApi";
import type { AttributeSetOption, VariantRow } from "../../api/productApi";

type StepKey = "info" | "variant";

interface ProductInfoValues {
  title: string;
  attributeSetId: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  thumbnail: File[]; // holds zero or one image
  description: string;
}

const productListPath = '/product';

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(100, "Title must be at most 100 characters.")
    .required("Please enter product title."),
  attributeSetId: Yup.string().required("Please select attribute."),
  metaTitle: Yup.string().max(
    160,
    "Meta title must be at most 160 characters.",
  ),
  metaKeywords: Yup.string().max(
    255,
    "Meta keywords must be at most 255 characters.",
  ),
  metaDescription: Yup.string().max(
    255,
    "Meta description must be at most 255 characters.",
  ),
  thumbnail: Yup.array()
    .min(1, "Please upload thumbnail image.")
    .required("Please upload thumbnail image."),
  description: Yup.string().max(
    5000,
    "Description must be at most 5000 characters.",
  ),
});

const tabs = (isVariantDisabled: boolean) => [
  { key: "info", label: "Product Info", icon: <FiClipboard size={16} /> },
  {
    key: "variant",
    label: "Product Variant",
    icon: <FiPackage size={16} />,
    disabled: isVariantDisabled,
  },
];

const ProductAdd = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<StepKey>("info");
  const [isInfoDone, setIsInfoDone] = useState(false);

  // Attribute sets for the dropdown
  const [attributeSets, setAttributeSets] = useState<AttributeSetOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Variants
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the attribute sets when the screen opens
  useEffect(() => {
    let isActive = true;

    getAttributeSets()
      .then((sets) => {
        if (isActive) setAttributeSets(sets);
      })
      .catch((error) => {
        if (isActive) setLoadError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (isActive) setIsOptionsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  // Step 1: "Add and Next" only checks the form. The product is created in step 2.
  const formik = useFormik<ProductInfoValues>({
    initialValues: {
      title: "",
      attributeSetId: "",
      metaTitle: "",
      metaKeywords: "",
      metaDescription: "",
      thumbnail: [],
      description: "",
    },
    validationSchema,
    onSubmit: () => {
      setIsInfoDone(true);
      setStep("variant");
    },
  });

  const getError = (field: keyof ProductInfoValues) => {
    const showError = formik.touched[field] || formik.submitCount > 0;
    const error = formik.errors[field];

    return showError && typeof error === "string" ? error : undefined;
  };

  const selectedSet = attributeSets.find(
    (set) => set.id === formik.values.attributeSetId,
  );

  const attributeOptions = [
    { value: "", label: isOptionsLoading ? "Loading..." : "Select attribute" },
    ...attributeSets.map((set) => ({ value: set.id, label: set.name })),
  ];

  // The variants belong to one attribute set, so a different set clears them
  const handleAttributeSetChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (
      variants.length > 0 &&
      event.target.value !== formik.values.attributeSetId
    ) {
      setVariants([]);
      setNotice(
        "The attribute was changed, so the variants were cleared. Please add them again.",
      );
    }
    formik.handleChange(event);
  };

  const variantErrors = hasTriedSubmit ? validateVariants(variants) : {};

  const handleAddVariant = (row: VariantRow) => {
    setVariants((current) => [...current, row]);
    setIsVariantModalOpen(false);
    setNotice("");
    setSubmitError("");
  };

  const handleChangeVariant = (key: string, patch: Partial<VariantRow>) => {
    setVariants((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleDeleteVariant = (key: string) => {
    setVariants((current) => current.filter((row) => row.key !== key));
  };

  // Step 2: upload the images and create the product
  const handleSubmit = () => {
    setHasTriedSubmit(true);
    setSubmitError("");

    if (variants.length === 0) {
      setSubmitError("Please add at least one variant.");
      return;
    }

    if (Object.keys(validateVariants(variants)).length > 0) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    const thumbnail = formik.values.thumbnail[0];
    if (!thumbnail) {
      setStep("info");
      return;
    }

    setIsSubmitting(true);

    createProduct({
      attributeSetId: formik.values.attributeSetId,
      title: formik.values.title,
      description: formik.values.description,
      thumbnail,
      metaTitle: formik.values.metaTitle,
      metaKeywords: formik.values.metaKeywords,
      metaDescription: formik.values.metaDescription,
      variants,
    })
      .then(() => {
        navigate(productListPath, {
          state: { successMessage: "Product added successfully." },
        });
      })
      .catch((error) => {
        setSubmitError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  const goToList = () => navigate(productListPath);

  const threeColumnSx = {
    display: "grid",
    gridTemplateColumns: ["1fr", null, "repeat(3, 1fr)"],
    columnGap: 4,
  } as const;
  const twoColumnSx = {
    display: "grid",
    gridTemplateColumns: ["1fr", null, "1fr 1fr"],
    columnGap: 4,
  } as const;

  return (
    <Box>
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Heading as="h1" sx={{ fontSize: 3 }}>
          {step === "info" ? "Product Info" : "Product Variant"}
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product", path: productListPath },
            { label: step === "info" ? "Product Info" : "Product Variant" },
          ]}
        />
      </Flex>

      <Box
        sx={{
          bg: "white",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <BaseTabs
          tabs={tabs(!isInfoDone)}
          activeKey={step}
          onChange={(key) => setStep(key === "variant" ? "variant" : "info")}
        />

        <Box sx={{ p: [3, 4] }}>
          {loadError && <Alert>{loadError}</Alert>}

          {/* ---------- Step 1: product info ---------- */}
          {step === "info" && (
            <form onSubmit={formik.handleSubmit} noValidate>
              <Box sx={twoColumnSx}>
                <BaseInput
                  id="title"
                  name="title"
                  label="Product Title"
                  placeholder="Enter product title"
                  maxLength={100}
                  autoFocus
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={getError("title")}
                />
                <BaseSelect
                  id="attributeSetId"
                  name="attributeSetId"
                  label="Attribute"
                  options={attributeOptions}
                  value={formik.values.attributeSetId}
                  onChange={handleAttributeSetChange}
                  onBlur={formik.handleBlur}
                  error={getError("attributeSetId")}
                />
              </Box>

              <Box sx={threeColumnSx}>
                <BaseInput
                  id="metaTitle"
                  name="metaTitle"
                  label="Meta Title"
                  placeholder="Enter meta title"
                  isRequired={false}
                  maxLength={160}
                  hint={`${formik.values.metaTitle.length}/160`}
                  value={formik.values.metaTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={getError("metaTitle")}
                />
                <BaseInput
                  id="metaKeywords"
                  name="metaKeywords"
                  label="Meta Keywords"
                  placeholder="Enter meta keywords"
                  isRequired={false}
                  maxLength={255}
                  value={formik.values.metaKeywords}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={getError("metaKeywords")}
                />
                <BaseInput
                  id="metaDescription"
                  name="metaDescription"
                  label="Meta Description"
                  placeholder="Enter meta description"
                  isRequired={false}
                  maxLength={255}
                  hint={`${formik.values.metaDescription.length}/255`}
                  value={formik.values.metaDescription}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={getError("metaDescription")}
                />
              </Box>

              <Box sx={twoColumnSx}>
                <BaseImageUpload
                  id="thumbnail"
                  label="Thumbnail Image"
                  isRequired
                  files={formik.values.thumbnail}
                  onChange={(files) => {
                    formik.setFieldValue("thumbnail", files);
                    formik.setFieldTouched("thumbnail", true, false);
                  }}
                  error={getError("thumbnail")}
                />
              </Box>

              <BaseTextArea
                id="description"
                name="description"
                label="Product Description"
                placeholder="Enter detailed product description..."
                rows={7}
                maxLength={5000}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={getError("description")}
              />

              <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 3 }}>
                <BaseButton
                  text="Cancel"
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  icon={<FiX size={16} />}
                  onClick={goToList}
                />
                <BaseButton
                  text="Add and Next"
                  fullWidth={false}
                  icon={<FiArrowRight size={16} />}
                />
              </Flex>
            </form>
          )}

          {/* ---------- Step 2: variants ---------- */}
          {step === "variant" && (
            <Box>
              <Flex
                sx={{
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 3,
                  mb: 3,
                }}
              >
                <Flex
                  sx={{
                    alignItems: "flex-start",
                    gap: 2,
                    flex: 1,
                    minWidth: 220,
                    fontSize: "12px",
                    color: "muted",
                  }}
                >
                  <FiInfo size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                  <Text>
                    Navigate sections using the tabs. This table is editable.
                    Click any cell to update, or add a new variant using the
                    button.
                  </Text>
                </Flex>
                <BaseButton
                  text="Add Variant"
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  icon={<FiPlus size={16} />}
                  onClick={() => setIsVariantModalOpen(true)}
                />
              </Flex>

              {notice && <Alert>{notice}</Alert>}
              {submitError && <Alert>{submitError}</Alert>}

              <VariantTable
                rows={variants}
                errors={variantErrors}
                onChange={handleChangeVariant}
                onDelete={handleDeleteVariant}
              />

              <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 4 }}>
                <BaseButton
                  text="Cancel"
                  type="button"
                  variant="secondary"
                  fullWidth={false}
                  icon={<FiX size={16} />}
                  onClick={goToList}
                />
                <BaseButton
                  text="Submit"
                  type="button"
                  fullWidth={false}
                  icon={<FiPlus size={16} />}
                  isLoading={isSubmitting}
                  onClick={handleSubmit}
                />
              </Flex>
            </Box>
          )}
        </Box>
      </Box>

      {isVariantModalOpen && (
        <VariantFormModal
          attributes={selectedSet?.attributes ?? []}
          existingCodes={variants.map((row) => row.code.trim().toLowerCase())}
          onClose={() => setIsVariantModalOpen(false)}
          onAdd={handleAddVariant}
        />
      )}
    </Box>
  );
};

export default ProductAdd;
