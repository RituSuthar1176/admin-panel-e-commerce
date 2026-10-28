import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Flex, Heading, Select, Text } from "theme-ui";
import { FiCheck, FiX } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import StatusBadge from "../../components/StatusBadge";
import BaseButton from "../../components/base/BaseButton";
import BaseCheckbox from "../../components/base/BaseCheckbox";
import BasePagination from "../../components/base/BasePagination";
import PageLoader from "../../components/loaders/PageLoader";
import {
  addProductsToCollection,
  canListAllProducts,
  getAllProducts,
  getApiErrorMessage,
  getCollectionProductIds,
  getProducts,
  productPageSize,
  removeProductsFromCollection,
} from "../../api/collectionApi";
import type { Product } from "../../api/collectionApi";

type ProductMode = "collection" | "all";

const collectionListPath = "/catalog/collection";
const tableColumns = ["Product Name", "Attribute Set", "Vendor", "Status"];

const cellSx = {
  px: 2,
  py: "10px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

const checkboxCellSx = { ...cellSx, width: 48 } as const;

const modeOptions: { value: ProductMode; label: string }[] = [
  { value: "collection", label: "Show Collection Products" },
  ...(canListAllProducts
    ? [{ value: "all" as ProductMode, label: "Show All Products" }]
    : []),
];

const CollectionProducts = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [mode, setMode] = useState<ProductMode>("collection");
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // The products the collection had when the page opened, and the ones ticked now
  const [originalIds, setOriginalIds] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isOriginalLoading, setIsOriginalLoading] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadOriginalIds = useCallback(
    (resetSelection: boolean) => {
      setIsOriginalLoading(true);

      getCollectionProductIds(id)
        .then((ids) => {
          setOriginalIds(ids);
          if (resetSelection) setSelectedIds(ids);
        })
        .catch((error) => {
          setErrorMessage(getApiErrorMessage(error));
        })
        .finally(() => {
          setIsOriginalLoading(false);
        });
    },
    [id],
  );

  useEffect(() => {
    loadOriginalIds(true);
  }, [loadOriginalIds]);

  const fetchProducts = useCallback(
    (pageNumber: number, productMode: ProductMode) => {
      setIsLoading(true);
      setErrorMessage("");

      const request =
        productMode === "all"
          ? getAllProducts(pageNumber)
          : getProducts(id, pageNumber);

      request
        .then((result) => {
          setProducts(result.items);
          setTotal(result.total);
        })
        .catch((error) => {
          setErrorMessage(getApiErrorMessage(error));
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [id],
  );

  // Load the table on the first visit, and when the page or the dropdown changes
  useEffect(() => {
    fetchProducts(page, mode);
  }, [page, mode, fetchProducts]);

  const handleModeChange = (value: string) => {
    setMode(value === "all" ? "all" : "collection");
    setPage(1);
  };

  const isAllOnPageSelected =
    products.length > 0 &&
    products.every((product) => selectedIds.includes(product.id));

  const toggleProduct = (productId: string, checked: boolean) => {
    setSaveError("");
    setSelectedIds((current) => {
      if (!checked) return current.filter((item) => item !== productId);
      return current.includes(productId) ? current : [...current, productId];
    });
  };

  // The checkbox in the table header ticks or unticks every product on this page
  const togglePage = (checked: boolean) => {
    const pageIds = products.map((product) => product.id);

    setSaveError("");
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter((item) => !pageIds.includes(item)),
    );
  };

  const handleUpdate = () => {
    if (isOriginalLoading) return;

    const idsToAdd = selectedIds.filter(
      (productId) => !originalIds.includes(productId),
    );
    const idsToRemove = originalIds.filter(
      (productId) => !selectedIds.includes(productId),
    );

    if (idsToAdd.length === 0 && idsToRemove.length === 0) {
      setSaveError("No changes to update.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    const requests: Promise<unknown>[] = [];
    if (idsToAdd.length > 0)
      requests.push(addProductsToCollection(id, idsToAdd));
    if (idsToRemove.length > 0)
      requests.push(removeProductsFromCollection(id, idsToRemove));

    Promise.all(requests)
      .then(() => {
        navigate(collectionListPath, {
          state: {
            successMessage: "Collection products updated successfully.",
          },
        });
      })
      .catch((error) => {
        setSaveError(getApiErrorMessage(error));
        loadOriginalIds(false); // one of the two requests may have worked, so refresh what the collection holds
      })
      .finally(() => {
        setIsSaving(false);
      });
  };

  const totalPages = Math.max(1, Math.ceil(total / productPageSize));
  const firstEntry = total === 0 ? 0 : (page - 1) * productPageSize + 1;
  const lastEntry = Math.min(page * productPageSize, total);

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
          Products in Collection
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Collection", path: collectionListPath },
            { label: "Edit Collection" },
          ]}
        />
      </Flex>

      {/* The dropdown shows only when there is more than one choice */}
      {modeOptions.length > 1 && (
        <Flex sx={{ justifyContent: "flex-end", mb: 3 }}>
          <Select
            aria-label="Choose which products to show"
            value={mode}
            onChange={(event) => handleModeChange(event.target.value)}
            sx={{ width: "auto", minWidth: 220, fontSize: 1 }}
          >
            {modeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Flex>
      )}

      {errorMessage && <Alert>{errorMessage}</Alert>}
      {saveError && <Alert>{saveError}</Alert>}

      <Box
        sx={{
          bg: "white",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <PageLoader />
        ) : (
          // The table scrolls sideways on small screens
          <Box sx={{ overflowX: "auto" }}>
            <Box
              as="table"
              sx={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}
            >
              <thead>
                <Box as="tr" sx={{ bg: "tableHead" }}>
                  <Box as="th" sx={{ ...checkboxCellSx, py: "12px" }}>
                    <BaseCheckbox
                      checked={isAllOnPageSelected}
                      ariaLabel="Select all products on this page"
                      onChange={togglePage}
                    />
                  </Box>
                  {tableColumns.map((column) => (
                    <Box
                      as="th"
                      key={column}
                      sx={{ ...cellSx, py: "12px", fontWeight: 600 }}
                    >
                      {column}
                    </Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length + 1}
                      style={{
                        padding: 12,
                        fontSize: 14,
                        textAlign: "center",
                        color: "#555555",
                        borderBottom: "1px solid #e8dfd8",
                      }}
                    >
                      No products found.
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id}>
                      <Box as="td" sx={checkboxCellSx}>
                        <BaseCheckbox
                          checked={selectedIds.includes(product.id)}
                          ariaLabel={`Select ${product.name}`}
                          onChange={(checked) =>
                            toggleProduct(product.id, checked)
                          }
                        />
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {product.name}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {product.attributeSet || "-"}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {product.vendor || "-"}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        <StatusBadge isActive={product.status === "active"} />
                      </Box>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Box>
        )}
      </Box>

      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          mt: 3,
        }}
      >
        <Text sx={{ fontSize: 1 }}>
          Showing {firstEntry} to {lastEntry} of {total} entries (
          {selectedIds.length} in collection)
        </Text>
        <BasePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Flex>

      <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 3 }}>
        <BaseButton
          text="Cancel"
          type="button"
          variant="secondary"
          fullWidth={false}
          icon={<FiX size={16} />}
          onClick={() => navigate(collectionListPath)}
        />
        <BaseButton
          text="Update"
          type="button"
          fullWidth={false}
          icon={<FiCheck size={16} />}
          isLoading={isSaving}
          onClick={handleUpdate}
        />
      </Flex>
    </Box>
  );
};

export default CollectionProducts;
