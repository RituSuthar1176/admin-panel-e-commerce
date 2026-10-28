import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, Flex, Heading, Text } from 'theme-ui';
import { FiArrowLeft } from 'react-icons/fi';
import Breadcrumb from '../../components/Breadcrumb';
import StatusBadge from '../../components/StatusBadge';
import BaseButton from '../../components/base/BaseButton';
import BasePagination from '../../components/base/BasePagination';
import PageLoader from '../../components/loaders/PageLoader';
import { getApiErrorMessage, getCollectionDetails, getProducts, productPageSize } from '../../api/collectionApi';
import type { CollectionDetails, Product } from '../../api/collectionApi';

const collectionListPath = '/catalog/collection';
const tableColumns = ['Sr. No.', 'Product Name', 'Attribute Set', 'Vendor', 'Status'];

const cellSx = { px: 2, py: '10px', fontSize: 1, textAlign: 'left', borderBottom: '1px solid', borderColor: 'border' } as const;

const cardSx = { mb: 3, bg: 'white', borderRadius: 12, border: '1px solid', borderColor: 'border', overflow: 'hidden' } as const;

const SectionTitle = ({ children }: { children: string }) => (
  <Text sx={{ display: 'block', px: 3, py: 3, fontSize: 1, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'muted', borderBottom: '1px solid', borderColor: 'border' }}>
    {children}
  </Text>
);

const DetailRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <Flex sx={{ flexDirection: ['column', 'row'], gap: [1, 3], px: 3, py: 3, borderBottom: '1px solid', borderColor: 'border', '&:last-of-type': { borderBottom: 'none' } }}>
    <Text sx={{ width: [undefined, '30%'], flexShrink: 0, fontWeight: 600, color: 'muted' }}>{label} :</Text>
    <Box sx={{ wordBreak: 'break-word' }}>{children}</Box>
  </Flex>
);

const CollectionView = () => {
  const navigate = useNavigate();
  const { id = '' } = useParams();

  // Collection details
  const [details, setDetails] = useState<CollectionDetails | null>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(true);
  const [detailsError, setDetailsError] = useState('');

  // Products of the collection
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    setIsDetailsLoading(true);
    setDetailsError('');

    getCollectionDetails(id)
      .then(setDetails)
      .catch((error) => setDetailsError(getApiErrorMessage(error)))
      .finally(() => setIsDetailsLoading(false));
  }, [id]);

  const fetchProducts = useCallback(
    (pageNumber: number) => {
      setIsProductsLoading(true);
      setProductsError('');

      getProducts(id, pageNumber)
        .then((result) => {
          setProducts(result.items);
          setTotal(result.total);
        })
        .catch((error) => setProductsError(getApiErrorMessage(error)))
        .finally(() => setIsProductsLoading(false));
    },
    [id]
  );

  useEffect(() => {
    fetchProducts(page);
  }, [page, fetchProducts]);

  const totalPages = Math.max(1, Math.ceil(total / productPageSize));
  const firstEntry = total === 0 ? 0 : (page - 1) * productPageSize + 1;
  const lastEntry = Math.min(page * productPageSize, total);

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Heading as="h1" sx={{ fontSize: 3 }}>View Collection</Heading>
        <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Collection', path: collectionListPath }, { label: 'View Collection' }]} />
      </Flex>

      {/* Collection details */}
      <Box sx={cardSx}>
        <SectionTitle>Collection Details</SectionTitle>
        {detailsError && <Alert sx={{ m: 3 }}>{detailsError}</Alert>}

        {isDetailsLoading ? (
          <PageLoader />
        ) : (
          details && (
            <>
              <DetailRow label="Name">{details.name || '-'}</DetailRow>
              <DetailRow label="Collection Path">{details.path || '-'}</DetailRow>
              <DetailRow label="Parent Collection">{details.parentName || '-'}</DetailRow>
              <DetailRow label="Status"><StatusBadge isActive={details.status === 'active'} /></DetailRow>
            </>
          )
        )}
      </Box>

      {/* Products of the collection */}
      <Box sx={cardSx}>
        <SectionTitle>List of Products</SectionTitle>
        {productsError && <Alert sx={{ m: 3 }}>{productsError}</Alert>}

        {isProductsLoading ? (
          <PageLoader />
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Box as="table" sx={{ width: '100%', minWidth: 640, borderCollapse: 'collapse' }}>
              <thead>
                <Box as="tr" sx={{ bg: 'tableHead' }}>
                  {tableColumns.map((column) => (
                    <Box as="th" key={column} sx={{ ...cellSx, py: '12px', fontWeight: 600 }}>{column}</Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumns.length} style={{ padding: 12, fontSize: 14, textAlign: 'center', color: '#555555' }}>
                      No Data Found
                    </td>
                  </tr>
                ) : (
                  products.map((product, index) => (
                    <tr key={product.id}>
                      <Box as="td" sx={cellSx}>{(page - 1) * productPageSize + index + 1}</Box>
                      <Box as="td" sx={cellSx}>{product.name}</Box>
                      <Box as="td" sx={cellSx}>{product.attributeSet || '-'}</Box>
                      <Box as="td" sx={cellSx}>{product.vendor || '-'}</Box>
                      <Box as="td" sx={cellSx}><StatusBadge isActive={product.status === 'active'} /></Box>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Box>
        )}

        <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, p: 3 }}>
          <Text sx={{ fontSize: 1 }}>Showing {firstEntry} to {lastEntry} of {total} entries</Text>
          <BasePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </Flex>
      </Box>

      <BaseButton text="Back" type="button" variant="secondary" fullWidth={false} icon={<FiArrowLeft size={16} />} onClick={() => navigate(collectionListPath)} />
    </Box>
  );
};

export default CollectionView;