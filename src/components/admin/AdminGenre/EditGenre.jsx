import { Form, Input, Button, message, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useUpdateGenreMutation } from "@/api/genreApi";
import PropTypes from 'prop-types';

const { Title, Text } = Typography;

export default function EditGenre({ id, name, setToggleUpdateGenre }) {
  const [form] = Form.useForm();
  const [updateGenre, { isLoading }] = useUpdateGenreMutation();

  const handleSubmit = async (values) => {
    try {
      await updateGenre({ id, name: values.name }).unwrap();      
      message.success("Genre updated successfully!");
      setToggleUpdateGenre(false);
    } catch (error) {
      message.error("Failed to update genre. Please try again.");
    }
  };

  return (
    <div className="p-6 relative w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <Title level={4}>Edit Genre</Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ name }}
        requiredMark={false}
      >
        <Form.Item
          name="name"
          label="Genre name"
          rules={[
            { required: true, message: "Please enter the genre name" },
            { min: 3, message: "Genre name must be at least 3 characters" }
          ]}
        >
          <Input placeholder="Enter genre name" />
        </Form.Item>

        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={() => setToggleUpdateGenre(false)}>
            Cancel
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isLoading}
            className="bg-blue-500"
          >
            Update
          </Button>
        </div>
      </Form>
    </div>
  );
}

EditGenre.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  setToggleUpdateGenre: PropTypes.func.isRequired
};
