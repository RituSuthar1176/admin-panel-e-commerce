import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, Box, Flex, Heading, Text } from "theme-ui";
import {
  FiArrowRight,
  FiCheck,
  FiClipboard,
  FiInfo,
  FiPackage,
  FiPlus,
  FiX,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import BaseButton from "../../components/base/BaseButton";
import BaseConfirmModal from "../../components/base/BaseConfirmModal";
import BaseImageUpload from "../../components/base/BaseImageUpload";
import BaseInput from "../../components/base/BaseInput";
import BaseSelect from "../../components/base/BaseSelect";
import BaseTabs from "../../components/base/BaseTabs";
import BaseTextArea from "../../components/base/BaseTextArea";
import ImageManagerModal from "../../components/base/ImageManagerModal";
import ProductImage from "../../components/base/ProductImage";
import PageLoader from "../../components/loaders/PageLoader";
import VariantEditTable from "../../components/product/VariantEditTable";
import VariantFormModal from "../../components/product/VariantFormModal";
import {
  getApiErrorMessage,
  getAttributeSets,
  getImageUrl,
  getProductForEdit,
  updateProduct,
  validateVariants,
} from "../../api/productApi";
import type {
  AttributeRef,
  AttributeSetOption,
  EditVariantRow,
  EditableProduct,
  VariantRow,
} from "../../api/productApi";

type StepKey = "info" | "variant";

interface ProductInfoValues {
  title: string;
  attributeSetId: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  description: string;
  thumbnail: File[]; // a new picture, zero or one
  existingThumbnail: string; // the saved picture
}

const productListPath = "/product";

const emptyValues: ProductInfoValues = {
  title: "",
  attributeSetId: "",
  metaTitle: "",
  metaKeywords: "",
  metaDescription: "",
  description: "",
  thumbnail: [],
  existingThumbnail: "",
};

const validationSchema = Yup.object({
  title: Yup.string()
    .trim()
    .min(2, "Title must be at least 2 characters.")
    .max(100, "Title must be at most 100 characters.")
    .required("Please enter product title."),
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
  description: Yup.string().max(
    5000,
    "Description must be at most 5000 characters.",
  ),
  // A thumbnail is required, but the saved one counts
  thumbnail: Yup.array().test(
    "thumbnail-required",
    "Please upload thumbnail image.",
    (value, context) =>
      (value?.length ?? 0) > 0 || Boolean(context.parent.existingThumbnail),
  ),
});

const tabs = [
  { key: "info", label: "Product Info", icon: <FiClipboard size={16} /> },
  { key: "variant", label: "Product Variant", icon: <FiPackage size={16} /> },
];

// The columns come from the attribute set. If it cannot be found, they come from the variants themselves.
const getAttributeColumns = (
  setAttributes: AttributeRef[],
  rows: EditVariantRow[],
): AttributeRef[] => {
  if (setAttributes.length > 0) return setAttributes;

  const columns = new Map<string, AttributeRef>();
  rows.forEach((row) =>
    row.attributes.forEach((attribute) => {
      if (!columns.has(attribute.attributeId))
        columns.set(attribute.attributeId, {
          id: attribute.attributeId,
          name: attribute.name,
        });
    }),
  );

  return [...columns.values()];
};

const ProductEdit = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [step, setStep] = useState<StepKey>("info");
  const [product, setProduct] = useState<EditableProduct | null>(null);
  const [attributeSets, setAttributeSets] = useState<AttributeSetOption[]>([]);
  const [initialValues, setInitialValues] =
    useState<ProductInfoValues>(emptyValues);
  const [variants, setVariants] = useState<EditVariantRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [imageEditKey, setImageEditKey] = useState<string | null>(null);
  const [variantToDelete, setVariantToDelete] = useState<EditVariantRow | null>(
    null,
  );

  const [hasTriedUpdate, setHasTriedUpdate] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load the product and the attribute sets when the screen opens
  useEffect(() => {
    let isActive = true;

    Promise.all([
      getProductForEdit(id),
      getAttributeSets().catch(() => [] as AttributeSetOption[]),
    ])
      .then(([loadedProduct, sets]) => {
        if (!isActive) return;

        const matchedSet =
          sets.find((set) => set.id === loadedProduct.attributeSetId) ??
          sets.find((set) => set.name === loadedProduct.attributeSetName);

        setProduct(loadedProduct);
        setAttributeSets(sets);
        setVariants(loadedProduct.variants);
        setInitialValues({
          title: loadedProduct.title,
          attributeSetId: matchedSet?.id ?? loadedProduct.attributeSetId,
          metaTitle: loadedProduct.metaTitle,
          metaKeywords: loadedProduct.metaKeywords,
          metaDescription: loadedProduct.metaDescription,
          description: loadedProduct.description,
          thumbnail: [],
          existingThumbnail: loadedProduct.thumbnailName,
        });
      })
      .catch((error) => {
        if (isActive) setLoadError(getApiErrorMessage(error));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

  // "Update and Next" only checks the form. The product is saved from the variant tab.
  const formik = useFormik<ProductInfoValues>({
    initialValues,
    enableReinitialize: true, // fills the form when the saved values arrive
    validationSchema,
    onSubmit: () => setStep("variant"),
  });

  const getError = (field: keyof ProductInfoValues) => {
    const showError =
      formik.touched[field] || formik.submitCount > 0 || hasTriedUpdate;
    const error = formik.errors[field];

    return showError && typeof error === "string" ? error : undefined;
  };

  const selectedSet =
    attributeSets.find((set) => set.id === formik.values.attributeSetId) ??
    attributeSets.find((set) => set.name === product?.attributeSetName);

  const attributeColumns = getAttributeColumns(
    selectedSet?.attributes ?? [],
    variants,
  );

  const attributeOptions = [
    ...(selectedSet || !product
      ? []
      : [
          {
            value: product.attributeSetId,
            label: product.attributeSetName || "Select attribute",
          },
        ]),
    ...attributeSets.map((set) => ({ value: set.id, label: set.name })),
  ];

  const variantErrors = hasTriedUpdate ? validateVariants(variants) : {};
  const imageRow = variants.find((row) => row.key === imageEditKey) ?? null;

  const handleChangeVariant = (key: string, patch: Partial<EditVariantRow>) => {
    setVariants((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  };

  const handleAttributeChange = (
    key: string,
    attribute: AttributeRef,
    value: string,
  ) => {
    setVariants((current) =>
      current.map((row) => {
        if (row.key !== key) return row;

        const exists = row.attributes.some(
          (item) => item.attributeId === attribute.id,
        );
        const attributes = exists
          ? row.attributes.map((item) =>
              item.attributeId === attribute.id ? { ...item, value } : item,
            )
          : [
              ...row.attributes,
              {
                rowId: "",
                attributeId: attribute.id,
                name: attribute.name,
                value,
              },
            ];

        return { ...row, attributes };
      }),
    );
  };

  // A new variant from the "Add Variant" popup
  const handleAddVariant = (row: VariantRow) => {
    setVariants((current) => [
      ...current,
      {
        key: row.key,
        id: "",
        title: row.title,
        code: row.code,
        availableQuantity: row.availableQuantity,
        onHandQuantity: row.onHandQuantity,
        fakePrice: row.fakePrice,
        price: row.price,
        status: row.status,
        existingImages: [],
        newImages: row.images,
        attributes: row.attributes.map((attribute) => ({
          rowId: "",
          ...attribute,
        })),
      },
    ]);
    setIsVariantModalOpen(false);
    setSubmitError("");
  };

  const handleConfirmDelete = () => {
    if (variantToDelete)
      setVariants((current) =>
        current.filter((row) => row.key !== variantToDelete.key),
      );
    setVariantToDelete(null);
  };

  const handleUpdate = async () => {
    if (!product) return;

    setHasTriedUpdate(true);
    setSubmitError("");

    // The info tab is checked first, and the user is sent back to it when something is wrong
    const infoErrors = await formik.validateForm();
    if (Object.keys(infoErrors).length > 0) {
      setStep("info");
      return;
    }

    if (variants.length === 0) {
      setSubmitError("A product needs at least one variant.");
      return;
    }

    if (Object.keys(validateVariants(variants)).length > 0) {
      setSubmitError("Please fix the highlighted fields.");
      return;
    }

    // Pictures removed from variants that are still in the table. They are deleted after the product is saved.
    const originalImages = new Map(
      product.variants.map((row) => [row.key, row.existingImages]),
    );
    const removedImages = variants.flatMap((row) =>
      (originalImages.get(row.key) ?? []).filter(
        (name) => !row.existingImages.includes(name),
      ),
    );

    setIsSubmitting(true);

    updateProduct(id, {
      title: formik.values.title,
      description: formik.values.description,
      status: product.status,
      thumbnailName: formik.values.existingThumbnail,
      newThumbnail: formik.values.thumbnail[0] ?? null,
      metaTitle: formik.values.metaTitle,
      metaKeywords: formik.values.metaKeywords,
      metaDescription: formik.values.metaDescription,
      variants,
      removedImages,
    })
      .then(() => {
        navigate(productListPath, {
          state: { successMessage: "Product updated successfully." },
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
  };
  const twoColumnSx = {
    display: "grid",
    gridTemplateColumns: ["1fr", null, "1fr 1fr"],
    columnGap: 4,
  } ;

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
          Product Info
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product", path: productListPath },
            { label: "Product Info" },
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
          tabs={tabs}
          activeKey={step}
          onChange={(key) => setStep(key === "variant" ? "variant" : "info")}
        />

        <Box sx={{ p: [3, 4] }}>
          {loadError && <Alert>{loadError}</Alert>}

          {isLoading ? (
            <PageLoader />
          ) : (
            product && (
              <>
                {/* ---------- Product info ---------- */}
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
                      {/* The attribute set cannot change, because the variants belong to it */}
                      <BaseSelect
                        id="attributeSetId"
                        name="attributeSetId"
                        label="Attribute"
                        options={attributeOptions}
                        disabled
                        value={formik.values.attributeSetId}
                        onChange={formik.handleChange}
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
                      <Box mb={2}>
                        <Text
                          sx={{
                            display: "block",
                            mb: 1,
                            fontSize: 1,
                            fontWeight: 500,
                          }}
                        >
                          Current Image
                        </Text>
                        <ProductImage
                          src={product.thumbnailUrl}
                          alt={product.title}
                          size={120}
                        />
                      </Box>
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
                        text="Update and Next"
                        fullWidth={false}
                        icon={<FiArrowRight size={16} />}
                      />
                    </Flex>
                  </form>
                )}

                {/* ---------- Product variants ---------- */}
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
                        <FiInfo
                          size={14}
                          style={{ marginTop: 2, flexShrink: 0 }}
                        />
                        <Text>
                          Navigate sections using the tabs. This table is
                          editable. Click any cell to update, or add a new
                          variant using the button.
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

                    {submitError && <Alert>{submitError}</Alert>}

                    <VariantEditTable
                      rows={variants}
                      attributeColumns={attributeColumns}
                      errors={variantErrors}
                      onChange={handleChangeVariant}
                      onAttributeChange={handleAttributeChange}
                      onEditImages={setImageEditKey}
                      onDelete={(key) =>
                        setVariantToDelete(
                          variants.find((row) => row.key === key) ?? null,
                        )
                      }
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
                        text="Update"
                        type="button"
                        fullWidth={false}
                        icon={<FiCheck size={16} />}
                        isLoading={isSubmitting}
                        onClick={handleUpdate}
                      />
                    </Flex>
                  </Box>
                )}
              </>
            )
          )}
        </Box>
      </Box>

      {isVariantModalOpen && (
        <VariantFormModal
          attributes={attributeColumns}
          existingCodes={variants.map((row) => row.code.trim().toLowerCase())}
          onClose={() => setIsVariantModalOpen(false)}
          onAdd={handleAddVariant}
        />
      )}

      {imageRow && (
        <ImageManagerModal
          title="Upload Variant Images"
          existingImages={imageRow.existingImages}
          newImages={imageRow.newImages}
          resolveUrl={getImageUrl}
          onClose={() => setImageEditKey(null)}
          onSave={(existingImages, newImages) => {
            handleChangeVariant(imageRow.key, { existingImages, newImages });
            setImageEditKey(null);
          }}
        />
      )}

      {variantToDelete && (
        <BaseConfirmModal
          title="Remove Variant"
          message={`Remove "${variantToDelete.title || "this variant"}"? It is removed from the product when you click Update.`}
          confirmText="Remove"
          onConfirm={handleConfirmDelete}
          onCancel={() => setVariantToDelete(null)}
        />
      )}
    </Box>
  );
};

export default ProductEdit;
