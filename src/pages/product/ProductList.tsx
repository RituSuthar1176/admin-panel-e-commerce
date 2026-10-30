import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, Box, Flex, Heading, IconButton, Text } from "theme-ui";
import {
  FiCheck,
  FiCheckCircle,
  FiEdit2,
  FiEye,
  FiXCircle,
} from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import StatusBadge from "../../components/StatusBadge";
import BaseButton from "../../components/base/BaseButton";
import BaseConfirmModal from "../../components/base/BaseConfirmModal";
import BasePagination from "../../components/base/BasePagination";
import ProductImage from "../../components/base/ProductImage";
import PageLoader from "../../components/loaders/PageLoader";
import {
  getApiErrorMessage,
  getProducts,
  productPageSize,
  updateProductStatus,
} from "../../api/productApi";
import type { Product, ProductStatus } from "../../api/productApi";

const tableColumns = [
  "Sr. No.",
  "Thumbnail Image",
  "Product Name",
  "Status",
  "Vendor",
  "Actions",
];

const cellSx = {
  px: 2,
  py: "10px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

const successMessageDuration = 3000; // milliseconds
const productListPath = "/product";

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Status change state
  const [productToChange, setProductToChange] = useState<Product | null>(null);
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

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

  // Load the list on the first visit and whenever the page changes
  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  // Show a message sent by another screen (for example after adding a product), then clear it
  useEffect(() => {
    const message = (location.state as { successMessage?: string } | null)
      ?.successMessage;

    if (message) {
      setSuccessMessage(message);
      navigate(location.pathname, { replace: true, state: null }); // a refresh will not show it again
    }
  }, [location, navigate]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (!successMessage) return;

    const timerId = setTimeout(
      () => setSuccessMessage(""),
      successMessageDuration,
    );

    // Cancel the timer if the page closes or a new message arrives
    return () => clearTimeout(timerId);
  }, [successMessage]);

  const handleView = (product: Product) =>
    navigate(`${productListPath}/${encodeURIComponent(product.id)}`);
  const handleEdit = (product: Product) =>
    navigate(`${productListPath}/${encodeURIComponent(product.id)}/edit`);

  // The status the product will have after the change
  const getNextStatus = (product: Product): ProductStatus =>
    product.status === "active" ? "inactive" : "active";

  const openStatusModal = (product: Product) => {
    setStatusError("");
    setProductToChange(product);
  };

  const closeStatusModal = () => {
    if (!isChangingStatus) setProductToChange(null);
  };

  const handleChangeStatus = () => {
    if (!productToChange) return;

    const nextStatus = getNextStatus(productToChange);
    const changedId = productToChange.id;

    setIsChangingStatus(true);
    setStatusError("");

    updateProductStatus(changedId, nextStatus)
      .then(() => {
        // Update the row on screen right away, without loading the whole list again
        setProducts((current) =>
          current.map((item) =>
            item.id === changedId ? { ...item, status: nextStatus } : item,
          ),
        );
        setProductToChange(null);
        setSuccessMessage("Product status updated successfully.");
      })
      .catch((error) => {
        setStatusError(getApiErrorMessage(error)); // shown inside the popup
      })
      .finally(() => {
        setIsChangingStatus(false);
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
          Product
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product" },
          ]}
        />
      </Flex>

      <Box sx={{ mb: 3 }}>
        <BaseButton
          text="Add Product"
          type="button"
          fullWidth={false}
          onClick={() => navigate(`${productListPath}/add`)}
        />
      </Box>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

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
              sx={{ width: "100%", minWidth: 700, borderCollapse: "collapse" }}
            >
              <thead>
                <Box as="tr" sx={{ bg: "tableHead" }}>
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
                      colSpan={tableColumns.length}
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
                  products.map((product, index) => {
                    const isActive = product.status === "active";
                    const nextLabel = isActive
                      ? "Make inactive"
                      : "Make active";

                    return (
                      <tr key={product.id}>
                        <Box as="td" sx={cellSx}>
                          {(page - 1) * productPageSize + index + 1}
                        </Box>
                        <Box as="td" sx={cellSx}>
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                            size={40}
                          />
                        </Box>
                        <Box as="td" sx={cellSx}>
                          {product.name}
                        </Box>
                        <Box as="td" sx={cellSx}>
                          <StatusBadge isActive={isActive} />
                        </Box>
                        <Box as="td" sx={cellSx}>
                          {product.vendor || "-"}
                        </Box>
                        <Box as="td" sx={cellSx}>
                          <Flex sx={{ gap: 1, alignItems: "center" }}>
                            <IconButton
                              aria-label={`View ${product.name}`}
                              title="View"
                              onClick={() => handleView(product)}
                              sx={{ cursor: "pointer" }}
                            >
                              <FiEye size={16} />
                            </IconButton>
                            <IconButton
                              aria-label={`Edit ${product.name}`}
                              title="Edit"
                              onClick={() => handleEdit(product)}
                              sx={{ cursor: "pointer" }}
                            >
                              <FiEdit2 size={16} />
                            </IconButton>
                            <IconButton
                              aria-label={`${nextLabel}: ${product.name}`}
                              title={nextLabel}
                              onClick={() => openStatusModal(product)}
                              sx={{ cursor: "pointer" }}
                            >
                              {isActive ? (
                                <FiCheckCircle size={16} />
                              ) : (
                                <FiXCircle size={16} />
                              )}
                            </IconButton>
                          </Flex>
                        </Box>
                      </tr>
                    );
                  })
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
        </Text>
        <BasePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Flex>

      {productToChange && (
        <BaseConfirmModal
          title={`Change status for ${productToChange.name}`}
          message={
            <>
              Are you sure you want to change the status of{" "}
              <strong>"{productToChange.name}"</strong> to{" "}
              <strong>
                {getNextStatus(productToChange) === "active"
                  ? "Active"
                  : "Inactive"}
              </strong>
              ?
            </>
          }
          confirmText="Update"
          confirmIcon={<FiCheck size={16} />}
          confirmVariant="primary"
          isLoading={isChangingStatus}
          errorMessage={statusError}
          onConfirm={handleChangeStatus}
          onCancel={closeStatusModal}
        />
      )}
    </Box>
  );
};

export default ProductList;
