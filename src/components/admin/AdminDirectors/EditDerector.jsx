import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Upload,
  message,
  Typography,
  Space,
  Spin,
} from "antd";
import { UploadOutlined, CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { useGetDirectorByIdQuery, useUpdateDirectorMutation } from "@/api/directorApi";
import dayjs from "dayjs";
import { formatImage } from "../../../utils/formatImage";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function EditDirector() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { data: directorData, isLoading } = useGetDirectorByIdQuery(id);
  const [updateDirector, { isLoading: isUpdating }] = useUpdateDirectorMutation();    
  const currentDirector = directorData?.director;

  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    if (currentDirector) {
      form.setFieldsValue({
        name: currentDirector.name,
        dob: currentDirector.dob ? dayjs(currentDirector.dob) : null,
        bio: currentDirector.bio || "",
        gender: currentDirector.gender || "Male",
      });
      
      if (currentDirector.profile_picture) {
        setPreviewImage(formatImage(currentDirector.profile_picture));
      }
    }
  }, [currentDirector, form]);

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
      if (values.dob) {
        const dobString = values.dob.format("YYYY-MM-DD");
        formData.append("dob", dobString);
      }
      if (values.bio) {
        formData.append("bio", values.bio);
      }
      formData.append("gender", values.gender || "Male");

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      const directorId = parseInt(id, 10);

      await updateDirector({
        id: directorId,
        formData: formData
      }).unwrap();

      message.success("Director updated successfully!");
      navigate("/admin/directors");
    } catch (error) {
      console.error("Update error details:", error);
      message.error("Failed to update director! " + (error.data?.message || error.message || ""));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (!currentDirector) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-red-500 mb-4">Director not found!</div>
          <Button type="primary" onClick={() => navigate("/admin/directors")}>
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Edit Director</Title>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          onClick={() => navigate("/admin/directors")}
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Director Name"
              rules={[{ required: true, message: "Please enter the director's name" }]}
            >
              <Input placeholder="Enter director's name" />
            </Form.Item>

            <Form.Item
              name="dob"
              label="Date of Birth"
              rules={[{ required: true, message: "Please select a date of birth" }]}
            >
              <DatePicker 
                className="w-full"
                format="DD/MM/YYYY"
                disabledDate={current => current && current > dayjs().endOf('day')}
              />
            </Form.Item>

            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Please select a gender" }]}
            >
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <div className="space-y-4">
              <div className="font-medium text-[var(--text-secondary)]">Profile Picture</div>
              
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
                    alt="Current profile"
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = '/placeholder-director.png';
                    }}
                  />
                  <div className="text-xs text-[var(--text-secondary)] mt-1">Current profile picture</div>
                </div>
              )}
            </div>
          </div>

          <Form.Item
            name="bio"
            label="Biography"
          >
            <TextArea rows={4} placeholder="Enter director's biography..." />
          </Form.Item>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button onClick={() => navigate("/admin/directors")}>
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
