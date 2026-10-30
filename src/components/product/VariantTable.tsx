import { Box, Flex, IconButton, Input, Select, Text } from "theme-ui";
import { FiTrash2 } from "react-icons/fi";
import { productStatusOptions } from "../../api/productApi";
import type {
  ProductStatus,
  VariantErrors,
  VariantRow,
} from "../../api/productApi";

const tableColumns = [
  "Variant",
  "SKU",
  "Available Quantity",
  "On Hand Quantity",
  "Fake Price",
  "Price",
  "Status",
  "Actions",
];

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

interface CellInputProps {
  label: string;
  value: string;
  error?: string;
  inputMode?: "text" | "numeric" | "decimal";
  maxLength: number;
  onChange: (value: string) => void;
}

// A text box that looks like plain text until it is hovered or clicked
const CellInput = ({
  label,
  value,
  error,
  inputMode = "text",
  maxLength,
  onChange,
}: CellInputProps) => (
  <Box>
    <Input
      aria-label={label}
      value={value}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        height: 34,
        minWidth: 90,
        px: 2,
        fontSize: 1,
        borderRadius: 8,
        borderColor: error ? "error" : "transparent",
        "&:hover": { borderColor: error ? "error" : "border" },
        "&:focus": { borderColor: error ? "error" : "primary" },
      }}
    />
    {error && (
      <Text
        sx={{
          display: "block",
          mt: "2px",
          px: 1,
          fontSize: "11px",
          color: "error",
        }}
      >
        {error}
      </Text>
    )}
  </Box>
);

interface VariantTableProps {
  rows: VariantRow[];
  errors: VariantErrors;
  onChange: (key: string, patch: Partial<VariantRow>) => void;
  onDelete: (key: string) => void;
}

const VariantTable = ({
  rows,
  errors,
  onChange,
  onDelete,
}: VariantTableProps) => {
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
          sx={{ width: "100%", minWidth: 920, borderCollapse: "collapse" }}
        >
          <thead>
            <Box as="tr" sx={{ bg: "tableHead" }}>
              {tableColumns.map((column) => (
                <Box as="th" key={column} sx={headerCellSx}>
                  {column}
                </Box>
              ))}
            </Box>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColumns.length}
                  style={{
                    padding: 20,
                    fontSize: 14,
                    textAlign: "center",
                    color: "#555555",
                  }}
                >
                  No variants added yet. Click "Add Variant" to add one.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowErrors = errors[row.key] ?? {};

                return (
                  <tr key={row.key}>
                    <Box as="td" sx={cellSx}>
                      <CellInput
                        label="Variant"
                        value={row.title}
                        maxLength={100}
                        error={rowErrors.title}
                        onChange={(value) =>
                          onChange(row.key, { title: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <CellInput
                        label="SKU"
                        value={row.code}
                        maxLength={50}
                        error={rowErrors.code}
                        onChange={(value) => onChange(row.key, { code: value })}
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <CellInput
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
                      <CellInput
                        label="On Hand Quantity"
                        value={row.onHandQuantity}
                        inputMode="numeric"
                        maxLength={9}
                        error={rowErrors.onHandQuantity}
                        onChange={(value) =>
                          onChange(row.key, { onHandQuantity: value })
                        }
                      />
                    </Box>
                    <Box as="td" sx={cellSx}>
                      <CellInput
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
                      <CellInput
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
                      <Select
                        aria-label="Status"
                        value={row.status}
                        onChange={(event) =>
                          onChange(row.key, {
                            status: event.target.value as ProductStatus,
                          })
                        }
                        sx={{
                          height: 34,
                          minWidth: 100,
                          fontSize: 1,
                          borderRadius: 8,
                          borderColor: "transparent",
                          "&:hover": { borderColor: "border" },
                        }}
                      >
                        {productStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
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

export default VariantTable;
