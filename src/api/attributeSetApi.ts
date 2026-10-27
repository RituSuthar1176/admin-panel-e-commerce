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
const listUrl = "/attribute/list-of-attribute-set";
const addUrl = "/attribute/add-attribute-set";
const updateUrl = "/attribute/update-attribute-set"; // CONFIRM in Swagger. It was "/attribute/update-attribute", the Attribute update path.
const attributeOptionsUrl = "/attribute/list-Of-attributes";

export const attributeSetPageSize = 10;

// ---------- Types ----------
export type AttributeSetStatus = "active" | "inactive";

export const statusOptions: { value: AttributeSetStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export interface AttributeSet {
  id: string;
  name: string;
  status: AttributeSetStatus;
  attributeIds: string[]; // strings inside the UI, converted to numbers when sending
  createdAt: string;
  updatedAt: string;
}

export interface AttributeSetList {
  items: AttributeSet[];
  total: number;
}

export interface AttributeSetPayload {
  name: string;
  status: AttributeSetStatus;
  attributeIds: string[];
}

export interface AttributeOption {
  value: string;
  label: string;
}

// ---------- Reading the backend response ----------
type RawId = string | number;
type RawAttributeRef = RawId | { _id?: RawId; id?: RawId };

interface RawAttributeSet {
  _id?: string;
  id?: string;
  name: string;
  status?: string | boolean | number;
  attribute_id?: RawAttributeRef[]; // the field name used when adding
  attributes?: RawAttributeRef[]; // another common name
  createdAt: string;
  updatedAt: string;
}

interface RawAttribute {
  _id?: string;
  id?: string;
  name: string;
}

interface RawListResponse<T> {
  data?: T[] | { rows?: T[]; items?: T[]; total?: number; count?: number };
  total?: number;
  count?: number;
}

// Works for common list shapes: an array, or { rows/items, total }
const readList = <T>(body: RawListResponse<T>) => {
  const payload = body.data;
  const meta = Array.isArray(payload) ? undefined : payload;
  const rawItems = Array.isArray(payload) ? payload : (meta?.rows ?? meta?.items ?? []);
  const total = meta?.total ?? meta?.count ?? body.total ?? body.count ?? rawItems.length;

  return { rawItems, total };
};

const mapStatus = (status: RawAttributeSet["status"]): AttributeSetStatus => {
  const value = String(status).toLowerCase();
  return value === "active" || value === "true" || value === "1" ? "active" : "inactive";
};

// A reference can be a plain id or an object that holds the id
const mapAttributeId = (attribute: RawAttributeRef): string => {
  const id = typeof attribute === "object" ? (attribute._id ?? attribute.id) : attribute;
  return id === undefined ? "" : String(id);
};

const mapAttributeSet = (raw: RawAttributeSet): AttributeSet => ({
  id: String(raw._id ?? raw.id ?? ""),
  name: raw.name,
  status: mapStatus(raw.status),
  attributeIds: (raw.attribute_id ?? raw.attributes ?? []).map(mapAttributeId).filter(Boolean),
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
});

// ---------- Request body ----------
// The backend wants an array of numbers, so the ids are converted here, in one place.
const toRequestBody = ({ name, status, attributeIds }: AttributeSetPayload) => ({
  name,
  status,
  attribute_id: attributeIds.map(Number),
});

// ---------- Error message for the user ----------
export const getApiErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return "Something went wrong. Please try again.";

  if (!error.response) return "Cannot reach the server. Check your internet and try again.";

  const { status, data } = error.response;

  if (status >= StatusCodes.INTERNAL_SERVER_ERROR) return "Server error. Please try again later.";

  return String(data?.message || "Something went wrong. Please try again.");
};

// ---------- API calls ----------
export const getAttributeSets = (page: number) => {
  return api
    .post<RawListResponse<RawAttributeSet>>(listUrl, { page, limit: attributeSetPageSize })
    .then((response): AttributeSetList => {
      const { rawItems, total } = readList(response.data);
      return { items: rawItems.map(mapAttributeSet), total };
    });
};

// Attributes for the dropdown (they come from the Attribute module)
export const getAttributeOptions = () => {
  return api
    .post<RawListResponse<RawAttribute>>(attributeOptionsUrl, { page: 1, limit: 100 })
    .then((response): AttributeOption[] => {
      const { rawItems } = readList(response.data);
      return rawItems.map((raw) => ({ value: String(raw._id ?? raw.id ?? ""), label: raw.name }));
    });
};

export const createAttributeSet = (payload: AttributeSetPayload) => {
  return api.post(addUrl, toRequestBody(payload));
};

export const updateAttributeSet = (id: string, payload: AttributeSetPayload) => {
  return api.put(`${updateUrl}/${id}`, toRequestBody(payload));
};