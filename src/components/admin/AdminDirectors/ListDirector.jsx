import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Table, Tag, Button, Modal, Spin, message, Avatar, Input, Space, Select } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import {
  useDeleteDirectorMutation,
  useGetDirectorsQuery,
} from "../../../api/directorApi";
import PaginationDefault from "@/components/PaginationDefault";
import { formatImage } from "@/utils/formatImage";
import { canPerformAdminAction } from "@/utils/auth";

const { Search } = Input;
const { Option } = Select;

export default function ListDirector() {
  const navigate = useNavigate();
  const [selectedDirector, setSelectedDirector] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  
  // Check if user has full admin permissions
  const canEditDirectors = canPerformAdminAction();

  // Gọi API với các tham số phân trang và lọc
  const { data: directorData, error, isLoading } = useGetDirectorsQuery({
    page: currentPage,
    limit: pageSize,
    search: searchValue,
    gender: genderFilter,
    sort_order: sortOrder
  });
  
  const [deleteDirector] = useDeleteDirectorMutation();

  const handleEdit = (director) => {
    navigate(`/admin/directors/edit/${director.id}`);
  };

  const handleDelete = (director) => {
    setSelectedDirector(director);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteDirector(selectedDirector.id).unwrap();
      message.success("Delete director successfully!");
    } catch (error) {
      message.error("Delete director failed. Please try again!");
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
      title: "Image",
      dataIndex: "profile_picture",
      key: "profile_picture",
      render: (profile_picture) => (
        <Avatar 
          src={formatImage(profile_picture)}
          size={40}
          onError={(e) => {
            e.target.src = '/placeholder-director.png';
          }}
        />
      ),
    },
    {
      title: "Director Name",
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
      render: (_, record) => (
        canEditDirectors ? (
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
        ) : null
      ),
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Lỗi khi tải dữ liệu!</div>;

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <Space size="middle">
          <Search
            placeholder="Tìm kiếm đạo diễn..."
            allowClear
            onSearch={handleSearch}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            prefix={<SearchOutlined className="text-[var(--text-secondary)]" />}
          />
          <Select
            placeholder="Lọc theo giới tính"
            value={genderFilter}
            onChange={handleGenderFilterChange}
            style={{ width: 150 }}
            allowClear
          >
            <Option value="Male">Nam</Option>
            <Option value="Female">Nữ</Option>
          </Select>
          {(searchValue || genderFilter || sortOrder !== "desc") && (
            <Button onClick={handleReset}>Xóa bộ lọc</Button>
          )}
        </Space>
      </div>

      <Table
        columns={canEditDirectors ? columns : columns.filter(col => col.key !== "actions")}
        dataSource={directorData?.directors || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "Chưa có đạo diễn nào",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={directorData?.pagination?.currentPage || 1}
          total={directorData?.pagination?.total || 0}
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
        okText="Xóa"
        okButtonProps={{ danger: true }}
        title="Xác nhận xóa"
      >
        Bạn có chắc chắn muốn xóa đạo diễn "{selectedDirector?.name}" không?
      </Modal>
    </>
  );
}
