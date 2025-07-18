import { useState } from "react";
import { useGetPostsQuery, useDeletePostMutation } from "@/api/postApi";
import { Link } from "react-router-dom";
import { Table, Button, Modal, Spin, message, Tooltip, Input, Space } from "antd";
import { FiEdit2, FiEye, FiTrash2, FiPlus } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import PaginationDefault from "../../PaginationDefault";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;

export default function PostsList() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletePostId, setDeletePostId] = useState(null);
  
  // Check if user has full admin permissions
  const canEditPosts = canPerformAdminAction();

  const { data: postData, isLoading, error } = useGetPostsQuery({ 
    page: currentPage, 
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });

  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    setCurrentPage(page);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setSearchValue("");
    setSortOrder("desc");
    setCurrentPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const showDeleteConfirm = (id) => {
    setDeletePostId(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deletePost(deletePostId).unwrap();
      message.success("Post deleted successfully");
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error("Error deleting post:", error);
      message.error("Cannot delete post");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletePostId(null);
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 80,
      render: (_, __, index) => {
        return (currentPage - 1) * pageSize + index + 1;
      }
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Title
          <div className="flex flex-col ml-1">
            <CaretUpOutlined 
              className={`text-[10px] ${sortOrder === "asc" ? "text-blue-500" : "text-[var(--text-secondary)]"}`}
              style={{ marginBottom: -2 }}
            />
            <CaretDownOutlined 
              className={`text-[10px] ${sortOrder === "desc" ? "text-blue-500" : "text-[var(--text-secondary)]"}`}
            />
          </div>
        </div>
      ),
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            record.status === "active"
              ? "bg-green-100 text-green-800"
              : record.status === "draft"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {record.status === "active"
            ? "Published"
            : record.status === "draft"
            ? "Draft"
            : "Inactive"}
        </span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("en-US"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        canEditPosts ? (
          <div className="flex space-x-2">
            <Tooltip title="Edit">
              <Link to={`/admin/posts/edit/${record.id}`}>
                <Button icon={<FiEdit2 />} />
              </Link>
            </Tooltip>
            <Tooltip title="Delete">
              <Button 
                icon={<FiTrash2 />} 
                danger 
                onClick={() => showDeleteConfirm(record.id)}
              />
            </Tooltip>
          </div>
        ) : null
      ),
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading data!</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Post Management</h1>
        {canEditPosts && (
          <Link
            to="/admin/posts/create"
          >
            <Button
              type="primary"
              icon={<FiPlus />}
              className="flex items-center"
            >
              Add Post
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-4">
        <Space size="middle">
          <Search
            placeholder="Search posts..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
          />
          {(searchValue || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Clear Filters</Button>
          )}
        </Space>
      </div>

      <Table
        columns={canEditPosts ? columns : columns.filter(col => col.key !== "actions")}
        dataSource={postData?.posts || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No posts available",
        }}
        className="shadow-md rounded-lg overflow-hidden"
      />

      <div className="mt-4">
        <PaginationDefault
          current={postData?.pagination?.currentPage || 1}
          total={postData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={true}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      <Modal
        title="Confirm Delete"
        open={isDeleteModalOpen}
        onOk={handleDelete}
        onCancel={handleCancelDelete}
        confirmLoading={isDeleting}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this post? This action cannot be undone.</p>
      </Modal>
    </div>
  );
} 