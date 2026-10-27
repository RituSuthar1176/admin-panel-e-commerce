import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Box, Flex, IconButton, Label, Text } from "theme-ui";
import { FiCheck, FiChevronDown, FiX } from "react-icons/fi";
import ComponentLoader from "../loaders/ComponentLoader";
import type { SelectOption } from "./BaseSelect";

interface BaseMultiSelectProps {
  id: string;
  label: string;
  options: SelectOption[];
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
}

const BaseMultiSelect = ({
  id,
  label,
  options,
  value,
  onChange,
  onBlur,
  placeholder = "Select",
  error,
  isLoading = false,
}: BaseMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close the list when the user clicks outside it
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onBlur]);

  const toggleList = () => {
    if (!isLoading) setIsOpen((current) => !current);
  };

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((item) => item !== optionValue)
        : [...value, optionValue],
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleList();
    }
    if (event.key === "Escape") setIsOpen(false);
  };

  const selectedOptions = value
    .map((item) => options.find((option) => option.value === item))
    .filter((option): option is SelectOption => Boolean(option));

  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} <Text sx={{ color: "error", ml: 1 }}>*</Text>
      </Label>

      <Box ref={wrapperRef} sx={{ position: "relative" }}>
        {/* The box that shows the chips */}
        <Flex
          id={id}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          tabIndex={0}
          onClick={toggleList}
          onKeyDown={handleKeyDown}
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            minHeight: 40,
            px: 3,
            py: 1,
            bg: "white",
            border: "1px solid",
            borderColor: error ? "error" : isOpen ? "primary" : "#dcd5ce",
            borderRadius: 20,
            cursor: isLoading ? "wait" : "pointer",
          }}
        >
          <Flex sx={{ flexWrap: "wrap", gap: 1, flex: 1 }}>
            {isLoading && <Text sx={{ color: "muted" }}>Loading...</Text>}
            {!isLoading && selectedOptions.length === 0 && (
              <Text sx={{ color: "muted" }}>{placeholder}</Text>
            )}

            {selectedOptions.map((option) => (
              <Flex
                key={option.value}
                sx={{
                  alignItems: "center",
                  gap: 1,
                  pl: 2,
                  pr: 1,
                  py: "2px",
                  bg: "#ead3cb",
                  borderRadius: 12,
                  fontSize: 1,
                }}
              >
                {option.label}
                <IconButton
                  type="button"
                  aria-label={`Remove ${option.label}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleOption(option.value);
                  }}
                  sx={{ width: 20, height: 20, p: 0 }}
                >
                  <FiX size={14} />
                </IconButton>
              </Flex>
            ))}
          </Flex>

          {isLoading ? (
            <ComponentLoader size={16} />
          ) : (
            <FiChevronDown size={18} />
          )}
        </Flex>

        {/* The list of options */}
        {isOpen && (
          <Box
            role="listbox"
            aria-multiselectable="true"
            sx={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              right: 0,
              zIndex: 50,
              maxHeight: 220,
              overflowY: "auto",
              py: 1,
              bg: "white",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            }}
          >
            {options.length === 0 && (
              <Text sx={{ display: "block", px: 3, py: 2, color: "muted" }}>
                No attributes available.
              </Text>
            )}

            {options.map((option) => {
              const isSelected = value.includes(option.value);

              return (
                <Flex
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(option.value)}
                  sx={{
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                    cursor: "pointer",
                    color: isSelected ? "primary" : "text",
                    "&:hover": { bg: "activeBg" },
                  }}
                >
                  {option.label}
                  {isSelected && <FiCheck size={16} />}
                </Flex>
              );
            })}
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

export default BaseMultiSelect;
