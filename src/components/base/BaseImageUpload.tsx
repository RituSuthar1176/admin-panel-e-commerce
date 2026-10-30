import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, DragEvent, KeyboardEvent } from "react";
import { Box, Flex, IconButton, Label, Text } from "theme-ui";
import { FiUploadCloud, FiX } from "react-icons/fi";

const allowedTypes = ["image/jpeg", "image/png"];
const allowedExtensions = ["jpg", "jpeg", "png"];

interface BaseImageUploadProps {
  id: string;
  label: string;
  files: File[];
  onChange: (files: File[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMb?: number;
  isRequired?: boolean;
  error?: string;
}

const hasAllowedExtension = (fileName: string) =>
  allowedExtensions.includes(fileName.split(".").pop()?.toLowerCase() ?? "");

const getFileKey = (file: File) =>
  `${file.name}-${file.size}-${file.lastModified}`;

const BaseImageUpload = ({
  id,
  label,
  files,
  onChange,
  multiple = false,
  maxFiles = 5,
  maxSizeMb = 2,
  isRequired = false,
  error,
}: BaseImageUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");
  const [previews, setPreviews] = useState<
    { key: string; name: string; url: string }[]
  >([]);

  // Build the small previews, and free the memory when the files change or the screen closes
  useEffect(() => {
    const next = files.map((file) => ({
      key: getFileKey(file),
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);

    return () => next.forEach((preview) => URL.revokeObjectURL(preview.url));
  }, [files]);

  const addFiles = (incoming: File[]) => {
    const accepted: File[] = [];
    const problems: string[] = [];

    // Only JPG, JPEG and PNG, and only up to the size limit
    incoming.forEach((file) => {
      if (
        !allowedTypes.includes(file.type) ||
        !hasAllowedExtension(file.name)
      ) {
        problems.push(
          `${file.name}: only JPG, JPEG and PNG files are allowed.`,
        );
      } else if (file.size > maxSizeMb * 1024 * 1024) {
        problems.push(`${file.name}: must be ${maxSizeMb} MB or smaller.`);
      } else {
        accepted.push(file);
      }
    });

    let next = files;

    if (multiple) {
      const knownKeys = new Set(files.map(getFileKey));
      const merged = [
        ...files,
        ...accepted.filter((file) => !knownKeys.has(getFileKey(file))),
      ];

      if (merged.length > maxFiles)
        problems.push(`You can upload up to ${maxFiles} images.`);
      next = merged.slice(0, maxFiles);
    } else if (accepted.length > 0) {
      next = [accepted[0]];
    }

    setFileError(problems.join(" "));
    if (next !== files) onChange(next);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = ""; // so the same file can be chosen again
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  };

  const message = error || fileError;

  return (
    <Box mb={2}>
      <Label htmlFor={id}>
        {label} {isRequired && <Text sx={{ color: "error", ml: 1 }}>*</Text>}
      </Label>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: "none" }}
      />

      <Flex
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDragOver={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        sx={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          minHeight: 110,
          p: 3,
          textAlign: "center",
          fontSize: 1,
          cursor: "pointer",
          bg: isDragging ? "activeBg" : "transparent",
          border: "1px dashed",
          borderColor: message ? "error" : isDragging ? "primary" : "#d9a99b",
          borderRadius: 12,
        }}
      >
        <FiUploadCloud size={22} />
        <Text>Click to upload or drag and drop</Text>
        <Text sx={{ color: "muted", fontSize: "12px" }}>
          JPG, JPEG or PNG, up to {maxSizeMb} MB each
        </Text>
      </Flex>

      {previews.length > 0 && (
        <Flex sx={{ flexWrap: "wrap", gap: 2, mt: 2 }}>
          {previews.map((preview, index) => (
            <Box
              key={preview.key}
              sx={{ position: "relative", width: 72, height: 72 }}
            >
              <img
                src={preview.url}
                alt={preview.name}
                width={72}
                height={72}
                style={{
                  objectFit: "cover",
                  borderRadius: 8,
                  border: "1px solid #e8dfd8",
                }}
              />
              <IconButton
                type="button"
                aria-label={`Remove ${preview.name}`}
                onClick={() =>
                  onChange(files.filter((_, fileIndex) => fileIndex !== index))
                }
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  width: 22,
                  height: 22,
                  p: 0,
                  bg: "white",
                  color: "error",
                  borderRadius: "50%",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
                }}
              >
                <FiX size={14} />
              </IconButton>
            </Box>
          ))}
        </Flex>
      )}

      <Text
        sx={{
          display: "block",
          minHeight: 20,
          mt: 1,
          fontSize: 1,
          color: "error",
        }}
      >
        {message}
      </Text>
    </Box>
  );
};

export default BaseImageUpload;
