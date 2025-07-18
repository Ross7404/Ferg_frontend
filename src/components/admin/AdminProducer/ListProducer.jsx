import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Button, Modal, Spin, message, Input, Space } from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useGetProducersQuery, useDeleteProducerMutation } from "@/api/producerApi";
import PaginationDefault from "@/components/PaginationDefault";
import { formatImage } from "@/utils/formatImage";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;

export default function ListProducers() {
    const navigate = useNavigate();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProducer, setSelectedProducer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Check if user has full admin permissions
  const canEditProducers = canPerformAdminAction();

  // Gọi API với các tham số phân trang và lọc
  const { data: producerData, error, isLoading } = useGetProducersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });
  
  const [deleteProducer] = useDeleteProducerMutation();

  const handleEdit = (id) => {    
    navigate(`/admin/producers/edit/${id}`);
  };

  const handleDelete = (producer) => {
    setSelectedProducer(producer);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteProducer(selectedProducer.id).unwrap();
      message.success("Delete producer successfully!");
    } catch (error) {
      console.error("Error deleting producer:", error);
      message.error("Failed to delete producer. Please try again.");
    }
    setIsDeleteModalOpen(false);
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

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
        setPageSize(newPageSize);
    }
    setCurrentPage(page);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Image",
      dataIndex: "profile_picture",
      key: "profile_picture",
      width: 100,
      render: (profile_picture, record) => (
        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100">
          <img
            src={formatImage(profile_picture)}
            alt={record.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-producer.png';
            }}
          />
        </div>
      ),
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Producer Name
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
      dataIndex: "name",
      key: "name",
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
      key: "actions",
      width: 150,
      render: (_, record) => (
        canEditProducers ? (
          <div className="flex space-x-2">
            <Button
              icon={<FiEdit2 />}
              onClick={() => handleEdit(record.id)}
            />
            <Button
              danger
              icon={<FiTrash2 />}
              onClick={() => handleDelete(record)}
            />
          </div>
        ) : null
      ),
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading data!</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Producer List</h2>
          <p className="text-xs text-[var(--text-secondary)]">Manage movie producer information</p>
        </div>
        {canEditProducers && (
          <Link to="../addProducer">
            <Button
              type="primary"
              icon={<FiPlus />}
              className="flex items-center bg-blue-500"
            >
              Add Producer
            </Button>
          </Link>
        )}
      </div>

      <div className="mb-4">
        <Space size="middle">
          <Search
            placeholder="Search producer..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
          />
          {(searchValue || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Clear filter</Button>
          )}
        </Space>
      </div>

      <Table
        columns={canEditProducers ? columns : columns.filter(col => col.key !== "actions")}
        dataSource={producerData?.producers || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No producer found",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={producerData?.pagination?.currentPage || 1}
          total={producerData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 15]}
        />
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        title="Confirm delete"
      >
        Are you sure you want to delete producer "{selectedProducer?.name}"?
      </Modal>
    </div>
  );
}
