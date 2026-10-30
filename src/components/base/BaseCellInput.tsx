import { Box, Input, Text } from "theme-ui";

interface BaseCellInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength: number;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: "text" | "numeric" | "decimal";
}

// A text box for a table cell. It looks like plain text until it is hovered or clicked.
const BaseCellInput = ({
  label,
  value,
  onChange,
  maxLength,
  error,
  placeholder,
  disabled = false,
  inputMode = "text",
}: BaseCellInputProps) => (
  <Box>
    <Input
      aria-label={label}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      sx={{
        height: 34,
        minWidth: 90,
        px: 2,
        fontSize: 1,
        borderRadius: 8,
        bg: disabled ? "activeBg" : "white",
        borderColor: error ? "error" : "border",
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

export default BaseCellInput;
