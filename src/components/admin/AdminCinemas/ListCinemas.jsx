import { useState } from "react";
import { Table, Tag, Button, Modal, Spin, message, Input, Space } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { useGetCinemasQuery, useDeleteCinemaMutation } from "@/api/cinemaApi";
import EditCinema from "./EditCinemas";
import PaginationDefault from "@/components/PaginationDefault";

const { Search } = Input;

export default function ListCinemas() {
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Call API with pagination and filters
  const { data: cinemaData, error, isLoading } = useGetCinemasQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });
  
  const [deleteCinema] = useDeleteCinemaMutation();

  const handleEdit = (cinema) => {
    setSelectedCinema(cinema);
    setIsEditModalOpen(true);
  };

  const handleDelete = (cinema) => {
    setSelectedCinema(cinema);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCinema(selectedCinema.id).unwrap();
      message.success("Cinema deleted successfully!");
    } catch (error) {
      message.error("Failed to delete cinema. Please try again!");
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
      width: 70,
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Cinema Name
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
      title: "City",
      dataIndex: "city",
      key: "city",
      render: (city) => <Tag color="blue">{city}</Tag>,
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
    },
    {
      title: "Ward",
      dataIndex: "ward",
      key: "ward",
    },
    {
      title: "Street",
      dataIndex: "street",
      key: "street",
      ellipsis: true,
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
  if (error) return <div className="text-red-500">Error loading data!</div>;

  return (
    <>
      <div className="mb-4">
        <Space size="middle">
          <Search
            placeholder="Search cinemas..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
          />
          {(searchValue || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Clear filters</Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={cinemaData?.cinemas || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No cinemas available",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={cinemaData?.pagination?.currentPage || 1}
          total={cinemaData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 15]}
        />
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-[9999]">
          <EditCinema
            {...selectedCinema}
            setToggleUpdateCinema={setIsEditModalOpen}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        title="Delete Confirmation"
      >
        Are you sure you want to delete cinema "{selectedCinema?.name}"?
      </Modal>
    </>
  );
}
