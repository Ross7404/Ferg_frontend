import { Form, Input, Button, message, Typography } from "antd";
import { useCreateGenreMutation } from "@/api/genreApi";
import PropTypes from "prop-types";

const { Title } = Typography;

export default function AddGenre({ setAddGenre }) {
  const [form] = Form.useForm();
  const [createGenre, { isLoading }] = useCreateGenreMutation();

  const handleSubmit = async (values) => {
    try {
      const response = await createGenre({ name: values.name }).unwrap();
      if (response?.success) {
        message.success(response.message || "Genre added successfully!");
        setAddGenre(false);
        form.resetFields();
      }
    } catch (error) {
      message.error("Failed to add genre. Please try again.");
    }
  };

  return (
    <div className="p-6 relative w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <Title level={4}>Add Genre</Title>
      </div>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Genre Name"
          rules={[
            { required: true, message: "Please enter the genre name" },
            { min: 3, message: "Genre name must be at least 3 characters" },
          ]}
        >
          <Input placeholder="Enter genre name" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setAddGenre(false)}>Cancel</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="bg-blue-500"
          >
            Add
          </Button>
        </div>
      </Form>
    </div>
  );
}

AddGenre.propTypes = {
  setAddGenre: PropTypes.func.isRequired,
};
