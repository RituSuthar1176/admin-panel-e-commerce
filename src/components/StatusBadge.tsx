import { Text } from 'theme-ui';

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <Text
    sx={{
      display: 'inline-block',
      px: 2,
      py: '2px',
      borderRadius: 6,
      fontSize: '12px',
      color: isActive ? 'success' : 'error',
      bg: isActive ? '#e8f5e9' : '#fdecea',
    }}
  >
    {isActive ? 'active' : 'inactive'}
  </Text>
);

export default StatusBadge;