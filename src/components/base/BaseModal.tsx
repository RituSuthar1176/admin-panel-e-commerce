import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Box, Flex, Heading, IconButton } from 'theme-ui';
import { FiX } from 'react-icons/fi';

interface BaseModalProps {
  title: string;
  onClose: () => void;
  maxWidth?: number;
  children: ReactNode;
}

const BaseModal = ({ title, onClose, maxWidth = 440, children }: BaseModalProps) => {
  // Close with the Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <Flex sx={{ position: 'fixed', inset: 0, zIndex: 100, p: 3, bg: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' }}>
      <Box
        role="dialog"
        aria-modal="true"
        aria-label={title}
        sx={{ width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto', p: 4, bg: 'background', borderRadius: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }}
      >
        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Heading as="h2" sx={{ fontSize: 3 }}>{title}</Heading>
          <IconButton aria-label="Close" onClick={onClose}>
            <FiX size={22} />
          </IconButton>
        </Flex>
        {children}
      </Box>
    </Flex>
  );
};

export default BaseModal;