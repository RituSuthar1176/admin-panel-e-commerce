import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Alert, Box, Flex, Heading, IconButton, Text } from "theme-ui";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import StatusBadge from "../../components/StatusBadge";
import BaseButton from "../../components/base/BaseButton";
import BaseConfirmModal from "../../components/base/BaseConfirmModal";
import BasePagination from "../../components/base/BasePagination";
import PageLoader from "../../components/loaders/PageLoader";
import AttributeSetFormModal from "../../components/catalog/AttributeSetFormModal";
import {
  attributeSetPageSize,
  deleteAttributeSet,
  getApiErrorMessage,
  getAttributeSets,
} from "../../api/attributeSetApi";
import type { AttributeSet } from "../../api/attributeSetApi";

const tableColumns = [
  "Sr. No.",
  "Name",
  "Status",
  "Created At",
  "Updated At",
  "Actions",
];

const cellSx = {
  px: 2,
  py: "10px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

const successMessageDuration = 3000; // milliseconds

const formatDate = (date: string) => moment(date).format("M/D/YYYY");

const AttributeSetList = () => {
  const [attributeSets, setAttributeSets] = useState<AttributeSet[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttributeSet, setSelectedAttributeSet] =
    useState<AttributeSet | null>(null);

  // Delete state
  const [attributeSetToDelete, setAttributeSetToDelete] =
    useState<AttributeSet | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchAttributeSets = useCallback((pageNumber: number) => {
    setIsLoading(true);
    setErrorMessage("");

    getAttributeSets(pageNumber)
      .then((result) => {
        setAttributeSets(result.items);
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
    fetchAttributeSets(page);
  }, [page, fetchAttributeSets]);

  // Hide the success message after a few seconds
  useEffect(() => {
    if (!successMessage) return;

    const timerId = setTimeout(
      () => setSuccessMessage(""),
      successMessageDuration,
    );

    // Cancel the timer if the page closes or a new message arrives
    return () => clearTimeout(timerId);
  }, [successMessage]);

  const openAddModal = () => {
    setSelectedAttributeSet(null);
    setIsModalOpen(true);
  };

  const openEditModal = (attributeSet: AttributeSet) => {
    setSelectedAttributeSet(attributeSet);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSuccess = (message: string) => {
    const wasAdding = selectedAttributeSet === null;

    closeModal();
    setSuccessMessage(message);

    // A new attribute set goes to page 1. An edited one reloads the current page.
    if (wasAdding && page !== 1) {
      setPage(1);
    } else {
      fetchAttributeSets(page);
    }
  };

  const openDeleteModal = (attributeSet: AttributeSet) => {
    setDeleteError("");
    setAttributeSetToDelete(attributeSet);
  };

  const closeDeleteModal = () => {
    if (!isDeleting) setAttributeSetToDelete(null);
  };

  const handleDelete = () => {
    if (!attributeSetToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    deleteAttributeSet(attributeSetToDelete.id)
      .then(() => {
        // If the last row of a page was deleted, go back one page
        const isLastRowOnPage = attributeSets.length === 1 && page > 1;

        setAttributeSetToDelete(null);
        setSuccessMessage("Attribute set deleted successfully.");

        if (isLastRowOnPage) {
          setPage(page - 1);
        } else {
          fetchAttributeSets(page);
        }
      })
      .catch((error) => {
        setDeleteError(getApiErrorMessage(error)); // shown inside the popup
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const totalPages = Math.max(1, Math.ceil(total / attributeSetPageSize));
  const firstEntry = total === 0 ? 0 : (page - 1) * attributeSetPageSize + 1;
  const lastEntry = Math.min(page * attributeSetPageSize, total);

  return (
    <Box>
      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Heading as="h1" sx={{ fontSize: 3 }}>
          Attribute Set
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Catalog" },
            { label: "Attribute Set" },
          ]}
        />
      </Flex>

      <Box sx={{ mb: 3 }}>
        <BaseButton
          text="Add Attribute Set"
          type="button"
          fullWidth={false}
          onClick={openAddModal}
        />
      </Box>

      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      {errorMessage && <Alert>{errorMessage}</Alert>}

      <Box
        sx={{
          bg: "white",
          borderRadius: 12,
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        {isLoading ? (
          <PageLoader />
        ) : (
          // The table scrolls sideways on small screens
          <Box sx={{ overflowX: "auto" }}>
            <Box
              as="table"
              sx={{ width: "100%", minWidth: 600, borderCollapse: "collapse" }}
            >
              <thead>
                <Box as="tr" sx={{ bg: "tableHead" }}>
                  {tableColumns.map((column) => (
                    <Box
                      as="th"
                      key={column}
                      sx={{ ...cellSx, py: "12px", fontWeight: 600 }}
                    >
                      {column}
                    </Box>
                  ))}
                </Box>
              </thead>
              <tbody>
                {attributeSets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length}
                      style={{
                        padding: 12,
                        fontSize: 14,
                        textAlign: "center",
                        color: "#555555",
                        borderBottom: "1px solid #e8dfd8",
                      }}
                    >
                      No attribute sets found.
                    </td>
                  </tr>
                ) : (
                  attributeSets.map((attributeSet, index) => (
                    <tr key={attributeSet.id}>
                      <Box as="td" sx={cellSx}>
                        {(page - 1) * attributeSetPageSize + index + 1}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {attributeSet.name}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        <StatusBadge
                          isActive={attributeSet.status === "active"}
                        />
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatDate(attributeSet.createdAt)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatDate(attributeSet.updatedAt)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        <Flex sx={{ gap: 1, alignItems: "center" }}>
                          <IconButton
                            aria-label={`Edit ${attributeSet.name}`}
                            title="Edit"
                            onClick={() => openEditModal(attributeSet)}
                            sx={{ cursor: "pointer" }}
                          >
                            <FiEdit2 size={16} />
                          </IconButton>

                          <IconButton
                            aria-label={`Delete ${attributeSet.name}`}
                            title="Delete"
                            onClick={() => openDeleteModal(attributeSet)}
                            sx={{ cursor: "pointer", color: "black" }}
                          >
                            <FiTrash2 size={16} color="black" />
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

      <Flex
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          mt: 3,
        }}
      >
        <Text sx={{ fontSize: 1 }}>
          Showing {firstEntry} to {lastEntry} of {total} entries
        </Text>
        <BasePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Flex>

      {isModalOpen && (
        <AttributeSetFormModal
          attributeSet={selectedAttributeSet}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {attributeSetToDelete && (
        <BaseConfirmModal
          title="Delete Attribute Set"
          message={`Are you sure you want to delete "${attributeSetToDelete.name}"? This cannot be undone.`}
          isLoading={isDeleting}
          errorMessage={deleteError}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </Box>
  );
};

export default AttributeSetList;
