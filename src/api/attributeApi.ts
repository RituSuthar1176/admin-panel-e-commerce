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

// ---------- Types ----------
export interface Attribute {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttributeList {
  items: Attribute[];
  total: number;
}

// ---------- Endpoints ----------
export const attributePageSize = 10;

const listUrl = "/attribute/list-Of-attributes"; // copy the exact spelling from Swagger
const addUrl = "/attribute/add-attribute";
const updateUrl = "/attribute/update-attribute";
const deleteUrl = "/attribute/delete-attribute"; // CONFIRM in Swagger. The id is added at the end.

// ---------- Reading the backend response ----------
interface RawAttribute {
  _id?: string;
  id?: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface RawListResponse {
  data?:
    | RawAttribute[]
    | {
        rows?: RawAttribute[];
        items?: RawAttribute[];
        total?: number;
        count?: number;
      };
  total?: number;
  count?: number;
}

const mapAttribute = (raw: RawAttribute): Attribute => ({
  id: String(raw._id ?? raw.id ?? ""),
  name: raw.name,
  createdAt: raw.createdAt,
  updatedAt: raw.updatedAt,
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
export const getAttributes = (page: number) => {
  return api
    .post<RawListResponse>(listUrl, { page, limit: attributePageSize })
    .then((response): AttributeList => {
      const body = response.data;
      const payload = body.data;
      const meta = Array.isArray(payload) ? undefined : payload;
      const rawItems = Array.isArray(payload)
        ? payload
        : (meta?.rows ?? meta?.items ?? []);
      const total =
        meta?.total ??
        meta?.count ??
        body.total ??
        body.count ??
        rawItems.length;

      return { items: rawItems.map(mapAttribute), total };
    });
};

export const createAttribute = (name: string) => {
  return api.post(addUrl, { name });
};

export const updateAttribute = (id: string, name: string) => {
  return api.put(`${updateUrl}/${id}`, { name });
};

export const deleteAttribute = (id: string) => {
  return api.delete(`${deleteUrl}/${id}`); // CONFIRM the method (DELETE, PUT or POST) in Swagger
};
