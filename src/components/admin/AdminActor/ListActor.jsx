import { useState } from "react";
import { Table, Tag, Button, Modal, Spin, message, Avatar, Input, Space, Select } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import {
  useGetActorsQuery,
  useDeleteActorMutation,
} from "@/api/actorApi";
import PaginationDefault from "@/components/PaginationDefault";
import { formatImage } from "@/utils/formatImage";
import { useNavigate } from "react-router-dom";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;
const { Option } = Select;

export default function ListActors() {
  const navigate = useNavigate();
  const [selectedActor, setSelectedActor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Check if user has full admin permissions
  const canEditActors = canPerformAdminAction();

  // Gọi API với các tham số phân trang và lọc
  const { data: actorData, error, isLoading } = useGetActorsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    gender: genderFilter,
    sort_order: sortOrder
  });
  
  const [deleteActor] = useDeleteActorMutation();

  const handleEdit = (actor) => {
    navigate(`/admin/actors/edit/${actor.id}`);
  };

  const handleDelete = (actor) => {
    setSelectedActor(actor);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteActor(selectedActor.id).unwrap();
      message.success("Delete actor successfully!");
    } catch (error) {
      message.error("Failed to delete actor. Please try again!");
    }
    setIsDeleteModalOpen(false);
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setCurrentPage(1);
  };

  const handleGenderFilterChange = (value) => {
    setGenderFilter(value);
    setCurrentPage(1);
  };

  const handleReset = () => {
    setSearchText("");
    setSearchValue("");
    setGenderFilter("");
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
      title: "No.",
      key: "index",
      width: 60,
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Image",
      dataIndex: "profile_picture",
      key: "profile_picture",
      render: (profile_picture) => (
        <Avatar 
          src={formatImage(profile_picture)}
          size={40}
        />
      ),
    },
    {
      title: "Actor Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: (
        <div 
          className="flex items-center cursor-pointer select-none" 
          onClick={toggleSortOrder}
        >
          Date of Birth
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
      dataIndex: "dob",
      key: "dob",
      render: (dob) => new Date(dob).toLocaleDateString("en-US"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender) => (
        <Tag color={gender === "Male" ? "blue" : "pink"}>
          {gender === "Male" ? "Male" : "Female"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      align: "right",
      render: (_, record) => (
        canEditActors ? (
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
      ),
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading data!</div>;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <Space size="middle">
          <Search
            placeholder="Search actors..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
          />
          <Select
            placeholder="Filter by gender"
            value={genderFilter}
            onChange={handleGenderFilterChange}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="Male">Male</Option>
            <Option value="Female">Female</Option>
          </Select>
          {(searchValue || genderFilter || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Clear Filters</Button>
          )}
        </Space>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <Table
          columns={canEditActors ? columns : columns.filter(col => col.key !== "actions")}
          dataSource={actorData?.actors || []}
          rowKey="id"
          pagination={false}
          locale={{
            emptyText: "No actor found",
          }}
        />
      </div>

      <div className="mt-4">
        <PaginationDefault
          current={actorData?.pagination?.currentPage || 1}
          total={actorData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={true}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {/* Modal xác nhận xóa */}
      <Modal
        open={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onOk={confirmDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        title="Confirm Delete"
      >
        <p>Are you sure you want to delete actor "{selectedActor?.name}"?</p>
      </Modal>
    </>
  );
}
