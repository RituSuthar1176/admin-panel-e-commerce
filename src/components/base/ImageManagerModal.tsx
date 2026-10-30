import { useState } from "react";
import { Box, Flex, IconButton, Text } from "theme-ui";
import { FiCheck, FiX } from "react-icons/fi";
import BaseModal from "./BaseModal";
import BaseButton from "./BaseButton";
import BaseImageUpload from "./BaseImageUpload";
import ProductImage from "./ProductImage";

interface ImageManagerModalProps {
  title: string;
  existingImages: string[]; // pictures already saved on the server (file names)
  newImages: File[]; // pictures chosen but not uploaded yet
  resolveUrl: (name: string) => string;
  maxFiles?: number;
  onClose: () => void;
  onSave: (existingImages: string[], newImages: File[]) => void;
}

const ImageManagerModal = ({
  title,
  existingImages,
  newImages,
  resolveUrl,
  maxFiles = 5,
  onClose,
  onSave,
}: ImageManagerModalProps) => {
  // Changes are kept here until Save is clicked, so Cancel leaves everything as it was
  const [draftExisting, setDraftExisting] = useState(existingImages);
  const [draftNew, setDraftNew] = useState(newImages);

  const remaining = Math.max(0, maxFiles - draftExisting.length);

  return (
    <BaseModal title={title} onClose={onClose} maxWidth={520}>
      {remaining > 0 ? (
        <BaseImageUpload
          id="imageManager"
          label="Images"
          multiple
          maxFiles={remaining}
          files={draftNew}
          onChange={setDraftNew}
        />
      ) : (
        <Text sx={{ display: "block", mb: 3, fontSize: 1, color: "muted" }}>
          You can have up to {maxFiles} images. Remove one to add another.
        </Text>
      )}

      {draftExisting.length > 0 && (
        <Box mb={3}>
          <Text sx={{ display: "block", mb: 2, fontSize: 1, fontWeight: 500 }}>
            Current images
          </Text>
          <Flex sx={{ flexWrap: "wrap", gap: 3 }}>
            {draftExisting.map((name, index) => (
              <Box
                key={`${name}-${index}`}
                sx={{ position: "relative", width: 72, height: 72 }}
              >
                <ProductImage src={resolveUrl(name)} alt={name} size={72} />
                <IconButton
                  type="button"
                  aria-label={`Remove image ${index + 1}`}
                  onClick={() =>
                    setDraftExisting(
                      draftExisting.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    )
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
        </Box>
      )}

      <Flex sx={{ justifyContent: "flex-end", gap: 3, mt: 3 }}>
        <BaseButton
          text="Cancel"
          type="button"
          variant="secondary"
          fullWidth={false}
          icon={<FiX size={16} />}
          onClick={onClose}
        />
        <BaseButton
          text="Save"
          type="button"
          fullWidth={false}
          icon={<FiCheck size={16} />}
          onClick={() => onSave(draftExisting, draftNew)}
        />
      </Flex>
    </BaseModal>
  );
};

export default ImageManagerModal;
