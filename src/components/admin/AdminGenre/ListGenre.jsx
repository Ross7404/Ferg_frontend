import { useState } from "react";
import { Table, Button, Modal, Spin, Input, Space, message } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SearchOutlined } from "@ant-design/icons";
import PaginationDefault from "@/components/PaginationDefault";
import { useGetGenresQuery, useDeleteGenreMutation } from "@/api/genreApi";
import PropTypes from 'prop-types';
import EditGenre from "./EditGenre";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;

export default function ListGenre() {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // Check if user has full admin permissions
  const canEditGenres = canPerformAdminAction();

  const { data: genresData, isLoading, error } = useGetGenresQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue
  });

  const [deleteGenre] = useDeleteGenreMutation();

  const handleEdit = (genre) => {
    setSelectedGenre(genre);    
    setIsEditModalOpen(true);
  };

  const handleDelete = (genre) => {
    setSelectedGenre(genre);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteGenre(selectedGenre.id).unwrap();
      message.success("Genre deleted successfully!");
      setIsDeleteModalOpen(false);
    } catch (error) {
      message.error("Failed to delete genre: " + (error.data?.message || error.message));
    }
  };

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleReset = () => {
    setSearchText("");
    setSearchValue("");
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "No.",
      key: "stt",
      width: 80,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Genre Name",
      dataIndex: "name",
      key: "name"
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => createdAt ? new Date(createdAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : "N/A"
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (updatedAt) => updatedAt ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }) : "N/A"
    },
    {
      title: "Actions",
      key: "action",
      width: 120,
      align: "right",
      render: (_, record) => (
        canEditGenres ? (
          <Space>
            <Button
              icon={<FiEdit2 />}
              onClick={() => handleEdit(record)}
            />
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record)}
            />
          </Space>
        ) : null
      )
    }
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Failed to load genre data!</div>;

  return (
    <div>
      {/* Search and filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Search
          placeholder="Search genres..."
          allowClear
          onSearch={handleSearch}
          value={searchText}
          onChange={handleInputChange}
          style={{ width: 250 }}
          prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
        />
        
        {searchValue && (
          <Button onClick={handleReset}>Clear filters</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={canEditGenres ? columns : columns.filter(col => col.key !== "action")}
          dataSource={genresData?.genres || []}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: "No genres found"
          }}
        />
      </div>

      {/* Pagination */}
      {(genresData?.genres?.length > 0) && (
        <div className="mt-4">
          <PaginationDefault
            current={genresData?.pagination?.page || 1}
            total={genresData?.pagination?.total || 0}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={true}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        title="Confirm Deletion"
        open={isDeleteModalOpen}
        onOk={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete the genre "{selectedGenre?.name}"?</p>
      </Modal>

      {/* Edit genre modal */}
      {isEditModalOpen && selectedGenre && (
        <Modal
          open={isEditModalOpen}
          footer={null}
          onCancel={() => setIsEditModalOpen(false)}
          width={500}
        >
          <EditGenre 
            id={selectedGenre.id} 
            name={selectedGenre.name} 
            setToggleUpdateGenre={(value) => setIsEditModalOpen(value)} 
          />
        </Modal>
      )}
    </div>
  );
}

ListGenre.propTypes = {};
