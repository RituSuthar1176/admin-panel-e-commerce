import { Flex } from "theme-ui";

interface BaseSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  label?: string;
}

// An on/off toggle, for example Active / Inactive
const BaseSwitch = ({
  checked,
  onChange,
  ariaLabel,
  label,
}: BaseSwitchProps) => (
  <Flex sx={{ alignItems: "center", gap: 2, fontSize: 1 }}>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 36,
        height: 20,
        padding: 0,
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        background: checked ? "#8b4533" : "#c8c0b8",
        transition: "background 0.15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 18 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.15s",
        }}
      />
    </button>
    {label}
  </Flex>
);

export default BaseSwitch;
