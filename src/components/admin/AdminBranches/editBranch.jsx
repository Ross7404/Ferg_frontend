import { useEffect } from "react";
import { Form, Input, Select, Button, Typography, Space } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import citiesData from "@/public/vietnamAddress.json";
import {
  useUpdateBranchMutation,
} from "@/api/branchApi";

const { Option } = Select;
const { Title } = Typography;

export default function EditBranch({branch, handleAddModalClose}) {  
  const [form] = Form.useForm();
  const [update, { isLoading }] = useUpdateBranchMutation();

  useEffect(() => {
    if (branch) {
      form.setFieldsValue({
        name: branch.name,
        city: branch.city
      });
    }
  }, [branch, form]);

  const onFinish = async (values) => {
    try {
      await update({
        id: branch.id,
        name: values.name,
        city: values.city
      }).unwrap();
      
      toast.success("Branch updated successfully!");
      form.resetFields();
      handleAddModalClose();
    } catch (error) {
      console.error("Error updating branch:", error);
      toast.error("Failed to update branch. Please try again!");
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Edit Branch</Title>
      </div>

      <div>
        <Form
          form={form}
          name="editBranch"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <div>
            <Form.Item
              name="name"
              label="Branch Name"
              rules={[{ required: true, message: 'Branch name is required' }]}
            >
              <Input placeholder="Enter branch name" />
            </Form.Item>

            <Form.Item
              name="city"
              label="City"
              rules={[{ required: true, message: 'City is required' }]}
            >
              <Select
                showSearch
                placeholder="Select city"
                optionFilterProp="children"
                filterOption={(input, option) => 
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                allowClear
              >
                {citiesData.map(city => (
                  <Option key={city.Id} value={city.Name}>
                    {city.Name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => navigate("/admin/branches")}>
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                icon={<SaveOutlined />}
                className="bg-blue-500"
              >
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
