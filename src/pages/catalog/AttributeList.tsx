import { useCallback, useEffect, useState } from "react";
import moment from "moment";
import { Alert, Box, Flex, Heading, IconButton, Text } from "theme-ui";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import Breadcrumb from "../../components/Breadcrumb";
import BaseButton from "../../components/base/BaseButton";
import BaseConfirmModal from "../../components/base/BaseConfirmModal";
import BasePagination from "../../components/base/BasePagination";
import PageLoader from "../../components/loaders/PageLoader";
import AttributeFormModal from "../../components/catalog/AttributeFormModal";
import {
  attributePageSize,
  deleteAttribute,
  getApiErrorMessage,
  getAttributes,
} from "../../api/attributeApi";
import type { Attribute } from "../../api/attributeApi";

const tableColumns = ["Sr. No.", "Name", "Created At", "Updated At", "Actions"];

const cellSx = {
  px: 3,
  py: "10px",
  fontSize: 1,
  textAlign: "left",
  borderBottom: "1px solid",
  borderColor: "border",
} as const;

const successMessageDuration = 3000; // milliseconds

const formatDate = (date: string) => moment(date).format("M/D/YYYY");

const AttributeList = () => {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState<Attribute | null>(
    null,
  );

  // Delete state
  const [attributeToDelete, setAttributeToDelete] = useState<Attribute | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchAttributes = useCallback((pageNumber: number) => {
    setIsLoading(true);
    setErrorMessage("");

    getAttributes(pageNumber)
      .then((result) => {
        setAttributes(result.items);
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
    fetchAttributes(page);
  }, [page, fetchAttributes]);

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
    setSelectedAttribute(null);
    setIsModalOpen(true);
  };

  const openEditModal = (attribute: Attribute) => {
    setSelectedAttribute(attribute);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSuccess = (message: string) => {
    const wasAdding = selectedAttribute === null;

    closeModal();
    setSuccessMessage(message);

    // A new attribute goes to page 1. An edited one reloads the current page.
    if (wasAdding && page !== 1) {
      setPage(1);
    } else {
      fetchAttributes(page);
    }
  };

  const openDeleteModal = (attribute: Attribute) => {
    setDeleteError("");
    setAttributeToDelete(attribute);
  };

  const closeDeleteModal = () => {
    // Don't allow closing while the request is running
    if (isDeleting) return;
    setAttributeToDelete(null);
    setDeleteError("");
  };

  const handleDelete = () => {
    if (!attributeToDelete) return;

    setIsDeleting(true);
    setDeleteError("");

    deleteAttribute(attributeToDelete.id)
      .then(() => {
        const deletedName = attributeToDelete.name;
        // If this was the only item on a later page, go back one page
        const shouldGoBack = attributes.length === 1 && page > 1;

        setAttributeToDelete(null);
        setSuccessMessage(`Attribute "${deletedName}" deleted successfully.`);

        if (shouldGoBack) {
          setPage(page - 1);
        } else {
          fetchAttributes(page);
        }
      })
      .catch((error) => {
        setDeleteError(getApiErrorMessage(error));
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const totalPages = Math.max(1, Math.ceil(total / attributePageSize));
  const firstEntry = total === 0 ? 0 : (page - 1) * attributePageSize + 1;
  const lastEntry = Math.min(page * attributePageSize, total);

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
          Attribute
        </Heading>
        <Breadcrumb
          items={[
            { label: "Dashboard", path: "/dashboard" },
            { label: "Catalog" },
            { label: "Attribute" },
          ]}
        />
      </Flex>

      <Box sx={{ mb: 3 }}>
        <BaseButton
          text="Add Attribute"
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
              sx={{ width: "100%", minWidth: 640, borderCollapse: "collapse" }}
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
                {attributes.length === 0 ? (
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
                      No attributes found.
                    </td>
                  </tr>
                ) : (
                  attributes.map((attribute, index) => (
                    <tr key={attribute.id}>
                      <Box as="td" sx={cellSx}>
                        {(page - 1) * attributePageSize + index + 1}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {attribute.name}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatDate(attribute.createdAt)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        {formatDate(attribute.updatedAt)}
                      </Box>
                      <Box as="td" sx={cellSx}>
                        <Flex sx={{ gap: 2 }}>
                          <IconButton
                            aria-label={`Edit ${attribute.name}`}
                            onClick={() => openEditModal(attribute)}
                          >
                            <FiEdit2 size={16} />
                          </IconButton>
                          <IconButton
                            aria-label={`Delete ${attribute.name}`}
                            onClick={() => openDeleteModal(attribute)}
                          >
                            <FiTrash2 size={16} />
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
        <AttributeFormModal
          attribute={selectedAttribute}
          onClose={closeModal}
          onSuccess={handleSuccess}
        />
      )}

      {attributeToDelete && (
        <BaseConfirmModal
          title="Delete Attribute"
          message={
            <>
              Are you sure you want to delete{" "}
              <strong>{attributeToDelete.name}</strong>? This action cannot be
              undone.
            </>
          }
          isLoading={isDeleting}
          errorMessage={deleteError}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      )}
    </Box>
  );
};

export default AttributeList;
