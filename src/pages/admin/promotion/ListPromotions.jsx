import { useState } from "react";
import { Table, Tag, Button, Modal, Spin, message, Space, Input } from "antd";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import {
  useGetPromotionsQuery,
  useDeletePromotionMutation,
} from "@/api/promotionApi";
import { useNavigate } from "react-router-dom";
import PaginationDefault from "@/components/PaginationDefault";
import EditPromotionModal from "./EditPromotion";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;

export default function ListPromotions() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Check if user has full admin permissions
  const canEditPromotions = canPerformAdminAction();

  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // API call with parameters
  const { data: promotionData, isLoading, error } = useGetPromotionsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });
  
  const [deletePromotion] = useDeletePromotionMutation();

  const handleViewDetail = (promotion) => {
    setSelectedPromotion(promotion);
    setDetailModalOpen(true);
  };

  const handleDelete = (promotion) => {
    setSelectedPromotion(promotion);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePromotion(selectedPromotion.id).unwrap();
      message.success("Promotion deleted successfully!");
      setDeleteModalOpen(false);
    } catch {
      message.error("Failed to delete promotion. Please try again!");
    }
  };

  const handleEdit = (promotion) => {
    if (new Date(promotion.end_date) < new Date()) {
      message.error("The discount code has expired and cannot be edited!");
      return;
    }
    setSelectedPromotion(promotion);
    setEditModalOpen(true);
  };
  
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
  
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("vi-VN");

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Discount Code",
      dataIndex: "code",
      key: "code",
      render: (code) => <Tag color="blue">{code}</Tag>,
      width: 120,
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Name
          <div className="flex flex-col ml-1">
            <CaretUpOutlined 
              className={`text-[10px] ${sortOrder === "asc" ? "text-blue-500" : "text-gray-400"}`}
              style={{ marginBottom: -2 }}
            />
            <CaretDownOutlined 
              className={`text-[10px] ${sortOrder === "desc" ? "text-blue-500" : "text-gray-400"}`}
            />
          </div>
        </div>
      ),
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Discount",
      dataIndex: "discount_value",
      key: "discount_value",
      width: 150,
      render: (value, record) =>
        record.discount_type === "percentage"
          ? `${value}%`
          : `${value.toLocaleString()}đ`,
    },
    {
      title: "Duration",
      key: "time",
      render: (_, record) =>
        `${formatDate(record.start_date)} - ${formatDate(record.end_date)}`,
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) =>
        new Date(record.end_date) > new Date() ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Expired</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "right",
      render: (_, record) => (
        <Space>
          <Button 
            icon={<FiEye />} 
            onClick={() => handleViewDetail(record)} 
          />
          {canEditPromotions && (
            <>
              <Button 
                icon={<FiEdit2 />} 
                onClick={() => handleEdit(record)} 
              />
              <Button
                danger
                icon={<FiTrash2 />}
                onClick={() => handleDelete(record)}
              />
            </>
          )}
        </Space>
      ),
    },
  ];

  if (isLoading)
    return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading data!</div>;

  const promotions = promotionData?.items || [];
  const pagination = promotionData?.pagination || {
    total: 0,
    totalPages: 0,
    currentPage: 1
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      {/* Search and filters bar */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Search
          placeholder="Search promotions..."
          allowClear
          onSearch={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined className="text-gray-400" />}
        />
        
        {(searchValue || sortOrder !== "desc") && (
          <Button onClick={handleReset}>Clear filters</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={columns}
          dataSource={promotions}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <div className="py-5">
                <p className="text-gray-500 text-base">No promotions available</p>
                {canEditPromotions && (
                  <Button
                    type="link"
                    onClick={() => navigate('/admin/promotion/create')}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add new promotion now
                  </Button>
                )}
              </div>
            )
          }}
        />
      </div>
      
      {/* Pagination */}
      {promotions.length > 0 && (
        <div className="mt-4">
          <PaginationDefault
            current={pagination.currentPage}
            total={pagination.total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={true}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      )}

      {/* Detail modal */}
      <Modal
        open={isDetailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        title="Promotion Details"
      >
        {selectedPromotion && (
          <div className="space-y-2">
            <p>
              <strong>Name:</strong> {selectedPromotion.name}
            </p>
            <p>
              <strong>Code:</strong> {selectedPromotion.code}
            </p>
            <p>
              <strong>Discount:</strong>{" "}
              {selectedPromotion.discount_type === "percentage"
                ? `${selectedPromotion.discount_value}%`
                : `${selectedPromotion.discount_value.toLocaleString()}đ`}
            </p>
            <p>
              <strong>Duration:</strong>{" "}
              {formatDate(selectedPromotion.start_date)} -{" "}
              {formatDate(selectedPromotion.end_date)}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedPromotion.description || "No description"}
            </p>
          </div>
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        title="Confirm deletion"
      >
        Are you sure you want to delete the discount code "{selectedPromotion?.name}"?
      </Modal>

      {/* Edit modal */}
      <EditPromotionModal
        visible={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        promotion={selectedPromotion}
      />
    </div>
  );
}
