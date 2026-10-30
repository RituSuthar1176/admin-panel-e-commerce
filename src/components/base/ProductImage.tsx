import { useState } from 'react';
import { Flex, Text } from 'theme-ui';
import { FiImage } from 'react-icons/fi';

interface ProductImageProps {
  src: string; // an empty text means there is no picture
  alt: string;
  size: number;
}

// A picture, or a grey "no image" box when there is no picture or it cannot be loaded
const ProductImage = ({ src, alt, size }: ProductImageProps) => {
  // Remembers which address failed, so a new address is tried again
  const [failedSrc, setFailedSrc] = useState('');

  if (!src || failedSrc === src) {
    return (
      <Flex
        role="img"
        aria-label="No image available"
        sx={{
          width: size,
          height: size,
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
          flexShrink: 0,
          color: 'muted',
          bg: 'activeBg',
          borderRadius: size >= 120 ? 12 : 8,
        }}
      >
        <FiImage size={Math.round(size * 0.4)} />
        {size >= 120 && <Text sx={{ fontSize: 1, fontWeight: 600 }}>No image available</Text>}
      </Flex>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailedSrc(src)}
      style={{ objectFit: 'cover', borderRadius: size >= 120 ? 12 : 8, flexShrink: 0 }}
    />
  );
};

export default ProductImage;