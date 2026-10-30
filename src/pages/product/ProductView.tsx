import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Flex, Heading, Text } from "theme-ui";
import { FiArrowLeft } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import StatusBadge from "../../components/StatusBadge";
import BaseButton from "../../components/base/BaseButton";
import DetailCard, { DetailRow } from "../../components/base/DetailCard";
import ProductImage from "../../components/base/ProductImage";
import PageLoader from "../../components/loaders/PageLoader";
import { getApiErrorMessage, getProductDetails } from "../../api/productApi";
import type { ProductDetails } from "../../api/productApi";

const productListPath = "/product";
const variantColumns = [
  "Images",
  "Variant",
  "SKU",
  "Fake Price",
  "Price",
  "Available Quantity",
  "On Hand Quantity",
];

const cellSx = {
  px: 2,
  py: "12px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

// 3000 becomes ₹3,000, and 1499.99 becomes ₹1,499.99
const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const formatPrice = (value: number | null) =>
  value === null ? "-" : priceFormatter.format(value);
const formatNumber = (value: number | null) =>
  value === null ? "-" : String(value);

const ProductView = () => {
  const navigate = useNavigate();
  const { id = "" } = useParams();

  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Load the product when the screen opens, or when the id in the address changes
  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setErrorMessage("");

    getProductDetails(id)
      .then((result) => {
        if (isActive) setProduct(result);
      })
      .catch((error) => {
        if (isActive) setErrorMessage(getApiErrorMessage(error));
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [id]);

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
          View Product
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Product", path: productListPath },
            { label: "View Product" },
          ]}
        />
      </Flex>

      {errorMessage && <Alert>{errorMessage}</Alert>}

      {/* Product information */}
      <DetailCard title="Product Information">
        {isLoading ? (
          <PageLoader />
        ) : (
          product && (
            <Flex
              sx={{
                flexDirection: ["column", null, "row"],
                alignItems: ["stretch", null, "flex-start"],
                gap: 4,
                p: 3,
              }}
            >
              <Flex
                sx={{
                  justifyContent: "center",
                  width: [undefined, null, 220],
                  flexShrink: 0,
                }}
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  size={180}
                />
              </Flex>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <DetailRow label="Product ID">
                  {product.id ? `#${product.id}` : "-"}
                </DetailRow>
                <DetailRow label="Product Name">
                  {product.name || "-"}
                </DetailRow>
                <DetailRow label="Product Description">
                  {product.description || "-"}
                </DetailRow>
                <DetailRow label="Attribute Set">
                  {product.attributeSet || "-"}
                </DetailRow>
                <DetailRow label="Vendor Name">
                  {product.vendor || "-"}
                </DetailRow>
                <DetailRow label="Product Status">
                  <StatusBadge isActive={product.status === "active"} />
                </DetailRow>
              </Box>
            </Flex>
          )
        )}
      </DetailCard>

      {/* Product variants */}
      <DetailCard title="Product Variants">
        {isLoading ? (
          <PageLoader />
        ) : (
          // The table scrolls sideways on small screens
          <Box sx={{ overflowX: "auto", p: 3 }}>
            <Box
              as="table"
              sx={{ width: "100%", minWidth: 760, borderCollapse: "collapse" }}
            >
              <thead>
                <Box as="tr" sx={{ bg: "tableHead" }}>
                  {variantColumns.map((column) => (
                    <Box
                      as="th"
                      key={column}
                      sx={{ ...cellSx, fontWeight: 600 }}
                    >
                      {column}
                    </Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {!product || product.variants.length === 0 ? (
                  <tr>
                    <td
                      colSpan={variantColumns.length}
                      style={{
                        padding: 12,
                        fontSize: 14,
                        textAlign: "center",
                        color: "#555555",
                      }}
                    >
                      No variants found.
                    </td>
                  </tr>
                ) : (
                  product.variants.map((variant, index) => (
                    <tr key={variant.id || `${variant.code}-${index}`}>
                      <Box as="td" sx={cellSx}>
                        {/* The number badge shows how many pictures the variant has */}
                        <Box
                          sx={{ position: "relative", width: 48, height: 48 }}
                        >
                          <ProductImage
                            src={variant.imageUrl}
                            alt={variant.title}
                            size={48}
                          />
                          {variant.imageCount > 0 && (
                            <Text
                              aria-label={`${variant.imageCount} images`}
                              sx={{
                                position: "absolute",
                                right: -6,
                                bottom: -6,
                                minWidth: 20,
                                height: 20,
                                px: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                lineHeight: "20px",
                                textAlign: "center",
                                color: "white",
                                bg: "primary",
                                borderRadius: 10,
                              }}
                            >
                              {variant.imageCount}
                            </Text>
                          )}
                        </Box>
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {variant.title || "-"}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {variant.code || "-"}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatPrice(variant.fakePrice)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatPrice(variant.price)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatNumber(variant.availableQuantity)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatNumber(variant.onHandQuantity)}
                      </Box>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Box>
        )}
      </DetailCard>

      <BaseButton
        text="Back"
        type="button"
        variant="secondary"
        fullWidth={false}
        icon={<FiArrowLeft size={16} />}
        onClick={() => navigate(productListPath)}
      />
    </Box>
  );
};

export default ProductView;
