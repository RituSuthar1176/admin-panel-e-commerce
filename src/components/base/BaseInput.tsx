import type { InputHTMLAttributes, ReactNode } from "react";
import { Box, Flex, Input, Label, Text } from "theme-ui";

interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string; // for example a character counter such as "0/160"
  isRequired?: boolean;
  rightElement?: ReactNode; // for the eye icon
}

const BaseInput = ({
  label,
  error,
  hint,
  isRequired = true,
  rightElement,
  id,
  ...inputProps
}: BaseInputProps) => {
  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} {isRequired && <Text sx={{ color: "error", ml: 1 }}>*</Text>}
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

      <Flex
        sx={{
          justifyContent: "space-between",
          gap: 2,
          minHeight: 20,
          mt: 1,
          fontSize: 1,
        }}
      >
        <Text sx={{ color: "error" }}>{error}</Text>
        {hint && (
          <Text sx={{ ml: "auto", flexShrink: 0, color: "muted" }}>{hint}</Text>
        )}
      </Flex>
    </Box>
  );
};

export default BaseInput;
