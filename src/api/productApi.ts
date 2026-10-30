import axios, { isAxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

// ---------- Axios setup ----------
const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is invalid or expired, log the user out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === StatusCodes.UNAUTHORIZED) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ---------- Endpoints ----------
const listUrl = "/product/list-of-products";
const attributeSetUrl = "/product/list-of-attribute-set";
const addUrl = "/product/add-product";
const viewUrl = "/product/view-product"; // the product id is added at the end
const updateUrl = "/product/update-product"; // the product id is added at the end
const uploadUrl: string = "/common/fileUpload";
const deleteFileUrl = "/common/deleteUploadedFile";
const uploadFolderPath = "file";
const imageBaseUrl: string = "";
const statusUrl = "/product/update-product-status";
const defaultVendorId = 1;

export const productPageSize = 10;

// ---------- Types ----------
export type ProductStatus = "active" | "inactive";

export const productStatusOptions: { value: ProductStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export interface Product {
  id: string;
  name: string;
  imageUrl: string;
  vendor: string;
  status: ProductStatus;
}

export interface ProductList {
  items: Product[];
  total: number;
}

// A variant as shown on the View Product page. A missing number stays null.
export interface ProductVariantDetails {
  id: string;
  title: string;
  code: string;
  fakePrice: number | null;
  price: number | null;
  availableQuantity: number | null;
  onHandQuantity: number | null;
  imageCount: number;
  imageUrl: string; // the first image, or an empty text
}

export interface ProductDetails {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  attributeSet: string;
  vendor: string;
  status: ProductStatus;
  variants: ProductVariantDetails[];
}

export interface AttributeRef {
  id: string;
  name: string;
}

export interface AttributeSetOption {
  id: string;
  name: string;
  attributes: AttributeRef[];
}

// One row of the variant table on the Add Product screen. The numbers are kept as text while the user types.
export interface VariantRow {
  key: string;
  title: string;
  code: string;
  availableQuantity: string;
  onHandQuantity: string;
  fakePrice: string;
  price: string;
  status: ProductStatus;
  images: File[];
  attributes: { attributeId: string; name: string; value: string }[];
}

export interface ProductInput {
  attributeSetId: string;
  title: string;
  description: string;
  thumbnail: File;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  variants: VariantRow[];
}

// One row of the variant table on the Edit Product screen.
// An empty id means a new variant. Pictures are the stored file names plus the new files to upload.
export interface EditVariantRow {
  key: string;
  id: string;
  title: string;
  code: string;
  availableQuantity: string;
  onHandQuantity: string;
  fakePrice: string;
  price: string;
  status: ProductStatus;
  existingImages: string[];
  newImages: File[];
  attributes: {
    rowId: string;
    attributeId: string;
    name: string;
    value: string;
  }[];
}

export interface EditableProduct {
  id: string;
  title: string;
  description: string;
  thumbnailName: string;
  thumbnailUrl: string;
  attributeSetId: string;
  attributeSetName: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  status: ProductStatus;
  variants: EditVariantRow[];
}

export interface ProductEditInput {
  title: string;
  description: string;
  status: ProductStatus;
  thumbnailName: string; // the current thumbnail, kept when no new file is chosen
  newThumbnail: File | null;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  variants: EditVariantRow[];
  removedImages: string[]; // pictures the user removed from variants that are still in the table
}

// ---------- Variant rules (used by the variant form and both variant tables) ----------
export type VariantField =
  | "title"
  | "code"
  | "availableQuantity"
  | "onHandQuantity"
  | "fakePrice"
  | "price";
export type VariantFields = Pick<VariantRow, VariantField>;
export type VariantFieldErrors = Partial<Record<VariantField, string>>;
export type VariantErrors = Record<string, VariantFieldErrors>;

const wholeNumber = /^\d+$/;
const money = /^\d+(\.\d{1,2})?$/;

export const validateVariantRow = (row: VariantFields): VariantFieldErrors => {
  const errors: VariantFieldErrors = {};
  const title = row.title.trim();
  const code = row.code.trim();
  const fakePrice = row.fakePrice.trim();
  const price = row.price.trim();

  if (!title) errors.title = "Required.";
  else if (title.length > 100) errors.title = "Max 100 characters.";

  if (!code) errors.code = "Required.";
  else if (code.length > 50) errors.code = "Max 50 characters.";

  if (!wholeNumber.test(row.availableQuantity.trim()))
    errors.availableQuantity = "Whole number.";
  if (!wholeNumber.test(row.onHandQuantity.trim()))
    errors.onHandQuantity = "Whole number.";

  if (!money.test(fakePrice) || Number(fakePrice) <= 0)
    errors.fakePrice = "Invalid price.";

  if (!money.test(price) || Number(price) <= 0) errors.price = "Invalid price.";
  else if (!errors.fakePrice && Number(price) > Number(fakePrice))
    errors.price = "Above fake price.";

  return errors;
};

// Checks every row, and also that two rows do not share the same SKU
export const validateVariants = <T extends VariantFields & { key: string }>(
  rows: T[],
): VariantErrors => {
  const errors: VariantErrors = {};
  const usedCodes = new Set<string>();

  rows.forEach((row) => {
    const rowErrors = validateVariantRow(row);
    const code = row.code.trim().toLowerCase();

    if (code && !rowErrors.code) {
      if (usedCodes.has(code)) rowErrors.code = "Duplicate SKU.";
      else usedCodes.add(code);
    }

    if (Object.keys(rowErrors).length > 0) errors[row.key] = rowErrors;
  });

  return errors;
};

// ---------- Reading the backend response: CONFIRM the field names in the Network tab ----------
type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const listKeys = [
  "rows",
  "items",
  "list",
  "products",
  "attribute_sets",
  "result",
  "data",
];
const totalKeys = [
  "total",
  "count",
  "totalCount",
  "totalRecords",
  "totalItems",
];
const fileKeys = [
  "filename",
  "fileName",
  "file_name",
  "file",
  "image",
  "path",
  "url",
  "name",
];
const variantKeys = [
  "variants",
  "product_variants",
  "productVariants",
  "variant",
];

// Reads a text value. Accepts a string, a number, or an object that has a name.
const readText = (record: UnknownRecord, keys: string[]): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value) return value;
    if (typeof value === "number") return String(value);
    if (isRecord(value) && typeof value.name === "string") return value.name;
  }
  return "";
};

// Reads a number. Accepts a number or a text such as "2500". Returns null when it is missing.
const readNumber = (record: UnknownRecord, keys: string[]): number | null => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (
      typeof value === "string" &&
      value.trim() !== "" &&
      !Number.isNaN(Number(value))
    )
      return Number(value);
  }
  return null;
};

// Finds the array of rows, however deep the backend put it
const findRows = (value: unknown, depth = 0): UnknownRecord[] => {
  if (Array.isArray(value)) return value.filter(isRecord);
  if (!isRecord(value) || depth > 3) return [];

  for (const key of listKeys) {
    const rows = findRows(value[key], depth + 1);
    if (rows.length > 0) return rows;
  }

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested)) return nested.filter(isRecord);
  }

  return [];
};

// Finds the total count, however deep the backend put it
const findTotal = (value: unknown, depth = 0): number | undefined => {
  if (!isRecord(value) || depth > 3) return undefined;

  for (const key of totalKeys) {
    const found = value[key];
    if (typeof found === "number") return found;
    if (
      typeof found === "string" &&
      found !== "" &&
      !Number.isNaN(Number(found))
    )
      return Number(found);
  }

  for (const nested of Object.values(value)) {
    const found = findTotal(nested, depth + 1);
    if (found !== undefined) return found;
  }

  return undefined;
};

// A single record may be at the top level or under "data"
const unwrapRecord = (value: unknown): UnknownRecord => {
  if (!isRecord(value)) return {};
  return isRecord(value.data) ? value.data : value;
};

// The variants of a product, under whichever name the backend uses
const readVariantList = (raw: UnknownRecord): UnknownRecord[] => {
  const list = variantKeys
    .map((key) => raw[key])
    .find((value): value is unknown[] => Array.isArray(value));

  return list ? list.filter(isRecord) : [];
};

const mapStatus = (status: unknown): ProductStatus => {
  const value = String(status).toLowerCase();
  return value === "active" || value === "true" || value === "1"
    ? "active"
    : "inactive";
};

// Finds the vendor's name, whether it is a text, a nested object, or split into first and last name
const readVendorName = (raw: UnknownRecord): string => {
  const vendorKeys = [
    "vendor",
    "vendor_name",
    "vendorName",
    "auth_vendor",
    "seller",
    "vendor_details",
    "user",
  ];

  for (const key of vendorKeys) {
    const value = raw[key];

    if (typeof value === "string" && value) return value;

    if (isRecord(value)) {
      const name = readText(value, [
        "name",
        "full_name",
        "fullName",
        "business_name",
        "company_name",
      ]);
      if (name) return name;

      const fullName = [
        readText(value, ["first_name", "firstName"]),
        readText(value, ["last_name", "lastName"]),
      ]
        .filter(Boolean)
        .join(" ");
      if (fullName) return fullName;
    }
  }

  return "";
};

// Turns a stored file name into an address the browser can show. Empty when it cannot be built.
const toImageUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  if (!value || !imageBaseUrl) return "";
  return `${imageBaseUrl.replace(/\/+$/, "")}/${value.replace(/^\/+/, "")}`;
};

export const getImageUrl = toImageUrl;

// The file names of a variant's pictures. Accepts a text, a list of texts, or a list of objects.
const readImageNames = (raw: UnknownRecord): string[] => {
  for (const key of [
    "product_variant_image",
    "product_variant_images",
    "variant_images",
    "images",
    "image",
  ]) {
    const value = raw[key];
    const items = Array.isArray(value) ? value : value ? [value] : [];

    const names = items
      .map((item) =>
        typeof item === "string"
          ? item
          : isRecord(item)
            ? readText(item, fileKeys)
            : "",
      )
      .filter(Boolean);

    if (names.length > 0) return names;
  }

  return [];
};

// The attribute values of one variant, such as Network or Ram
const readVariantAttributes = (
  raw: UnknownRecord,
): EditVariantRow["attributes"] => {
  for (const key of [
    "attributes",
    "variant_attributes",
    "product_variant_attributes",
  ]) {
    const list = raw[key];
    if (!Array.isArray(list)) continue;

    const attributes = list.filter(isRecord).map((item) => {
      const inner = isRecord(item.attribute) ? item.attribute : null;

      return {
        rowId: readText(item, ["id", "_id"]),
        attributeId:
          readText(item, ["attribute_id", "attributeId"]) ||
          (inner ? readText(inner, ["_id", "id"]) : ""),
        name: inner
          ? readText(inner, ["name"])
          : readText(item, ["attribute_name", "name"]),
        value: readText(item, ["attribute_value", "value"]),
      };
    });

    const valid = attributes.filter((attribute) => attribute.attributeId);
    if (valid.length > 0) return valid;
  }

  return [];
};

const mapProduct = (raw: UnknownRecord): Product => ({
  id: readText(raw, ["_id", "id"]),
  name: readText(raw, ["title", "name", "product_name"]),
  imageUrl: toImageUrl(
    readText(raw, ["product_image", "thumbnail", "thumbnail_image", "image"]),
  ),
  vendor: readVendorName(raw),
  status: mapStatus(raw.status),
});

const mapVariantDetails = (raw: UnknownRecord): ProductVariantDetails => {
  const imageNames = readImageNames(raw);

  return {
    id: readText(raw, ["_id", "id"]),
    title: readText(raw, ["title", "name", "variant_name"]),
    code: readText(raw, ["code", "sku"]),
    fakePrice: readNumber(raw, ["fake_price", "fakePrice"]),
    price: readNumber(raw, ["price"]),
    availableQuantity: readNumber(raw, [
      "available_quantity",
      "availableQuantity",
    ]),
    onHandQuantity: readNumber(raw, ["on_hand_quantity", "onHandQuantity"]),
    imageCount: imageNames.length,
    imageUrl: imageNames.length > 0 ? toImageUrl(imageNames[0]) : "",
  };
};

const mapEditVariant = (raw: UnknownRecord, index: number): EditVariantRow => {
  const id = readText(raw, ["_id", "id"]);

  return {
    key: id ? `existing-${id}` : `existing-row-${index}`,
    id,
    title: readText(raw, ["title", "name", "variant_name"]),
    code: readText(raw, ["code", "sku"]),
    availableQuantity: String(
      readNumber(raw, ["available_quantity", "availableQuantity"]) ?? "",
    ),
    onHandQuantity: String(
      readNumber(raw, ["on_hand_quantity", "onHandQuantity"]) ?? "",
    ),
    fakePrice: String(readNumber(raw, ["fake_price", "fakePrice"]) ?? ""),
    price: String(readNumber(raw, ["price"]) ?? ""),
    status: mapStatus(raw.status),
    existingImages: readImageNames(raw),
    newImages: [],
    attributes: readVariantAttributes(raw),
  };
};

// The attributes that belong to an attribute set (used by the variant form and the variant table)
const readAttributeRefs = (raw: UnknownRecord): AttributeRef[] => {
  for (const key of ["attributes", "attribute_list", "attributeList"]) {
    const value = raw[key];
    if (!Array.isArray(value)) continue;

    const refs = value
      .filter(isRecord)
      .map((item) => {
        const inner = isRecord(item.attribute) ? item.attribute : item;
        return {
          id:
            readText(inner, ["_id", "id", "attribute_id"]) ||
            readText(item, ["attribute_id"]),
          name: readText(inner, ["name", "attribute_name"]),
        };
      })
      .filter((ref) => ref.id);

    if (refs.length > 0) return refs;
  }

  return [];
};

const mapAttributeSet = (raw: UnknownRecord): AttributeSetOption => ({
  id: readText(raw, ["_id", "id"]),
  name: readText(raw, ["name", "attribute_set_name", "title"]),
  attributes: readAttributeRefs(raw),
});

// ---------- Error message for the user ----------
export const getApiErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : "Something went wrong. Please try again.";
  }

  if (!error.response)
    return "Cannot reach the server. Check your internet and try again.";

  const { status, data } = error.response;

  if (status >= StatusCodes.INTERNAL_SERVER_ERROR)
    return "Server error. Please try again later.";

  return String(data?.message || "Something went wrong. Please try again.");
};

// ---------- Image upload ----------
// Uploads one image and returns the file name the backend stored it under

const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("files", file, file.name);

  const response = await api.post<unknown>(uploadUrl, formData);

  console.log("Upload response:", response.data);

  const data = response.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  if (data && typeof data === "object") {
    const result = data as Record<string, unknown>;

    const candidates = [
      result.fileName,
      result.filename,
      result.file_name,
      result.path,
      result.url,
      result.message,
      result.data,
      result.files,
    ];

    for (const candidate of candidates) {
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate;
      }

      if (Array.isArray(candidate) && candidate.length > 0) {
        const first = candidate[0];

        if (typeof first === "string" && first.trim()) {
          return first;
        }

        if (first && typeof first === "object") {
          const item = first as Record<string, unknown>;
          const name =
            item.fileName ??
            item.filename ??
            item.file_name ??
            item.path ??
            item.url;

          if (typeof name === "string" && name.trim()) {
            return name;
          }
        }
      }

      if (candidate && typeof candidate === "object") {
        const nested = candidate as Record<string, unknown>;
        const name =
          nested.fileName ??
          nested.filename ??
          nested.file_name ??
          nested.path ??
          nested.url;

        if (typeof name === "string" && name.trim()) {
          return name;
        }
      }
    }
  }

  throw new Error(
    "Upload succeeded, but the backend response contains no recognized filename.",
  );
};

const uploadImages = (files: File[]): Promise<string[]> =>
  Promise.all(files.map(uploadImage));

// Deletes uploaded files from the server. It never fails the screen, because it only cleans up.
const deleteFiles = (names: string[]): Promise<void> => {
  if (names.length === 0) return Promise.resolve();

  const generatedFileNames = names.map((name) => name.split("/").pop() ?? name);

  return api
    .delete(deleteFileUrl, {
      data: { generatedFileNames, folderPath: uploadFolderPath },
    })
    .then(() => undefined)
    .catch(() => undefined);
};

// ---------- API calls ----------
export const getProducts = (page: number) => {
  // Newest first. Search and status are left out because this page has no search or filter.
  const body = {
    sortValue: "desc",
    sortKey: "id",
    page,
    limit: productPageSize,
  };

  return api.post<unknown>(listUrl, body).then((response): ProductList => {
    const rawItems = findRows(response.data);
    const total = findTotal(response.data) ?? rawItems.length;

    return { items: rawItems.map(mapProduct), total };
  });
};

// One product with its variants, for the View Product screen
export const getProductDetails = (productId: string) => {
  return api
    .get<unknown>(`${viewUrl}/${encodeURIComponent(productId)}`)
    .then((response): ProductDetails => {
      const raw = unwrapRecord(response.data);

      return {
        id: readText(raw, ["_id", "id"]),
        name: readText(raw, ["title", "name", "product_name"]),
        description: readText(raw, ["description"]),
        imageUrl: toImageUrl(
          readText(raw, [
            "product_image",
            "thumbnail",
            "thumbnail_image",
            "image",
          ]),
        ),
        attributeSet: readText(raw, [
          "attribute_set",
          "attributeSet",
          "attribute_set_name",
        ]),
        vendor: readVendorName(raw),
        status: mapStatus(raw.status),
        variants: readVariantList(raw).map(mapVariantDetails),
      };
    });
};

// One product with everything the Edit Product screen needs
export const getProductForEdit = (productId: string) => {
  return api
    .get<unknown>(`${viewUrl}/${encodeURIComponent(productId)}`)
    .then((response): EditableProduct => {
      const raw = unwrapRecord(response.data);
      const attributeSet = isRecord(raw.attribute_set)
        ? raw.attribute_set
        : null;
      const thumbnailName = readText(raw, [
        "product_image",
        "thumbnail",
        "thumbnail_image",
        "image",
      ]);

      return {
        id: readText(raw, ["_id", "id"]),
        title: readText(raw, ["title", "name", "product_name"]),
        description: readText(raw, ["description"]),
        thumbnailName,
        thumbnailUrl: toImageUrl(thumbnailName),
        attributeSetId:
          readText(raw, ["attribute_set_id", "attributeSetId"]) ||
          (attributeSet ? readText(attributeSet, ["_id", "id"]) : ""),
        attributeSetName: readText(raw, [
          "attribute_set",
          "attributeSet",
          "attribute_set_name",
        ]),
        metaTitle: readText(raw, ["meta_title", "metaTitle"]),
        metaKeywords: readText(raw, [
          "meta_key",
          "meta_keywords",
          "metaKeywords",
        ]),
        metaDescription: readText(raw, ["meta_description", "metaDescription"]),
        status: mapStatus(raw.status),
        variants: readVariantList(raw).map(mapEditVariant),
      };
    });
};

// The attribute sets for the "Attribute" dropdown
export const getAttributeSets = () => {
  return api
    .get<unknown>(attributeSetUrl)
    .then((response): AttributeSetOption[] =>
      findRows(response.data).map(mapAttributeSet),
    );
};

// Uploads the images first, then creates the product with the stored file names
export const createProduct = (input: ProductInput) => {
  const metaTitle = input.metaTitle.trim();
  const metaKeywords = input.metaKeywords.trim();
  const metaDescription = input.metaDescription.trim();

  return Promise.all([
    uploadImage(input.thumbnail),
    Promise.all(input.variants.map((variant) => uploadImages(variant.images))),
  ]).then(([productImage, variantImages]) => {
    const body = {
      auth_vendor_id: defaultVendorId,
      attribute_set_id: Number(input.attributeSetId),
      title: input.title.trim(),
      description: input.description.trim(),
      status: "active",
      product_image: productImage,
      ...(metaTitle ? { meta_title: metaTitle } : {}),
      ...(metaKeywords ? { meta_key: metaKeywords } : {}),
      ...(metaDescription ? { meta_description: metaDescription } : {}),
      variants: input.variants.map((variant, index) => ({
        title: variant.title.trim(),
        available_quantity: Number(variant.availableQuantity),
        on_hand_quantity: Number(variant.onHandQuantity),
        code: variant.code.trim(),
        fake_price: Number(variant.fakePrice),
        price: Number(variant.price),
        product_variant_image: variantImages[index],
        status: variant.status,
        attributes: variant.attributes
          .filter((attribute) => attribute.value.trim())
          .map((attribute) => ({
            attribute_id: Number(attribute.attributeId),
            attribute_value: attribute.value.trim(),
          })),
      })),
    };

    return api.post(addUrl, body);
  });
};

// Uploads the new images, saves the product, then cleans up the files that are no longer used.
// If anything fails, the files uploaded in this attempt are deleted again.
export const updateProduct = async (
  productId: string,
  input: ProductEditInput,
): Promise<void> => {
  const uploadedNames: string[] = [];

  const upload = async (file: File) => {
    const name = await uploadImage(file);
    uploadedNames.push(name);
    return name;
  };

  const metaTitle = input.metaTitle.trim();
  const metaKeywords = input.metaKeywords.trim();
  const metaDescription = input.metaDescription.trim();

  try {
    const thumbnailName = input.newThumbnail
      ? await upload(input.newThumbnail)
      : input.thumbnailName;

    const variantImages = await Promise.all(
      input.variants.map(async (variant) => {
        const newNames = await Promise.all(variant.newImages.map(upload));
        return [...variant.existingImages, ...newNames];
      }),
    );

    const body = {
      title: input.title.trim(),
      description: input.description.trim(),
      status: input.status,
      product_image: thumbnailName,
      ...(metaTitle ? { meta_title: metaTitle } : {}),
      ...(metaKeywords ? { meta_key: metaKeywords } : {}),
      ...(metaDescription ? { meta_description: metaDescription } : {}),
      variants: input.variants.map((variant, index) => ({
        ...(variant.id ? { id: Number(variant.id) } : {}),
        title: variant.title.trim(),
        available_quantity: Number(variant.availableQuantity),
        on_hand_quantity: Number(variant.onHandQuantity),
        code: variant.code.trim(),
        fake_price: Number(variant.fakePrice),
        price: Number(variant.price),
        status: variant.status,
        attributes: variant.attributes
          .filter((attribute) => attribute.value.trim())
          .map((attribute) => ({
            ...(attribute.rowId ? { id: Number(attribute.rowId) } : {}),
            attribute_id: Number(attribute.attributeId),
            attribute_value: attribute.value.trim(),
          })),
        product_variant_image: variantImages[index],
      })),
    };

    await api.put(`${updateUrl}/${encodeURIComponent(productId)}`, body);
  } catch (error) {
    await deleteFiles(uploadedNames);
    throw error;
  }

  // The product was saved, so the files it no longer uses can go
  const replacedThumbnail =
    input.newThumbnail && input.thumbnailName ? [input.thumbnailName] : [];
  await deleteFiles([...input.removedImages, ...replacedThumbnail]);
};
// Changes only the status of one product
export const updateProductStatus = (
  productId: string,
  status: ProductStatus,
) => {
  return api.put(`${statusUrl}/${encodeURIComponent(productId)}`, { status });
};
