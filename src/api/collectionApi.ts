import axios, { isAxiosError } from "axios";
import { StatusCodes } from "http-status-codes";

// ---------- Axios setup ----------
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
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
const listUrl = "/collection/list-of-collection";
const treeUrl = "/collection/collection-tree";
const createUrl = "/collection/create-collection";
const viewUrl = "/collection/view-collection"; // the collection id is added at the end
const updateUrl = "/collection/update-collection"; // the collection id is added at the end
const productListUrl = "/collection/list-of-products"; // the collection id is added at the end
const addProductsUrl = "/collection/add-products"; // the collection id is added at the end
const removeProductsUrl = "/collection/remove-products"; // the collection id is added at the end
const allProductsUrl: string = ""; // FILL IN: the endpoint that lists EVERY product (for "Show All Products")

// "Show All Products" appears only after allProductsUrl is filled in
export const canListAllProducts = allProductsUrl !== "";

export const collectionPageSize = 10;
export const productPageSize = 10;

// ---------- Types ----------
export type CollectionStatus = "active" | "inactive";

export const collectionStatusOptions: {
  value: CollectionStatus;
  label: string;
}[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export interface Collection {
  id: string;
  name: string;
  path: string;
  status: CollectionStatus;
  createdAt: string;
}

export interface CollectionList {
  items: Collection[];
  total: number;
}

// One node of the parent collection tree
export interface CollectionOption {
  id: string;
  name: string;
  children: CollectionOption[];
}

export interface CollectionPayload {
  name: string;
  status: CollectionStatus;
  parentIds: string[]; // the form keeps a list. Only the first one is sent (see toParentBody).
}

export interface CollectionDetails {
  id: string;
  name: string;
  path: string;
  parentIds: string[];
  parentName: string;
  status: CollectionStatus;
}

export interface Product {
  id: string;
  name: string;
  attributeSet: string;
  vendor: string;
  status: CollectionStatus;
}

export interface ProductList {
  items: Product[];
  total: number;
}

// ---------- Reading the backend response ----------
type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const listKeys = [
  "rows",
  "items",
  "list",
  "collections",
  "products",
  "tree",
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
const childKeys = [
  "children",
  "sub_collections",
  "subCollections",
  "child_collections",
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

// Reads a list of ids. Accepts one id, a list of ids, or a list of objects that hold an id.
const readIdList = (record: UnknownRecord, keys: string[]): string[] => {
  for (const key of keys) {
    const value = record[key];
    const items = Array.isArray(value)
      ? value
      : value === null || value === undefined
        ? []
        : [value];

    const ids = items
      .map((item) =>
        isRecord(item)
          ? readText(item, ["_id", "id"])
          : typeof item === "string" || typeof item === "number"
            ? String(item)
            : "",
      )
      .filter(Boolean);

    if (ids.length > 0) return ids;
  }
  return [];
};

// Reads the names of the parents, joined with commas
const readParentNames = (record: UnknownRecord): string => {
  const parents = ["parents", "parent_collections", "parent"]
    .map((key) => record[key])
    .find((value) => value !== undefined && value !== null);
  const items = Array.isArray(parents) ? parents : parents ? [parents] : [];

  const names = items
    .map((item) =>
      isRecord(item)
        ? readText(item, ["name"])
        : typeof item === "string"
          ? item
          : "",
    )
    .filter(Boolean);

  return names.length > 0
    ? names.join(", ")
    : readText(record, ["parent_name", "parentName", "parent_collection"]);
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

// Finds the id of the newly created record in the response
const findId = (value: unknown, depth = 0): string => {
  if (!isRecord(value) || depth > 3) return "";

  const direct = readText(value, [
    "_id",
    "id",
    "collection_id",
    "collectionId",
  ]);
  if (direct) return direct;

  for (const nested of Object.values(value)) {
    const found = findId(nested, depth + 1);
    if (found) return found;
  }

  return "";
};

// A single record may be at the top level or under "data"
const unwrapRecord = (value: unknown): UnknownRecord => {
  if (!isRecord(value)) return {};
  return isRecord(value.data) ? value.data : value;
};

const mapStatus = (status: unknown): CollectionStatus => {
  const value = String(status).toLowerCase();
  return value === "active" || value === "true" || value === "1"
    ? "active"
    : "inactive";
};

const mapCollection = (raw: UnknownRecord): Collection => ({
  id: readText(raw, ["_id", "id"]),
  name: readText(raw, ["name"]),
  path: readText(raw, ["collection_path", "collectionPath", "path", "slug"]),
  status: mapStatus(raw.status),
  createdAt: readText(raw, ["createdAt", "created_at"]),
});

// Finds the vendor's name, whether it is a text, a nested object, or split into first and last name
const readVendorName = (raw: UnknownRecord): string => {
  const vendorKeys = [
    "vendor",
    "vendor_name",
    "vendorName",
    "seller",
    "seller_name",
    "vendor_details",
    "vendorDetails",
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
        "businessName",
        "company_name",
        "store_name",
      ]);
      if (name) return name;

      const fullName = [
        readText(value, ["first_name", "firstName"]),
        readText(value, ["last_name", "lastName"]),
      ]
        .filter(Boolean)
        .join(" ");
      if (fullName) return fullName;

      const email = readText(value, ["email"]);
      if (email) return email;
    }
  }

  return "";
};

const mapProduct = (raw: UnknownRecord): Product => ({
  id: readText(raw, ["_id", "id"]),
  name: readText(raw, ["name", "product_name", "title"]),
  attributeSet: readText(raw, [
    "attribute_set",
    "attributeSet",
    "attribute_set_name",
  ]),
  vendor: readVendorName(raw),
  status: mapStatus(raw.status),
});

// ---------- Parent collection tree ----------
const mapOption = (raw: UnknownRecord): CollectionOption => {
  const children = childKeys
    .flatMap((key) => (Array.isArray(raw[key]) ? (raw[key] as unknown[]) : []))
    .filter(isRecord)
    .map(mapOption);

  return {
    id: readText(raw, ["_id", "id"]),
    name: readText(raw, ["name"]),
    children,
  };
};

// A tree that already has children stays as it is. A flat list is nested using each item's parent id.
const buildOptionTree = (rows: UnknownRecord[]): CollectionOption[] => {
  const entries = rows.map((raw) => ({
    option: mapOption(raw),
    parentId: readText(raw, ["parent_id", "parentId"]),
  }));
  const optionsById = new Map(entries.map(({ option }) => [option.id, option]));
  const roots: CollectionOption[] = [];

  entries.forEach(({ option, parentId }) => {
    const parent = parentId ? optionsById.get(parentId) : undefined;

    if (parent && parent !== option) {
      if (!parent.children.some((child) => child.id === option.id))
        parent.children.push(option);
    } else {
      roots.push(option);
    }
  });

  return roots;
};

// ---------- Request body ----------
// The backend accepts ONE parent as a number, or null when no parent is ticked.
// If the backend later accepts several parents, change this one function.
const toParentBody = (parentIds: string[]) => ({
  parent_id: parentIds.length > 0 ? Number(parentIds[0]) : null,
});

// ---------- Error message for the user ----------
export const getApiErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return "Something went wrong. Please try again.";

  if (!error.response)
    return "Cannot reach the server. Check your internet and try again.";

  const { status, data } = error.response;

  if (status >= StatusCodes.INTERNAL_SERVER_ERROR)
    return "Server error. Please try again later.";

  return String(data?.message || "Something went wrong. Please try again.");
};

// ---------- API calls ----------
export const getCollections = (page: number) => {
  // Newest first. Search and status are left out because this page has no search or filter.
  const body = {
    sortValue: "desc",
    sortKey: "id",
    page,
    limit: collectionPageSize,
  };

  return api.post<unknown>(listUrl, body).then((response): CollectionList => {
    const rawItems = findRows(response.data);
    const total = findTotal(response.data) ?? rawItems.length;

    return { items: rawItems.map(mapCollection), total };
  });
};

// The collection tree for the "Parent Collection" checkboxes
export const getCollectionOptions = () => {
  return api
    .get<unknown>(treeUrl)
    .then((response): CollectionOption[] =>
      buildOptionTree(findRows(response.data)),
    );
};

// Creates the collection and returns its new id (an empty string if the response has none)
export const createCollection = ({
  name,
  status,
  parentIds,
}: CollectionPayload) => {
  const body = { name, ...toParentBody(parentIds), status };

  return api
    .post<unknown>(createUrl, body)
    .then((response): string => findId(response.data));
};

// Details of one collection, for the View and Edit screens
export const getCollectionDetails = (collectionId: string) => {
  return api
    .get<unknown>(`${viewUrl}/${encodeURIComponent(collectionId)}`)
    .then((response): CollectionDetails => {
      const raw = unwrapRecord(response.data);

      return {
        id: readText(raw, ["_id", "id"]),
        name: readText(raw, ["name"]),
        path: readText(raw, [
          "collection_path",
          "collectionPath",
          "path",
          "slug",
        ]),
        parentIds: readIdList(raw, [
          "parent_ids",
          "parentIds",
          "parent_id",
          "parentId",
          "parents",
          "parent",
        ]),
        parentName: readParentNames(raw),
        status: mapStatus(raw.status),
      };
    });
};

// Updates a collection
export const updateCollection = (
  collectionId: string,
  { name, status, parentIds }: CollectionPayload,
) => {
  const body = { name, ...toParentBody(parentIds), status };

  return api.put(`${updateUrl}/${encodeURIComponent(collectionId)}`, body);
};

// Products of a collection (also used by the selection screen). CONFIRM the body fields in Swagger.
export const getProducts = (collectionId: string, page: number) => {
  const body = {
    sortValue: "desc",
    sortKey: "id",
    page,
    limit: productPageSize,
  };

  return api
    .post<unknown>(
      `${productListUrl}/${encodeURIComponent(collectionId)}`,
      body,
    )
    .then((response): ProductList => {
      const rawItems = findRows(response.data);
      const total = findTotal(response.data) ?? rawItems.length;

      return { items: rawItems.map(mapProduct), total };
    });
};

// Every product, for "Show All Products". CONFIRM the body fields in Swagger.
export const getAllProducts = (page: number) => {
  const body = {
    sortValue: "desc",
    sortKey: "id",
    page,
    limit: productPageSize,
  };

  return api
    .post<unknown>(allProductsUrl, body)
    .then((response): ProductList => {
      const rawItems = findRows(response.data);
      const total = findTotal(response.data) ?? rawItems.length;

      return { items: rawItems.map(mapProduct), total };
    });
};

// The ids of ALL products already in a collection (every page), to work out what changed on Update
export const getCollectionProductIds = (
  collectionId: string,
): Promise<string[]> => {
  const pageLimit = 100;
  const maxPages = 50; // a safety stop
  const collected: string[] = [];

  const loadPage = (page: number): Promise<string[]> =>
    api
      .post<unknown>(`${productListUrl}/${encodeURIComponent(collectionId)}`, {
        sortValue: "desc",
        sortKey: "id",
        page,
        limit: pageLimit,
      })
      .then((response) => {
        const rows = findRows(response.data);
        const total = findTotal(response.data) ?? rows.length;

        collected.push(
          ...rows.map((raw) => readText(raw, ["_id", "id"])).filter(Boolean),
        );

        const hasMore =
          rows.length > 0 && collected.length < total && page < maxPages;
        return hasMore ? loadPage(page + 1) : [...new Set(collected)];
      });

  return loadPage(1);
};

// Adds the selected products to a collection. The backend wants an array of numbers.
export const addProductsToCollection = (
  collectionId: string,
  productIds: string[],
) => {
  return api.post(`${addProductsUrl}/${encodeURIComponent(collectionId)}`, {
    product_ids: productIds.map(Number),
  });
};

// Removes products from a collection. The backend wants an array of numbers.
export const removeProductsFromCollection = (
  collectionId: string,
  productIds: string[],
) => {
  return api.post(`${removeProductsUrl}/${encodeURIComponent(collectionId)}`, {
    product_ids: productIds.map(Number),
  });
};
