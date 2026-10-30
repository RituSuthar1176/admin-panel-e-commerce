import { useNavigate, useParams } from 'react-router-dom';
import { Box, Flex, Heading, Text } from 'theme-ui';
import { FiArrowLeft } from 'react-icons/fi';
import Breadcrumb from '../../components/Breadcrumb';
import BaseButton from '../../components/base/BaseButton';

interface CollectionPlaceholderProps {
  title: string;
}

// Temporary screen. Replace it with the real page when its API is ready.
const CollectionPlaceholder = ({ title }: CollectionPlaceholderProps) => {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Heading as="h1" sx={{ fontSize: 3 }}>{title}</Heading>
        <Breadcrumb
          items={[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Catalog' },
            { label: 'Collection', path: '/catalog/collection' },
            { label: title },
          ]}
        />
      </Flex>

      <Box sx={{ p: 4, bg: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}>
        <Text sx={{ display: 'block', mb: 1 }}>This screen will be built in the next step.</Text>
        {id && <Text sx={{ display: 'block', mb: 3, color: 'muted', wordBreak: 'break-all' }}>Collection id: {id}</Text>}

        <BaseButton
          text="Back to Collections"
          type="button"
          variant="secondary"
          fullWidth={false}
          icon={<FiArrowLeft size={16} />}
          onClick={() => navigate('/catalog/collection')}
        />
      </Box>
    </Box>
  );
};

export default CollectionPlaceholder;