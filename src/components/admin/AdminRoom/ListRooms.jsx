import { useGetRoomsQuery, useDeleteRoomMutation } from "@/api/roomApi";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Table, Button, Modal, Spin, message, Tooltip, Input, Space } from "antd";
import { FiEdit2, FiEye } from "react-icons/fi";
import { SearchOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import PaginationDefault from "../../PaginationDefault";
import ViewRoomSeats from "./ViewRoomSeats";
import { formatDate } from "@/utils/format";

const { Search } = Input;

export default function ListRooms() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [viewRoomId, setViewRoomId] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data: roomData, isLoading, error } = useGetRoomsQuery({ 
    page: currentPage, 
    limit: pageSize,
    search: searchValue,
    sort_order: sortOrder
  });

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
    }
    setCurrentPage(page);
  };

  const handleViewSeats = (roomId) => {
    setViewRoomId(roomId);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewRoomId(null);
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

  const columns = [
    {
      title: "STT",
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
          Room Name
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
      title: "Cinema",
      dataIndex: ["Cinema", "name"],
      key: "cinema",
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
                      <Tooltip title="View seat layout">
            <Button 
              icon={<FiEye />} 
              onClick={() => handleViewSeats(record.id)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Link to={`${record.id}`}>
              <Button icon={<FiEdit2 />} />
            </Link>
          </Tooltip>
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
            placeholder="Search rooms..."
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
        dataSource={roomData?.rooms || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No rooms available",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={roomData?.pagination?.currentPage || 1}
          total={roomData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 15]}
        />
      </div>

      {/* Seat layout modal */}
      <ViewRoomSeats
        roomId={viewRoomId}
        visible={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
    </>
  );
}
