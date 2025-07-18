import { useState, useEffect } from "react";
import { FiPlus } from "react-icons/fi";
import { Table, Tag, Button, Modal, Spin, message, Space, Input } from "antd";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useGetOrdersPaginationQuery, useGetListOrdersByBranchIdQuery } from "@/api/orderApi";
import PaginationDefault from "@/components/PaginationDefault";

const { Search } = Input;

export default function Order() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  
  // Lấy thông tin người dùng từ localStorage
  const user = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user"))
    : null;
  const userRole = user?.role || "";
  const userId = user?.id || "";
  const isAdmin = userRole === "admin";
  const isBranchAdmin = userRole === "branch_admin";
  
  // Gọi API với các tham số phân quyền
  const { 
    data: adminOrderData, 
    isLoading: adminIsLoading, 
    error: adminError, 
    refetch: adminRefetch 
  } = useGetOrdersPaginationQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  }, { skip: !isAdmin });
  
  const { 
    data: branchOrderData, 
    isLoading: branchIsLoading, 
    error: branchError, 
    refetch: branchRefetch 
  } = useGetListOrdersByBranchIdQuery({
    id: userId,
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  }, { skip: !isBranchAdmin });
  
  // Tổng hợp dữ liệu dựa trên quyền hạn
  const orderData = isAdmin ? adminOrderData : branchOrderData;
  const isLoading = isAdmin ? adminIsLoading : branchIsLoading;
  const error = isAdmin ? adminError : branchError;
  const refetch = isAdmin ? adminRefetch : branchRefetch;
  
  const handleViewDetail = (order) => {
    setSelectedOrder(order);
    setDetailModalOpen(true);
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
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  }

  const getStatusTag = (status) => {
    const statusMap = {
      'pending': { color: 'gold', text: 'Pending' },
      'paid': { color: 'green', text: 'Paid' },
      'failed': { color: 'red', text: 'Failed' },
      'processing': { color: 'blue', text: 'Processing' }
    };
    
    const defaultStatus = { color: 'default', text: 'Unknown' };
    return statusMap[status] || defaultStatus;
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <Tag color="blue">{id}</Tag>,
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Order Date
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
      dataIndex: "order_date",
      key: "order_date",
      render: (date) => formatDate(date),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (total) => `${Number(total).toLocaleString()}đ`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const { color, text } = getStatusTag(status);
        return <Tag color={color}>{text}</Tag>;
      },
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
        </Space>
      ),
    },
  ];

  const handleTryAgain = () => {
    message.info("Retrying...");
    refetch();
  };

  if (isLoading)
    return <Spin className="flex justify-center mt-10" size="large" />;
  
  if (error) return (
    <div className="text-center my-10">
      <div className="text-red-500 mb-4">
        Error loading data: {error.status ? `(${error.status}) ` : ''} 
        {error.message || JSON.stringify(error)}
      </div>
      <Button type="primary" onClick={handleTryAgain}>
        Retry
      </Button>
    </div>
  );

  const orders = orderData?.data || [];
  const pagination = orderData?.pagination || {
    total: 0,
    totalPages: 0,
    currentPage: 1
  };
    
  return (
    <div className="p-6 h-full">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              {isAdmin 
                ? "View and manage all customer orders" 
                : "View and manage orders from your branch"
              }
            </p>
          </div>
        </div>

        {/* Search and filter bar */}
        <div className="mb-4 flex flex-wrap gap-3">
          <Search
            placeholder="Search orders..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-gray-400" />}
          />
          
          {(searchValue || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Clear Filters</Button>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            pagination={false}
            locale={{
              emptyText: (
                <div className="py-5">
                  <p className="text-gray-500 text-base">No orders found</p>
                </div>
              )
            }}
          />
        </div>
        
        {/* Pagination */}
        {orders.length > 0 && (
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

        {/* Order detail modal */}
        <Modal
          open={isDetailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          title="Order Details"
          width={700}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Order Information</h3>
                  <p><span className="font-medium">Order ID:</span> {selectedOrder.id}</p>
                  <p><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.order_date)}</p>
                  <p>
                    <span className="font-medium">Status:</span>{" "}
                    {(() => {
                      const { color, text } = getStatusTag(selectedOrder.status);
                      return <Tag color={color}>{text}</Tag>;
                    })()}
                  </p>
                  <p><span className="font-medium">Total:</span> {Number(selectedOrder.total).toLocaleString()}đ</p>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Ticket Details</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <p><span className="font-medium">Movie:</span> {selectedOrder.Showtime?.Movie?.name || "N/A"}</p>
                  <p><span className="font-medium">Showtime:</span> {formatDate(selectedOrder.Showtime?.show_date)} - {selectedOrder.Showtime?.start_time || "N/A"}</p>
                  <p><span className="font-medium">Room:</span> {selectedOrder.Showtime?.Room?.name || "N/A"}</p>
                  <p>
                    <span className="font-medium">Seats:</span> {
                      selectedOrder.Tickets && selectedOrder.Tickets.map(ticket => 
                        ticket.Seat ? `${ticket.Seat.seat_row}${ticket.Seat.seat_number}` : ""
                      ).filter(Boolean).join(', ')
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
