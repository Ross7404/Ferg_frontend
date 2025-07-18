import { useState, useMemo } from "react";
import { Form, Input, Select, Button, message } from "antd";
import {
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { useGetBranchesQuery } from "@/api/branchApi";
import { useCreateUserByAdminMutation } from "@/api/userApi";

const { Option } = Select;

export default function AddAdmin({ setIsFormCreate }) {
  const { data: branchesData, isLoading: loadingBranches } =
    useGetBranchesQuery();
  const [addBranchAdmin, { isLoading }] = useCreateUserByAdminMutation();
  const [form] = Form.useForm();
  const [passwordVisible, setPasswordVisible] = useState(false);

  const branches = useMemo(() => branchesData?.branches || [], [branchesData]);

  const onSubmit = async (values) => {
    try {
      const response = await addBranchAdmin(values).unwrap();
      if (response.status === 409 && response.error) {
        message.error(response.message || "Email already exists");
        return;
      }

      if (response.success) {
        message.success(response.message || "Admin creation successful");
        setIsFormCreate(false);
      }
    } catch (error) {
      message.error("Có lỗi xảy ra: " + (error.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 relative mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium m-0">Add admin</h4>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="branch_id"
          label="Branch"
          rules={[{ required: true, message: "Please select a branch" }]}
        >
          <Select placeholder="Select branch">
            {branches?.map((branch) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter a username" }]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter an email" },
            { type: "email", message: "Email is not valid" },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: "Please enter a password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password
            placeholder="Enter password"
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
            Create Administrator
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
