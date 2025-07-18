import { useState } from "react";
import { useGetUsersQuery, useUpdateAdminStatusMutation } from "@/api/userApi";
import { Table, Button, Avatar, Spin, Tag, message, Input, Space, Switch, Popconfirm } from "antd";
import { FiEdit2 } from "react-icons/fi";
import PaginationDefault from "@/components/PaginationDefault";
import { formatDate } from "@/utils/format";

const { Search } = Input;

export default function ListUser() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);

  const { data: usersData, isLoading, error, refetch } = useGetUsersQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText
  });

  const [updateUserStatus] = useUpdateAdminStatusMutation();

  const handlePageChange = (page, newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setCurrentPage(1);
    } else {
      setCurrentPage(page);
    }
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleStatusChange = async (checked, userId) => {
    try {
      setStatusUpdating(userId);

      await updateUserStatus({
        id: userId,
        status: checked
      }).unwrap();

      message.success(`User has been ${checked ? 'activated' : 'deactivated'}`);
      refetch();
    } catch (error) {
      message.error("An error occurred while updating user status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const columns = [
    {
      title: "User",
      dataIndex: "username",
      key: "username",
      render: (username, record) => (
        <div className="flex items-center">
          <Avatar 
            src={record.avatar || "https://placehold.co/100x100"} 
            size={40} 
            alt={username}
          />
          <div className="ml-2">
            <div className="font-medium">{username}</div>
            <div className="text-xs text-[var(--text-secondary)]">{record.email}</div>
          </div>
        </div>
      )
    },
    {
      title: "Phone Number",
      dataIndex: "phone",
      key: "phone",
      render: (phone) => phone || "-"
    },
    {
      title: "Reward Points",
      dataIndex: "star",
      key: "star",
      render: (star) => star || 0
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active, record) => (
        <div className="flex items-center">
          <Tag color={is_active ? "green" : "red"}>
            {is_active ? "Active" : "Inactive"}
          </Tag>
          <Popconfirm
            title={`Do you want to ${is_active ? 'deactivate' : 'activate'} this account?`}
            onConfirm={() => handleStatusChange(!is_active, record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Switch
              checked={is_active}
              loading={statusUpdating === record.id}
              size="small"
              className="ml-2"
            />
          </Popconfirm>
        </div>
      )
    },
    {
      title: "Registration Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <span>{formatDate(date)}</span>
    },
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading user data!</div>;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <Search
          placeholder="Search by name or email"
          allowClear
          value={searchValue}
          onChange={handleSearchChange}
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={usersData?.users || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No users found",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={usersData?.pagination?.page || 1}
          total={usersData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 15]}
        />
      </div>
    </div>
  );
}
