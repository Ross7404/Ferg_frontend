import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Typography,
  Space
} from "antd";
import {
  UploadOutlined,
  CloseOutlined,
  PlusOutlined
} from "@ant-design/icons";
import { useCreateProducerMutation } from "@/api/producerApi";

const { Title } = Typography;
const { TextArea } = Input;

export default function AddProducer() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [createProducer, { isLoading }] = useCreateProducerMutation();

  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setPreviewImage("");
    }
  };

  const handleSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");

      if (fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("profile_picture", fileList[0].originFileObj);
      }

      await createProducer(formData).unwrap();
      message.success("Producer added successfully!");
      navigate("/admin/producers");
    } catch (error) {
      console.error("Error adding producer:", error);
      message.error("Failed to add producer!");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Add New Producer</Title>
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

          <Form.Item
            name="profile_picture"
            label="Profile Picture"
            valuePropName="fileList"
            getValueFromEvent={e => e && e.fileList}
          >
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
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea
              rows={4}
              placeholder="Producer description..."
            />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => navigate("/admin/producers")}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isLoading}
                icon={<PlusOutlined />}
                className="bg-blue-500"
              >
                Add Producer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
