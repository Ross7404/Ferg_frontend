import { useState } from "react";
import { Form, Input, Button, message, Typography, Space } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useCreateSeatTypesMutation } from "@/api/seatTypeApi";

const { Title } = Typography;
const { TextArea } = Input;

export default function AddSeatType({ isShowFormCreate }) {
  const [form] = Form.useForm();
  const [createSeatType, { isLoading }] = useCreateSeatTypesMutation();
  const [color, setColor] = useState("#000000");

  const onSubmit = async (values) => {
    try {
      const response = await createSeatType(values).unwrap();
      message.success(response?.message || "Seat type added successfully!");
      isShowFormCreate(false);
    } catch (error) {
      console.error("Error adding seat type:", error);
      message.error("Failed to add seat type!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">Add Seat Type</Title>
          <Button 
            type="text" 
            icon={<CloseOutlined />} 
            onClick={() => isShowFormCreate(false)}
            className="absolute right-2 top-2"
          />
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          requiredMark={false}
          initialValues={{ color: "#000000" }}
        >
          <Form.Item
            name="type"
            label="Seat Type Name"
            rules={[
              { required: true, message: "Please enter the seat type name" }
            ]}
          >
            <Input placeholder="VIP, Regular, etc." />
          </Form.Item>

          <Form.Item
            name="color"
            label="Color"
            rules={[
              { required: true, message: "Please select a color" }
            ]}
          >
            <div className="flex items-center space-x-2">
              <input
                type="color"
                value={color}
                onChange={(e) => {
                  setColor(e.target.value);
                  form.setFieldsValue({ color: e.target.value });
                }}
                className="w-10 h-10 border-0 p-0 cursor-pointer"
              />
              <Input 
                value={color} 
                className="flex-1" 
                readOnly
              />
            </div>
          </Form.Item>

          <Form.Item
            name="price_offset"
            label="Additional Price"
            rules={[
              { required: true, message: "Please enter the additional price" },
              { 
                type: 'number', 
                min: 0, 
                message: "Additional price cannot be negative"
              }
            ]}
          >
            <Input 
              prefix="$" 
              type="number" 
              placeholder="20.00" 
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button 
                onClick={() => isShowFormCreate(false)}
              >
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                className="bg-blue-500"
              >
                Add Seat Type
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
