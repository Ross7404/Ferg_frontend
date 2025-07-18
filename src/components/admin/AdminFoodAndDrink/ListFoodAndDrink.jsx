import { useState } from "react";
import { useGetFoodAndDrinksQuery, useDeleteFoodAndDrinkMutation } from "../../../api/foodAndDrinkApi";
import { toast } from "react-toastify";
import AddFoodAndDrink from "./AddFoodAndDrink";
import EditFoodAndDrink from "./EditFoodAndDrink";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { Input, Button, Space, Spin, Select, Table, Modal } from "antd";
import PaginationDefault from "../../PaginationDefault";
import { formatImage } from "@/utils/formatImage";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;
const { Option } = Select;

const ListFoodAndDrink = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [typeFilter, setTypeFilter] = useState("");
  const [addForm, setAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  // Check if user has full admin permissions
  const canEditItems = canPerformAdminAction();
  
  // Call API with parameters
  const { data: foodAndDrinkData, isLoading, error } = useGetFoodAndDrinksQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder,
    type: typeFilter
  });
  
  const [deleteFoodAndDrink] = useDeleteFoodAndDrinkMutation();

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    setCurrentPage(page);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setShowEditForm(true);
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteFoodAndDrink(itemToDelete.id).unwrap();
      toast.success("Delete item successfully!");
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (err) {
      console.error("Error deleting item:", err);
      toast.error("Failed to delete item. Please try again.");
    }
  };
  
  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };
  
  const handleTypeChange = (value) => {
    setTypeFilter(value);
    setCurrentPage(1);
  };
  
  const handleReset = () => {
    setSearchText("");
    setSearchValue("");
    setSortOrder("desc");
    setTypeFilter("");
    setCurrentPage(1);
  };
  
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
    setCurrentPage(1);
  };

  const columns = [
    {
      title: "No.",
      key: "index",
      width: 70,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: "Image",
      key: "image",
      width: 100,
      render: (_, record) => (
        <div className="flex items-center">
          {record.profile_picture ? (
            <img
              src={formatImage(record.profile_picture)}
              alt={record.name}
              className="h-10 w-10 rounded-lg object-cover shadow-sm"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/100?text=No+Image';
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center text-[var(--text-secondary)] text-xs">
              No Image
            </div>
          )}
        </div>
      )
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Food Name
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
      title: "Type",
      key: "type",
      render: (_, record) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.type === "food" 
            ? "bg-green-100 text-green-800" 
            : "bg-blue-100 text-blue-800"
        }`}>
          {record.type === "food" ? "Food" : "Drink"}
        </span>
      )
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => (
        <div className="text-sm font-medium text-[var(--text-primary)]">
          {record.price.toLocaleString()} VND
        </div>
      )
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "right",
      render: (_, record) => (
        canEditItems ? (
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg max-w-md">
          <p className="text-lg font-semibold mb-2">An error occurred</p>
          <p className="text-sm">Unable to load data. Please try again later.</p>
        </div>
      </div>
    );
  }
  
  const foodAndDrinks = foodAndDrinkData?.items || [];
  const pagination = foodAndDrinkData?.pagination || {
    total: 0,
    totalPages: 0,
    currentPage: 1
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Food & Drink Management</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">Manage the list of food and drinks at the theater</p>
        </div>
        {canEditItems && (
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={() => setAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Add New Item
          </Button>
        )}
      </div>

      {/* Search and filter bar */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Search
          placeholder="Search food..."
          allowClear
          onSearch={handleSearch}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 250 }}
          prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
        />
        
        <Select
          placeholder="Item type"
          allowClear
          style={{ width: 120 }}
          onChange={handleTypeChange}
          value={typeFilter}
        >
          <Option value="">All</Option>
          <Option value="food">Food</Option>
          <Option value="drink">Drink</Option>
        </Select>
        
        {(searchValue || sortOrder !== "desc" || typeFilter) && (
          <Button onClick={handleReset}>Clear Filters</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={canEditItems ? columns : columns.filter(col => col.key !== "actions")}
          dataSource={foodAndDrinks}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: (
              <div className="py-5">
                <p className="text-[var(--text-secondary)] text-base">No food or drink items available</p>
                {canEditItems && (
                  <Button
                    type="link"
                    onClick={() => setAddForm(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700"
                  >
                    Add new item now
                  </Button>
                )}
              </div>
            )
          }}
        />
      </div>

      {/* Pagination */}
      {foodAndDrinks.length > 0 && (
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

      {/* Delete confirmation modal */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
        title="Delete Confirmation"
      >
        Are you sure you want to delete the item "{itemToDelete?.name}"?
      </Modal>

      {/* Add New Item modal */}
      <Modal
        title="Add New Item"
        open={addForm}
        onCancel={() => setAddForm(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {addForm && <AddFoodAndDrink setAddForm={setAddForm} />}
      </Modal>

      {/* Edit Item modal */}
      <Modal
        title="Edit Item"
        open={showEditForm}
        onCancel={() => setShowEditForm(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        {showEditForm && <EditFoodAndDrink setEditForm={setShowEditForm} editItem={selectedItem} />}
      </Modal>
    </div>
  );
};

export default ListFoodAndDrink;
