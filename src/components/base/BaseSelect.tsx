import type { SelectHTMLAttributes } from "react";
import { Box, Label, Select, Text } from "theme-ui";

export interface SelectOption {
  value: string;
  label: string;
}

interface BaseSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

const BaseSelect = ({
  label,
  options,
  error,
  id,
  ...selectProps
}: BaseSelectProps) => {
  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} <Text sx={{ color: "error", ml: 1 }}>*</Text>
      </Label>

      <Select
        id={id}
        {...selectProps}
        sx={{ borderColor: error ? "error" : undefined }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Text
        sx={{
          display: "block",
          minHeight: 20,
          mt: 1,
          fontSize: 1,
          color: "error",
        }}
      >
        {error}
      </Text>
    </Box>
  );
};

export default BaseSelect;
