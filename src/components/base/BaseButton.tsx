import type { ReactNode } from "react";
import { Button } from "theme-ui";
import ComponentLoader from "../loaders/ComponentLoader";

interface BaseButtonProps {
  text: string;
  isLoading?: boolean;
  type?: "submit" | "button";
  variant?: "primary" | "secondary" | "danger";
  fullWidth?: boolean;
  icon?: ReactNode;
  onClick?: () => void;
}

const BaseButton = ({
  text,
  isLoading = false,
  type = "submit",
  variant = "primary",
  fullWidth = true,
  icon,
  onClick,
}: BaseButtonProps) => {
  return (
    <Button
      type={type}
      variant={variant}
      disabled={isLoading}
      onClick={onClick}
      sx={{
        width: fullWidth ? "100%" : "auto",
        px: fullWidth ? undefined : 4,
        py: fullWidth ? undefined : "10px", // medium size when the button is not full width
        fontSize: fullWidth ? undefined : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      {isLoading ? (
        <ComponentLoader
          color={variant === "secondary" ? "primary" : "white"}
        />
      ) : (
        <>
          {icon}
          {text}
        </>
      )}
    </Button>
  );
};

export default BaseButton;
