import { useState, useMemo } from "react";
import { Table, Button, Modal, Spin, Space } from "antd";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { useGetPriceSettingsQuery, useGetHolidayPricingQuery } from "@/api/priceSettingApi";
import AddPriceSetting from "./AddPriceSetting";
import UpdatePriceSetting from "./UpdatePriceSetting";
import AddHolidayPricing from "./AddHolidayPricing";
import UpdateHolidayItem from "./UpdateHolidayItem";
import { canPerformAdminAction } from "@/utils/auth";

export default function TicketPricing() {
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [isUpdatePriceModalOpen, setIsUpdatePriceModalOpen] = useState(false);
  const [isHolidayModalOpen, setIsHolidayModalOpen] = useState(false);
  const [isUpdateHolidayItemModalOpen, setIsUpdateHolidayItemModalOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  
  // Check if user has full admin permissions
  const canEditPricing = canPerformAdminAction();

  const { data: PriceSettings, isLoading, error } = useGetPriceSettingsQuery();
  const {data: HolidayDates, isLoading: isLoadingHoliday, error: errorHoliday} = useGetHolidayPricingQuery();

  const openPriceModal = () => setIsPriceModalOpen(true);
  const openUpdatePriceModal = () => setIsUpdatePriceModalOpen(true);
  const openHolidayModal = () => setIsHolidayModalOpen(true);
  
  const closePriceModal = () => setIsPriceModalOpen(false);
  const closeUpdatePriceModal = () => setIsUpdatePriceModalOpen(false);
  const closeHolidayModal = () => setIsHolidayModalOpen(false);
  const closeUpdateHolidayItemModal = () => {
    setIsUpdateHolidayItemModalOpen(false);
    setSelectedHoliday(null);
  };

  // Hàm mở modal chỉnh sửa ngày lễ
  const openUpdateHolidayItemModal = (holiday) => {
    setSelectedHoliday(holiday);
    setIsUpdateHolidayItemModalOpen(true);
  };


  // Columns for main price table
  const priceColumns = [
    {
      title: "No.",
      key: "stt",
      width: 70,
      render: (_, __, index) => index + 1
    },
    {
      title: "Regular Price",
      dataIndex: "base_ticket_price",
      key: "base_ticket_price",
      render: (price) => `${price?.toLocaleString() || 0} VND`
    },
    {
      title: "Weekend Price",
      dataIndex: "weekend_ticket_price",
      key: "weekend_ticket_price",
      render: (price) => `${price?.toLocaleString() || 0} VND`
    },
    {
      title: "Holiday Price",
      dataIndex: "holiday_ticket_price",
      key: "holiday_ticket_price",
      render: (price) => `${price?.toLocaleString() || 0} VND`
    }
  ];

  // Add actions column only if user has admin permissions
  if (canEditPricing) {
    priceColumns.push({
      title: "Actions",
      key: "actions",
      width: 200,
      render: () => (
        <Space>
          <Button 
            icon={<FiEdit2 />} 
            onClick={openUpdatePriceModal}
            title="Edit"
          >
            Edit
          </Button>
        </Space>
      ),
    });
  }

  // Columns for holidays table
  const holidayColumns = [
    {
      title: "No.",
      key: "stt",
      width: 70,
      render: (_, __, index) => index + 1
    },
    {
      title: "Holiday Date",
      dataIndex: "holiday_date",
      key: "holiday_date"
    },
    {
      title: "Holiday Name",
      dataIndex: "holiday_name",
      key: "holiday_name"
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? new Date(date).toLocaleString('en-US') : 'N/A'
    },
    {
      title: "Updated Date",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date) => date ? new Date(date).toLocaleString('en-US') : 'N/A'
    }
  ];

  // Add actions column for holidays only if user has admin permissions
  if (canEditPricing) {
    holidayColumns.push({
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<FiEdit2 />}
            onClick={() => openUpdateHolidayItemModal(record)}
            title="Chỉnh sửa"
          />
        </Space>
      )
    });
  }

  const priceData = useMemo(() => {
    if (!PriceSettings?.data) return [];
    return PriceSettings?.data;
  }, [PriceSettings]);
  
  const holidayData = useMemo(() => {
    if (!HolidayDates?.data) return [];
    return HolidayDates?.data;
  }, [HolidayDates]);
  
  // Kiểm tra xem đã có dữ liệu giá vé chưa
  const hasPriceData = priceData && priceData.length > 0;

  if (isLoading) return <Spin className="flex justify-center mt-10" size="large" />;
  if (error) return <div className="text-red-500">Lỗi khi tải dữ liệu!</div>;

  return (
    <div className="flex-1 ml-4 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Ticket Price Management</h2>
        {!hasPriceData && canEditPricing && (
          <div className="flex gap-2">
            <Button 
              type="primary" 
              onClick={openPriceModal}
              className="bg-blue-700"
            >
              Update Ticket Prices
            </Button>
          </div>
        )}
      </div>
      
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Price Table</h3>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table
            rowKey={(record) => record.id || 'single-record'}
            columns={priceColumns}
            dataSource={priceData}
            pagination={false}
            locale={{
              emptyText: "No ticket prices set"
            }}
          />
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Configured Holidays</h3>
          {hasPriceData && canEditPricing && (
            <Button 
              type="primary" 
              onClick={openHolidayModal}
              className="bg-blue-700"
            >
              Add Holiday
            </Button>
          )}
        </div>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <Table
            rowKey={(record) => record.id || 'holiday-' + record.holiday_date}
            columns={holidayColumns}
            dataSource={holidayData}
            pagination={false}
            locale={{
              emptyText: "No holidays configured"
            }}
          />
        </div>
      </div>

      {/* Modal để thêm mới giá vé */}
      <Modal
        title="Cài đặt giá vé"
        open={isPriceModalOpen}
        onCancel={closePriceModal}
        footer={null}
        destroyOnClose={true}
      >
        <AddPriceSetting 
          onCancel={closePriceModal} 
          currentData={null}
        />
      </Modal>

      {/* Modal để chỉnh sửa giá vé */}
      <Modal
        title="Chỉnh sửa giá vé"
        open={isUpdatePriceModalOpen}
        onCancel={closeUpdatePriceModal}
        footer={null}
        destroyOnClose={true}
      >
        <UpdatePriceSetting 
          onCancel={closeUpdatePriceModal} 
          currentData={PriceSettings?.data[0]}
        />
      </Modal>

      {/* Modal để thêm mới ngày lễ */}
      <Modal
        title="Thêm ngày lễ"
        open={isHolidayModalOpen}
        onCancel={closeHolidayModal}
        footer={null}
        destroyOnClose={true}
        width={600}
      >
        <AddHolidayPricing 
          onCancel={closeHolidayModal} 
          currentData={PriceSettings?.data[0]}
        />
      </Modal>

      {/* Modal để chỉnh sửa một ngày lễ cụ thể */}
      <Modal
        title="Chỉnh sửa ngày lễ"
        open={isUpdateHolidayItemModalOpen}
        onCancel={closeUpdateHolidayItemModal}
        footer={null}
        destroyOnClose={true}
      >
        {selectedHoliday && (
          <UpdateHolidayItem 
            onCancel={closeUpdateHolidayItemModal} 
            holidayItem={selectedHoliday}
            priceSettingId={PriceSettings?.data[0]?.id}
          />
        )}
      </Modal>
    </div>
  );
}
