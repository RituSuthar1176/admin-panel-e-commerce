import { Box, Flex, Text } from "theme-ui";

interface RadioOption {
  value: string;
  label: string;
}

interface BaseRadioGroupProps {
  label: string;
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

const BaseRadioGroup = ({
  label,
  name,
  options,
  value,
  onChange,
  onBlur,
  error,
}: BaseRadioGroupProps) => {
  return (
    <Box as="fieldset" sx={{ border: "none", p: 0, m: 0, mb: 2, minWidth: 0 }}>
      <Text as="legend" sx={{ p: 0, mb: 1, fontSize: 1, fontWeight: 500 }}>
        {label} <Text sx={{ color: "error", ml: 1 }}>*</Text>
      </Text>

      <Flex sx={{ gap: 4, flexWrap: "wrap" }}>
        {options.map((option) => (
          <Box
            key={option.value}
            as="label"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 2,
              cursor: "pointer",
              fontSize: 1,
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              onBlur={onBlur}
              style={{
                width: 18,
                height: 18,
                margin: 0,
                accentColor: "#8b4533",
                cursor: "pointer",
              }}
            />
            {option.label}
          </Box>
        ))}
      </Flex>

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

export default BaseRadioGroup;
