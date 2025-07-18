import { useState } from "react";
import PropTypes from "prop-types";
import { useAddFoodAndDrinkMutation } from "../../../api/foodAndDrinkApi";
import { toast } from "react-toastify";
import { Form, Input, Select, Button, Space, message } from "antd";
import { FiUpload, FiX } from "react-icons/fi";

const { Option } = Select;

const AddFoodAndDrink = ({ setAddForm }) => {
  const [form] = Form.useForm();
  const [addFoodAndDrink] = useAddFoodAndDrinkMutation();
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      
      // Create FormData object
      const formData = new FormData();
      formData.append("name", values.name || "");
      formData.append("type", values.type || "");
      formData.append("price", values.price || "0");
      
      if (imageFile) {
        formData.append("profile_picture", imageFile);
      }

      // Call API with FormData
      const response = await addFoodAndDrink(formData).unwrap();
      toast.success("Item added successfully!");
      setAddForm(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(`Add item failed: ${error.data?.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setImageFile(file);
      
      // Create URL for preview
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      
      // Show success message
      message.success(`Upload ${file.name} successfully`);
    }
  };
  
  // Handle removing preview image
  const handleClosePreview = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      autoComplete="off"
      encType="multipart/form-data"
    >
      <Form.Item
        label="Item Name"
        name="name"
        rules={[{ required: true, message: 'Please enter item name!' }]}
      >
        <Input placeholder="Enter item name..." />
      </Form.Item>

      <Form.Item
        label="Type"
        name="type"
        rules={[{ required: true, message: 'Please select item type!' }]}
      >
        <Select placeholder="Select type">
          <Option value="food">Food</Option>
          <Option value="drink">Drink</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Price (VND)"
        name="price"
        rules={[{ required: true, message: 'Please enter price!' }]}
      >
        <Input type="number" min={0} placeholder="Enter price..." />
      </Form.Item>

      <Form.Item label="Image">
        <div className="mt-1 flex justify-center px-3 py-3 border-2 border-gray-200 border-dashed rounded-lg hover:border-gray-300 transition-colors duration-200">
          <div className="space-y-2 text-center">
            {imagePreview ? (
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleClosePreview}
                  className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <>
                <FiUpload className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
                <div className="flex justify-center text-sm text-[var(--text-secondary)]">
                  <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                    <span>Upload Image</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleImageChange}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, GIF up to 10MB</p>
              </>
            )}
          </div>
        </div>
      </Form.Item>

      <Form.Item className="mb-0">
        <Space className="w-full justify-end">
          <Button onClick={() => setAddForm(false)}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Add Item
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddFoodAndDrink;
