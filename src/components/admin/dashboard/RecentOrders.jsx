import React from "react";
import { Card, Space, Button, Table, Tag } from "antd";
import { FaTicketAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
export default function RecentOrders({ recentOrders, formatCurrency }) {
  const recentOrderColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span className="text-ellipsis">{id.substring(0, 8)}...</span>,
    },
    {
      title: "Date booked",
      dataIndex: "order_date",
      key: "order_date",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Total amount",
      dataIndex: "total",
      key: "total",
      render: (total) => formatCurrency(parseInt(total)),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "paid" ? "success" : "warning"}>
          {status === "paid" ? "Paid" : "Processing"}
        </Tag>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
    >
      <Card
        className="mb-8"
        title={
          <Space size="middle">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FaTicketAlt className="text-xl" />
            </div>
            <span className="font-bold text-[var(--text-primary)]">Recent Orders</span>
          </Space>
        }
        extra={
          <Link to="/admin/orders">
            <Button type="primary" ghost>
            View all
          </Button>
          </Link>
        }
        style={{
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Table
          columns={recentOrderColumns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
          size="middle"
          className="responsive-table"
          rowClassName={(record, index) =>
            index % 2 === 0
              ? "bg-white hover:bg-blue-50"
              : "bg-gray-50 hover:bg-blue-50"
          }
        />
      </Card>
    </motion.div>
  );
} 