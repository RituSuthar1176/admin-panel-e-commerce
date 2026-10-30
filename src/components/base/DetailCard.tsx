import type { ReactNode } from 'react';
import { Box, Flex, Text } from 'theme-ui';

interface DetailCardProps {
  title: string;
  children: ReactNode;
}

// A white card with a small uppercase title, like "PRODUCT INFORMATION"
const DetailCard = ({ title, children }: DetailCardProps) => (
  <Box sx={{ mb: 3, bg: 'white', borderRadius: 12, border: '1px solid', borderColor: 'border', overflow: 'hidden' }}>
    <Text
      as="h2"
      sx={{ m: 0, px: 3, py: 3, fontSize: 1, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'muted', borderBottom: '1px solid', borderColor: 'border' }}
    >
      {title}
    </Text>
    {children}
  </Box>
);

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

// One line of the card: a label on the left and its value on the right (stacked on phones)
export const DetailRow = ({ label, children }: DetailRowProps) => (
  <Flex
    sx={{
      flexDirection: ['column', 'row'],
      gap: [1, 3],
      py: 3,
      borderBottom: '1px solid',
      borderColor: 'border',
      '&:last-of-type': { borderBottom: 'none' },
    }}
  >
    <Text sx={{ width: [undefined, '34%'], flexShrink: 0, fontWeight: 600, color: 'muted' }}>{label} :</Text>
    <Box sx={{ minWidth: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{children}</Box>
  </Flex>
);

export default DetailCard;