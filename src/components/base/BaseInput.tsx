import type { InputHTMLAttributes, ReactNode } from "react";
import { Box, Input, Label, Text } from "theme-ui";

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  rightElement?: ReactNode; // for the eye icon
}

const BaseInput = ({
  label,
  error,
  rightElement,
  id,
  ...inputProps
}: BaseInputProps) => {
  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} <Text sx={{ color: "error", ml: 1 }}>*</Text>
      </Label>

      <Box sx={{ position: "relative" }}>
        <Input
          id={id}
          {...inputProps}
          sx={{
            borderColor: error ? "error" : undefined,
            pr: rightElement ? 5 : 3,
          }}
        />
        {rightElement && (
          <Box
            sx={{
              position: "absolute",
              right: 2,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {rightElement}
          </Box>
        )}
      </Box>

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

export default BaseInput;
