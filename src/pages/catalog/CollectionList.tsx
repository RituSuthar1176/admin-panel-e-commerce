import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import moment from 'moment';
import { Alert, Box, Flex, Heading, IconButton, Text } from 'theme-ui';
import { FiBox, FiEdit2, FiEye } from 'react-icons/fi';
import Breadcrumb from '../../components/Breadcrumb';
import StatusBadge from '../../components/StatusBadge';
import BaseButton from '../../components/base/BaseButton';
import BasePagination from '../../components/base/BasePagination';
import PageLoader from '../../components/loaders/PageLoader';
import CollectionFormModal from '../../components/catalog/CollectionFormModal';
import { collectionPageSize, getApiErrorMessage, getCollections } from '../../api/collectionApi';
import type { Collection } from '../../api/collectionApi';

const tableColumns = ['Sr. No.', 'Name', 'Collection Path', 'Status', 'Created At', 'Actions'];

const cellSx = {
  px: 2,
  py: '10px',
  fontSize: 1,
  textAlign: 'left',
  borderBottom: '1px solid',
  borderColor: 'border',
} as const;

const successMessageDuration = 3000; // milliseconds

const formatDate = (date: string) => moment(date).format('M/D/YYYY');

const collectionBasePath = '/catalog/collection';

const CollectionList = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // The popup: add mode when editId is null, edit mode when it holds an id
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const fetchCollections = useCallback((pageNumber: number) => {
    setIsLoading(true);
    setErrorMessage('');

    getCollections(pageNumber)
      .then((result) => {
        setCollections(result.items);
        setTotal(result.total);
      })
      .catch((error) => {
        setErrorMessage(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Load the list on the first visit and whenever the page changes
  useEffect(() => {
    fetchCollections(page);
  }, [page, fetchCollections]);

  // Show a message sent by another screen (for example after adding products), then clear it
  useEffect(() => {
    const message = (location.state as { successMessage?: string } | null)?.successMessage;

    if (message) {
      setSuccessMessage(message);
      navigate(location.pathname, { replace: true, state: null }); // a refresh will not show it again
    }
  }, [location, navigate]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (!successMessage) return;

    const timerId = setTimeout(() => setSuccessMessage(''), successMessageDuration);

    // Cancel the timer if the page closes or a new message arrives
    return () => clearTimeout(timerId);
  }, [successMessage]);

  const openAddForm = () => {
    setEditId(null);
    setIsFormOpen(true);
  };

  const openEditForm = (collection: Collection) => {
    setEditId(collection.id);
    setIsFormOpen(true);
  };

  const closeForm = () => setIsFormOpen(false);

  const handleCollectionCreated = (collectionId: string) => {
    closeForm();

    if (collectionId) {
      // Step 2: choose the products of the new collection
      navigate(`${collectionBasePath}/${encodeURIComponent(collectionId)}/add-products`);
      return;
    }

    // The backend did not return an id, so only reload the list
    setSuccessMessage('Collection added successfully.');
    if (page !== 1) {
      setPage(1);
    } else {
      fetchCollections(1);
    }
  };

  const handleCollectionUpdated = () => {
    closeForm();
    setSuccessMessage('Collection updated successfully.');
    fetchCollections(page); // stay on the current page
  };

  const handleView = (collection: Collection) => navigate(`${collectionBasePath}/${encodeURIComponent(collection.id)}`);
  const handleViewProducts = (collection: Collection) =>
    navigate(`${collectionBasePath}/${encodeURIComponent(collection.id)}/products`);

  const totalPages = Math.max(1, Math.ceil(total / collectionPageSize));
  const firstEntry = total === 0 ? 0 : (page - 1) * collectionPageSize + 1;
  const lastEntry = Math.min(page * collectionPageSize, total);

  return (
    <Box>
      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Heading as="h1" sx={{ fontSize: 3 }}>Collection</Heading>
        <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Catalog' }, { label: 'Collection' }]} />
      </Flex>

      <Box sx={{ mb: 3 }}>
        <BaseButton text="Add Collection" type="button" fullWidth={false} onClick={openAddForm} />
      </Box>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <Box sx={{ bg: 'white', borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
        {isLoading ? (
          <PageLoader />
        ) : (
          // The table scrolls sideways on small screens
          <Box sx={{ overflowX: 'auto' }}>
            <Box as="table" sx={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
              <thead>
                <Box as="tr" sx={{ bg: 'tableHead' }}>
                  {tableColumns.map((column) => (
                    <Box as="th" key={column} sx={{ ...cellSx, py: '12px', fontWeight: 600 }}>{column}</Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      style={{ padding: 12, fontSize: 14, textAlign: 'center', color: '#555555', borderBottom: '1px solid #e8dfd8' }}
                    >
                      No collections found.
                    </td>
                  </tr>
                ) : (
                  collections.map((collection, index) => (
                    <tr key={collection.id}>
                      <Box as="td" sx={cellSx}>{(page - 1) * collectionPageSize + index + 1}</Box>
                      <Box as="td" sx={cellSx}>{collection.name}</Box>
                      <Box as="td" sx={cellSx}>{collection.path || '-'}</Box>
                      <Box as="td" sx={cellSx}><StatusBadge isActive={collection.status === 'active'} /></Box>
                      <Box as="td" sx={cellSx}>{formatDate(collection.createdAt)}</Box>
                      <Box as="td" sx={cellSx}>
                        <Flex sx={{ gap: 1, alignItems: 'center' }}>
                          <IconButton aria-label={`View ${collection.name}`} title="View" onClick={() => handleView(collection)} sx={{ cursor: 'pointer' }}>
                            <FiEye size={16} />
                          </IconButton>
                          <IconButton aria-label={`Edit ${collection.name}`} title="Edit" onClick={() => openEditForm(collection)} sx={{ cursor: 'pointer' }}>
                            <FiEdit2 size={16} />
                          </IconButton>
                          <IconButton aria-label={`Products of ${collection.name}`} title="Products" onClick={() => handleViewProducts(collection)} sx={{ cursor: 'pointer' }}>
                            <FiBox size={16} />
                          </IconButton>
                        </Flex>
                      </Box>
                    </tr>
                  ))
                )}
              </tbody>
            </Box>
          </Box>
        )}
      </Box>

      <Flex sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3, mt: 3 }}>
        <Text sx={{ fontSize: 1 }}>Showing {firstEntry} to {lastEntry} of {total} entries</Text>
        <BasePagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </Flex>

      {isFormOpen && (
        <CollectionFormModal
          collectionId={editId}
          onClose={closeForm}
          onCreated={handleCollectionCreated}
          onUpdated={handleCollectionUpdated}
        />
      )}
    </Box>
  );
};

export default CollectionList;