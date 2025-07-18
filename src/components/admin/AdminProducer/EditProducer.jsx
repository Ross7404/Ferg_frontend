import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Space,
  Spin
} from "antd";
import { UploadOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { useGetProducerByIdQuery, useUpdateProducerMutation } from "@/api/producerApi";
import { formatImage } from "@/utils/formatImage";

const { Title } = Typography;
const { TextArea } = Input;

export default function EditProducer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: producerData, isLoading } = useGetProducerByIdQuery(id);
  const [updateProducer, { isLoading: isUpdating }] = useUpdateProducerMutation();

  const currentProducer = producerData?.producer;

  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (currentProducer) {
      form.setFieldsValue({
        name: currentProducer.name,
        description: currentProducer.description || "",
      });

      if (currentProducer.profile_picture) {
        setPreviewImage(formatImage(currentProducer.profile_picture));
      }
    }
  }, [currentProducer, form]);

  const handleFileChange = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const file = newFileList[0].originFileObj;
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.description) {
        formData.append("description", values.description);
      }

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      const producerId = parseInt(id, 10);

      await updateProducer({
        id: producerId,
        formData
      }).unwrap();

      message.success("Producer updated successfully!");
      navigate("/admin/producers");
    } catch (error) {
      console.error("Error updating producer:", error);
      message.error("Failed to update producer: " + (error.data?.message || error.message || ""));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  if (!currentProducer) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-red-500 mb-4">Producer not found!</div>
          <Button type="primary" onClick={() => navigate("/admin/producers")}>
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Edit Producer</Title>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={() => navigate("/admin/producers")}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="Producer Name"
            rules={[{ required: true, message: "Please enter the producer's name" }]}
          >
            <Input placeholder="Enter producer name" />
          </Form.Item>

          <Form.Item label="Profile Picture">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleFileChange}
              beforeUpload={() => false}
              maxCount={1}
            >
              {fileList.length < 1 && (
                <div>
                  <UploadOutlined />
                  <div className="mt-2">Upload</div>
                </div>
              )}
            </Upload>
            {previewImage && fileList.length < 1 && (
              <div className="mt-2">
                <img
                  src={previewImage}
                  alt="Current avatar"
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => {
                    e.target.src = '/placeholder-producer.png';
                  }}
                />
                <div className="text-xs text-[var(--text-secondary)] mt-1">Current image</div>
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={4} placeholder="Producer description..." />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => navigate("/admin/producers")}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isUpdating}
                icon={<SaveOutlined />}
                className="bg-blue-500"
              >
                Save Changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
