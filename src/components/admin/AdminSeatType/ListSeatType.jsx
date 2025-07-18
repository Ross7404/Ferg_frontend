import { useState } from "react";
import { Table, Button, Modal, Spin, message, Input } from "antd";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useGetListSeatTypesQuery, useDeleteSeatTypeMutation } from "@/api/seatTypeApi";
import UpdateSeatType from "./UpdateSeatType";
import PaginationDefault from "@/components/PaginationDefault";
import AddSeatType from "./AddSeatType";
import { formatDate } from "@/utils/format";

const { Search } = Input;

export default function ListSeatType() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isShowFormUpdate, setIsShowFormUpdate] = useState(false);
  const [isShowFormCreate, setIsShowFormCreate] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSeatType, setSelectedSeatType] = useState(null);

  // API call with pagination, search, and sorting parameters
  const { data: seatTypeData, isLoading } = useGetListSeatTypesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });
  
  const [deleteSeatType] = useDeleteSeatTypeMutation();

  const handleEdit = (seatType) => {
    setSelectedSeatType(seatType);
    setIsShowFormUpdate(true);
  };

  const handleDelete = (seatType) => {
    setSelectedSeatType(seatType);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteSeatType(selectedSeatType.id).unwrap();
      message.success("Seat type deleted successfully!");
    } catch (error) {
      console.error("Error deleting seat type:", error);
      message.error("Failed to delete seat type!");
    }
    setIsDeleteModalOpen(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
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
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
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
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Seat Type
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
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (color) => (
        <div className="flex items-center space-x-2">
          <div
            className="w-8 h-8 rounded-lg border shadow-sm"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm text-[var(--text-secondary)]">{color}</span>
        </div>
      ),
    },
    {
      title: "Additional Price",
      dataIndex: "price_offset",
      key: "price_offset",
      render: (price) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(price)}
        </span>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <span>
          {formatDate(date)}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            icon={<FiEdit2 />}
            onClick={() => handleEdit(record)}
          />
          <Button
            danger
            icon={<FiTrash2 />}
            onClick={() => handleDelete(record)}
          />
        </div>
      ),
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;

  const seatTypes = seatTypeData?.seat_types || [];
  const pagination = seatTypeData?.pagination || { total: 0, currentPage: 1, totalPages: 1 };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Seat Type List</h2>
          <p className="text-[var(--text-secondary)] mt-1">Manage seat types in the system</p>
        </div>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setIsShowFormCreate(true)}
          className="flex items-center bg-blue-500"
        >
          Add Seat Type
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Search
          placeholder="Search seat types..."
          allowClear
          onSearch={handleSearch}
          value={searchText}
          onChange={handleSearchChange}
          style={{ width: 250 }}
          prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
        />
        
        {(searchValue || sortOrder !== "desc") && (
          <Button onClick={handleReset}>Clear Filters</Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={seatTypes}
        rowKey="id"
        pagination={false}
      />

      <PaginationDefault
        current={pagination.currentPage}
        total={pagination.total}
        pageSize={pageSize}
        onChange={handlePageChange}
        showSizeChanger={true}
        pageSizeOptions={[5, 10, 20]}
      />

      {isShowFormUpdate && (
        <Modal
          open={isShowFormUpdate}
          footer={null}
          onCancel={() => setIsShowFormUpdate(false)}
          width={500}
        >
          <UpdateSeatType
            seat_type={selectedSeatType}
            setIsShowFormUpdate={setIsShowFormUpdate}
          />
        </Modal>
      )}

      {isShowFormCreate && (
        <Modal
          open={isShowFormCreate}
          footer={null}
          onCancel={() => setIsShowFormCreate(false)}
          width={500}
        >
          <AddSeatType
            isShowFormCreate={setIsShowFormCreate}
          />
        </Modal>
      )}

      {/* Delete confirmation modal */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete the seat type "{selectedSeatType?.type}"?</p>
        <p className="text-red-500 text-sm mt-2">Note: This action cannot be undone.</p>
      </Modal>
    </div>
  );
}
