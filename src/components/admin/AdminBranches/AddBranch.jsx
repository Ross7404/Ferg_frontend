import { Select, Input, Form, Button, Typography, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import citiesData from "@/public/vietnamAddress.json";
import { useCreateBranchMutation } from "@/api/branchApi";
import { toast } from "react-toastify";

const { Option } = Select;
const { Title } = Typography;

export default function AddBranch({handleAddModalClose}) {
  const [form] = Form.useForm();
  const [Add, { isLoading }] = useCreateBranchMutation();

  const onFinish = async (values) => {    
    try {
      const branchData = {
        name: values.name,
        city: values.city,
      };
      
      await Add(branchData).unwrap();
      toast.success("Branch added successfully!");
      form.resetFields();
      handleAddModalClose(); 
    } catch (error) {
      console.error("Failed to add branch:", error);
      toast.error("Failed to add branch. Please try again.");
    }
  };

  return (
    <div className="mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Add New Branch</Title>
      </div>

      <div>
        <Form
          form={form}
          name="addBranch"
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
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={isLoading}
                icon={<PlusOutlined />}
                className="bg-blue-500"
              >
                Add Branch
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

