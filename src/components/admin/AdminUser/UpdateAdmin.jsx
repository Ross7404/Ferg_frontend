import { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useUpdateAdminMutation } from "@/api/userApi";

export default function UpdateAdmin({ onClose, adminData }) {
  const [updateAdmin, { isLoading }] = useUpdateAdminMutation();
  const [form] = Form.useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    // Thiết lập giá trị ban đầu cho form
    if (adminData) {
      form.setFieldsValue({
        username: adminData.username,
        email: adminData.email,
      });
    }
  }, [adminData, form]);

  const onSubmit = async (values) => {
    try {
      // Nếu mật khẩu trống, không gửi lên
      const dataToSubmit = { ...values };
      if (!dataToSubmit.password) {
        delete dataToSubmit.password;
      }

      const response = await updateAdmin({
        id: adminData.id,
        ...dataToSubmit
      }).unwrap();

      message.success("Update successful");
      onClose();
    } catch (error) {
      message.error("Có lỗi xảy ra: " + (error.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 relative mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium m-0">Update admin</h4>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter username" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter email" },
            { type: "email", message: "Email is not valid" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="New password (do not fill in if not changed)"
          rules={[
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            placeholder="Enter new password"
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            visibilityToggle={{
              visible: passwordVisible,
              onVisibleChange: setPasswordVisible,
            }}
          />
        </Form.Item>

        <Form.Item className="mb-0 mt-4">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="w-full bg-blue-500"
          >
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
} 