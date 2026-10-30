import { Box, Flex, IconButton } from "theme-ui";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import BaseCellInput from "../base/BaseCellInput";
import BaseSwitch from "../base/BaseSwitch";
import ProductImage from "../base/ProductImage";
import { getImageUrl } from "../../api/productApi";
import type {
  AttributeRef,
  EditVariantRow,
  VariantErrors,
} from "../../api/productApi";

const headerCellSx = {
  px: 2,
  py: "12px",
  fontSize: 1,
  fontWeight: 600,
  textAlign: "left",
} as const;
const cellSx = {
  px: 1,
  py: "8px",
  fontSize: 1,
  verticalAlign: "top",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

interface VariantEditTableProps {
  rows: EditVariantRow[];
  attributeColumns: AttributeRef[]; // one extra column for each attribute, such as Network or Ram
  errors: VariantErrors;
  onChange: (key: string, patch: Partial<EditVariantRow>) => void;
  onAttributeChange: (
    key: string,
    attribute: AttributeRef,
    value: string,
  ) => void;
  onEditImages: (key: string) => void;
  onDelete: (key: string) => void;
}

const VariantEditTable = ({
  rows,
  attributeColumns,
  errors,
  onChange,
  onAttributeChange,
  onEditImages,
  onDelete,
}: VariantEditTableProps) => {
  const columnCount = 8 + attributeColumns.length;

  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "border",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {/* The table scrolls sideways on small screens */}
      <Box sx={{ overflowX: "auto" }}>
        <Box
          as="table"
          sx={{
            width: "100%",
            minWidth: 1000 + attributeColumns.length * 140,
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <Box as="tr" sx={{ bg: "tableHead" }}>
              <Box as="th" sx={headerCellSx}>
                Variant
              </Box>
              <Box as="th" sx={headerCellSx}>
                SKU
              </Box>
              {attributeColumns.map((attribute) => (
                <Box
                  as="th"
                  key={attribute.id}
                  sx={{ ...headerCellSx, textTransform: "capitalize" }}
                >
                  {attribute.name}
                </Box>
              ))}
              <Box as="th" sx={headerCellSx}>
                Available Quantity
              </Box>
              <Box as="th" sx={headerCellSx}>
                On Hand Quantity
              </Box>
              <Box as="th" sx={headerCellSx}>
                Fake Price
              </Box>
              <Box as="th" sx={headerCellSx}>
                Price
              </Box>
              <Box as="th" sx={headerCellSx}>
                Status
              </Box>
              <Box as="th" sx={headerCellSx}>
                Actions
              </Box>
            </Box>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columnCount}
                  style={{
                    padding: 20,
                    fontSize: 14,
                    textAlign: "center",
                    color: "#555555",
                  }}
                >
                  No variants. Click "Add Variant" to add one.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowErrors = errors[row.key] ?? {};
                const imageCount =
                  row.existingImages.length + row.newImages.length;
                const firstImage = row.existingImages[0]
                  ? getImageUrl(row.existingImages[0])
                  : "";

                return (
                  <tr key={row.key}>
                    <Box as="td" sx={cellSx}>
                      <Flex sx={{ alignItems: "center", gap: 2 }}>
                        {/* The picture, with a pencil that opens the image popup */}
                        <Box
                          sx={{
                            position: "relative",
                            width: 40,
                            height: 40,
                            flexShrink: 0,
                          }}
                        >
                          <ProductImage
                            src={firstImage}
                            alt={row.title || "Variant"}
                            size={40}
                          />
                          <IconButton
                            type="button"
                            aria-label={`Edit images (${imageCount})`}
                            title={`Images: ${imageCount}`}
                            onClick={() => onEditImages(row.key)}
                            sx={{
                              position: "absolute",
                              top: -6,
                              right: -6,
                              width: 20,
                              height: 20,
                              p: 0,
                              color: "white",
                              bg: "primary",
                              borderRadius: "50%",
                              cursor: "pointer",
                            }}
                          >
                            <FiEdit2 size={11} />
                          </IconButton>
                        </Box>
                        <BaseCellInput
                          label="Variant"
                          value={row.title}
                          maxLength={100}
                          error={rowErrors.title}
                          onChange={(value) =>
                            onChange(row.key, { title: value })
                          }
                        />
                      </Flex>
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <BaseCellInput
                        label="SKU"
                        value={row.code}
                        maxLength={50}
                        error={rowErrors.code}
                        onChange={(value) => onChange(row.key, { code: value })}
                      />
                    </Box>

                    {attributeColumns.map((attribute) => (
                      <Box as="td" key={attribute.id} sx={cellSx}>
                        <BaseCellInput
                          label={attribute.name}
                          placeholder={`Enter ${attribute.name}`}
                          value={
                            row.attributes.find(
                              (item) => item.attributeId === attribute.id,
                            )?.value ?? ""
                          }
                          maxLength={100}
                          onChange={(value) =>
                            onAttributeChange(row.key, attribute, value)
                          }
                        />
                      </Box>
                    ))}

                    <Box as="td" sx={cellSx}>
                      <BaseCellInput
                        label="Available Quantity"
                        value={row.availableQuantity}
                        inputMode="numeric"
                        maxLength={9}
                        error={rowErrors.availableQuantity}
                        onChange={(value) =>
                          onChange(row.key, { availableQuantity: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      {/* A saved variant keeps its on hand quantity. A new variant can set it. */}
                      <BaseCellInput
                        label="On Hand Quantity"
                        value={row.onHandQuantity}
                        inputMode="numeric"
                        maxLength={9}
                        disabled={Boolean(row.id)}
                        error={rowErrors.onHandQuantity}
                        onChange={(value) =>
                          onChange(row.key, { onHandQuantity: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <BaseCellInput
                        label="Fake Price"
                        value={row.fakePrice}
                        inputMode="decimal"
                        maxLength={12}
                        error={rowErrors.fakePrice}
                        onChange={(value) =>
                          onChange(row.key, { fakePrice: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <BaseCellInput
                        label="Price"
                        value={row.price}
                        inputMode="decimal"
                        maxLength={12}
                        error={rowErrors.price}
                        onChange={(value) =>
                          onChange(row.key, { price: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <Flex sx={{ alignItems: "center", height: 34 }}>
                        <BaseSwitch
                          ariaLabel={`Status of ${row.title || "variant"}`}
                          checked={row.status === "active"}
                          label={
                            row.status === "active" ? "Active" : "Inactive"
                          }
                          onChange={(checked) =>
                            onChange(row.key, {
                              status: checked ? "active" : "inactive",
                            })
                          }
                        />
                      </Flex>
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <Flex sx={{ alignItems: "center", height: 34 }}>
                        <IconButton
                          aria-label={`Delete ${row.title || "variant"}`}
                          title="Delete"
                          onClick={() => onDelete(row.key)}
                          sx={{ cursor: "pointer", color: "error" }}
                        >
                          <FiTrash2 size={16} />
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
    </Box>
  );
};

export default VariantEditTable;
