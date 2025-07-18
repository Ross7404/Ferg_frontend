import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  message,
  Upload,
  Typography,
  Spin,
} from "antd";
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import { useUpdateActorMutation, useGetActorByIdQuery } from "@/api/actorApi";
import PropTypes from "prop-types";
import moment from "moment";
import { formatImage } from "@/utils/formatImage";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

export default function EditActor({
  id: propId,
  actor: propActor,
  onClose: propOnClose,
}) {
  const params = useParams();
  const navigate = useNavigate();
  const [updateActor, { isLoading: isUpdating }] = useUpdateActorMutation();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const isPageMode = !propOnClose;

  const actorId = propId || parseInt(params.id, 10);

  const { data: fetchedActor, isLoading: isLoadingActor } = useGetActorByIdQuery(
    actorId,
    { skip: !isPageMode || !!propActor }
  );
  const actor = fetchedActor?.actor || propActor || {};

  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      navigate("/admin/actors");
    }
  };

  useEffect(() => {
    if (actor) {
      form.setFieldsValue({
        name: actor.name,
        dob: actor.dob ? moment(actor.dob) : null,
        bio: actor.bio,
        gender: actor.gender || "Male",
      });

      if (actor.profile_picture) {
        setPreviewImage(formatImage(actor.profile_picture));
      }
    }
  }, [actor, form]);

  const onFinish = async (values) => {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("gender", values.gender);

      if (values.dob) {
        formData.append("dob", values.dob.format("YYYY-MM-DD"));
      }

      if (values.bio) {
        formData.append("bio", values.bio);
      }

      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }

      await updateActor({ id: actorId, formData }).unwrap();
      message.success("Actor updated successfully!");
      handleClose();
    } catch (error) {
      message.error(
        "Failed to update actor: " + (error.data?.message || error.message)
      );
    }
  };

  const handleFileChange = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);

    if (newFileList.length > 0 && newFileList[0].originFileObj) {
      setSelectedFile(newFileList[0].originFileObj);

      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(newFileList[0].originFileObj);
    } else {
      setSelectedFile(null);
    }
  };

  if (isLoadingActor || (!actor && !isPageMode)) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spin size="large" />
      </div>
    );
  }

  if (!actor && isPageMode) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <div className="text-red-500 mb-4">Actor not found!</div>
          <Button type="primary" onClick={() => navigate("/admin/actors")}>
            Back to list
          </Button>
        </div>
      </div>
    );
  }

  const content = (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      requiredMark={false}
    >
      <Form.Item
        name="name"
        label="Actor Name"
        rules={[
          { required: true, message: "Please enter the actor's name" },
          { min: 2, message: "Name must be at least 2 characters long" },
        ]}
      >
        <Input placeholder="Enter actor's name" />
      </Form.Item>

      <Form.Item
        name="dob"
        label="Date of Birth"
        rules={[{ required: true, message: "Please select the date of birth" }]}
      >
        <DatePicker
          format="DD/MM/YYYY"
          placeholder="Select date of birth"
          style={{ width: "100%" }}
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
        </Select>
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
              <div style={{ marginTop: 8 }}>Upload Image</div>
            </div>
          )}
        </Upload>

        {previewImage && fileList.length < 1 && (
          <div className="mt-2">
            <img
              src={previewImage}
              alt="Current Image"
              className="w-20 h-20 object-cover rounded"
              onError={(e) => {
                e.target.src = "/placeholder-actor.png";
              }}
            />
            <div className="text-xs text-[var(--text-secondary)] mt-1">Current image</div>
          </div>
        )}
      </Form.Item>

      <Form.Item name="bio" label="Biography">
        <TextArea rows={4} placeholder="Enter biography" />
      </Form.Item>

      <Form.Item className="flex justify-end gap-2 mb-0">
        <Button onClick={handleClose}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={isUpdating}>
          Update
        </Button>
      </Form.Item>
    </Form>
  );

  if (isPageMode) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Title level={4}>Edit Actor</Title>
          <Button type="text" icon={<CloseOutlined />} onClick={handleClose} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">{content}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 relative w-full">
      <Button
        type="text"
        icon={<CloseOutlined />}
        onClick={handleClose}
        className="absolute right-2 top-2"
      />
      <div className="text-center mb-6">
        <Title level={4}>Edit Actor</Title>
      </div>
      {content}
    </div>
  );
}

EditActor.propTypes = {
  id: PropTypes.number,
  actor: PropTypes.object,
  onClose: PropTypes.func,
};
