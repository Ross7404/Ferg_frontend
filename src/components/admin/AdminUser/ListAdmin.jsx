import { useState } from "react";
import { Table, Button, Modal, Spin, Input, Space, Switch, message, Tag, Popconfirm } from "antd";
import { FiEdit2 } from "react-icons/fi";
import PaginationDefault from "@/components/PaginationDefault";
import { formatDate } from "@/utils/format";
import { useGetAdminBranchesQuery, useUpdateAdminStatusMutation } from "@/api/userApi";
import UpdateAdmin from "./UpdateAdmin";

const { Search } = Input;

export default function ListAdmin() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchText, setSearchText] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  const { data: adminsData, isLoading, error, refetch } = useGetAdminBranchesQuery({
    page: currentPage,
    limit: pageSize,
    search: searchText
  });
  
  const [updateAdminStatus] = useUpdateAdminStatusMutation();

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
  
  const handleStatusChange = async (checked, adminId) => {
    try {
      setStatusUpdating(adminId);
      
      await updateAdminStatus({
        id: adminId,
        status: checked
      }).unwrap();
      
      message.success(`Successfully ${checked ? 'activated' : 'deactivated'} administrator account`);
      refetch();
    } catch (error) {
      message.error("Error occurred while updating status");
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleEditAdmin = (admin) => {
    setSelectedAdmin(admin);
    setIsUpdateModalVisible(true);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalVisible(false);
    setSelectedAdmin(null);
    refetch();
  };

  const columns = [
    {
      title: "Full Name",
      dataIndex: "username",
      key: "username"
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email"
    },
    {
      title: "Branch",
      dataIndex: "Branch",
      key: "Branch",
      render: (Branch) => <span>{Branch?.name}</span>
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <span>{formatDate(date)}</span>
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
      title: "Actions",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            icon={<FiEdit2 />}
            title="Edit"
            onClick={() => handleEditAdmin(record)}
          />
        </Space>
      )
    }
  ];

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Error loading administrator data!</div>;

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
        dataSource={adminsData?.adminBranches || []}
        rowKey="id"
        pagination={false}
        locale={{
          emptyText: "No administrators found",
        }}
      />

      <div className="mt-4">
        <PaginationDefault
          current={adminsData?.pagination?.page || 1}
          total={adminsData?.pagination?.total || 0}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          pageSizeOptions={[5, 10, 15]}
        />
      </div>

      <Modal
        title={null}
        open={isUpdateModalVisible}
        footer={null}
        onCancel={handleUpdateModalClose}
        destroyOnClose
        width={500}
        styles={{
          body: { padding: 0 }
        }}      
      >
        {selectedAdmin && (
          <UpdateAdmin 
            onClose={handleUpdateModalClose} 
            adminData={selectedAdmin} 
          />
        )}
      </Modal>
    </div>
  );
}
