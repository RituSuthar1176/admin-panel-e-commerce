import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Flex, Heading, Text } from "theme-ui";
import { FiCheck } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import StatusBadge from "../../components/StatusBadge";
import BaseButton from "../../components/base/BaseButton";
import BaseCheckbox from "../../components/base/BaseCheckbox";
import BasePagination from "../../components/base/BasePagination";
import PageLoader from "../../components/loaders/PageLoader";
import {
  addProductsToCollection,
  getApiErrorMessage,
  getProducts,
  productPageSize,
} from "../../api/collectionApi";
import type { Product } from "../../api/collectionApi";

const tableColumns = ["Sr. No.", "Name", "Attribute Set", "Vendor", "Status"];
const collectionListPath = "/catalog/collection";

const cellSx = {
  px: 2,
  py: "10px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

const checkboxCellSx = { ...cellSx, width: 48 } as const;

const CollectionAddProducts = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // The ticked products are kept while the user moves between pages
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fetchProducts = useCallback((pageNumber: number) => {
    setIsLoading(true);
    setErrorMessage("");

    getProducts(pageNumber)
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
  }, []);

  // Load the products on the first visit and whenever the page changes
  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const isAllOnPageSelected =
    products.length > 0 &&
    products.every((product) => selectedIds.includes(product.id));

  const toggleProduct = (productId: string, checked: boolean) => {
    setSubmitError("");
    setSelectedIds((current) => {
      if (!checked) return current.filter((item) => item !== productId);
      return current.includes(productId) ? current : [...current, productId];
    });
  };

  // The checkbox in the table header ticks or unticks every product on this page
  const togglePage = (checked: boolean) => {
    const pageIds = products.map((product) => product.id);

    setSubmitError("");
    setSelectedIds((current) =>
      checked
        ? [...new Set([...current, ...pageIds])]
        : current.filter((item) => !pageIds.includes(item)),
    );
  };

  const handleAdd = () => {
    if (selectedIds.length === 0) {
      setSubmitError("Please select at least one product.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    addProductsToCollection(id, selectedIds)
      .then(() => {
        navigate(collectionListPath, {
          state: { successMessage: "Collection added successfully." },
        });
      })
      .catch((error) => {
        setSubmitError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsSubmitting(false);
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
          Collection Products
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Collection", path: collectionListPath },
            { label: "Collection Products" },
          ]}
        />
      </Flex>

      {errorMessage && <Alert>{errorMessage}</Alert>}
      {submitError && <Alert>{submitError}</Alert>}

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
              sx={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}
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
                  products.map((product, index) => (
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
                        {(page - 1) * productPageSize + index + 1}
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
          Showing {firstEntry} to {lastEntry} of {total} entries
          {selectedIds.length > 0 && ` (${selectedIds.length} selected)`}
        </Text>
        <BasePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Flex>

      <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 3 }}>
        {/* The collection was already created in the previous step, so the user can leave without products */}
        <BaseButton
          text="Skip"
          type="button"
          variant="secondary"
          fullWidth={false}
          onClick={() =>
            navigate(collectionListPath, {
              state: { successMessage: "Collection added successfully." },
            })
          }
        />
        <BaseButton
          text="Add"
          type="button"
          fullWidth={false}
          icon={<FiCheck size={16} />}
          isLoading={isSubmitting}
          onClick={handleAdd}
        />
      </Flex>
    </Box>
  );
};

export default CollectionAddProducts;
