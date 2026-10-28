import { Box } from "theme-ui";

interface BaseCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  ariaLabel?: string;
}

const BaseCheckbox = ({
  checked,
  onChange,
  label,
  ariaLabel,
}: BaseCheckboxProps) => {
  return (
    <Box
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
        type="checkbox"
        checked={checked}
        aria-label={ariaLabel ?? label}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          width: 18,
          height: 18,
          margin: 0,
          accentColor: "#8b4533",
          cursor: "pointer",
        }}
      />
      {label}
    </Box>
  );
};

export default BaseCheckbox;
