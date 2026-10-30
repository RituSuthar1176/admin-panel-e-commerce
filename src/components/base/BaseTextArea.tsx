import type { TextareaHTMLAttributes } from "react";
import { Box, Flex, Label, Text, Textarea } from "theme-ui";

interface BaseTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  isRequired?: boolean;
}

const BaseTextArea = ({
  label,
  error,
  hint,
  isRequired = false,
  id,
  ...textAreaProps
}: BaseTextAreaProps) => {
  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} {isRequired && <Text sx={{ color: "error", ml: 1 }}>*</Text>}
      </Label>

      <Textarea
        id={id}
        {...textAreaProps}
        sx={{
          bg: "white",
          borderRadius: 12,
          borderColor: error ? "error" : "#dcd5ce",
          px: 3,
          resize: "vertical",
          "&:focus": { borderColor: "primary", outline: "none" },
        }}
      />

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

export default BaseTextArea;
