import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Form,
  Input,
  InputNumber,
  DatePicker,
  Select,
  Button,
  Upload,
  message,
  Typography,
  Divider,
  Space,
  Spin
} from "antd";
import { 
  UploadOutlined, 
  PlusOutlined, 
  RollbackOutlined 
} from "@ant-design/icons";
import { useCreateMovieMutation } from "@/api/movieApi";
import { useGetActorsNotPageQuery } from "@/api/actorApi";
import { useGetDirectorsNotPageQuery } from "@/api/directorApi";
import { useGetProducersNotPageQuery } from "@/api/producerApi";
import { useGetAllGenresForDashboardQuery } from "@/api/genreApi";
import { useGetCountriesQuery } from "@/api/countryApi";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function AddMovies() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFileName, setPosterFileName] = useState("");
  const [releaseDate, setReleaseDate] = useState(null);
  
  const { data: directorData } = useGetDirectorsNotPageQuery();
  const directors = directorData?.data || [];
  
  const { data: actorData } = useGetActorsNotPageQuery();
  const actors = actorData?.data || [];
  
  const { data: producerData } = useGetProducersNotPageQuery();
  const producers = producerData?.data || [];
  
  const { data: genreData } = useGetAllGenresForDashboardQuery();
  const genres = genreData?.data || [];
  
  const [createMovie, { isLoading: isSubmitting }] = useCreateMovieMutation();
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  // Xử lý khi release_date thay đổi
  const handleReleaseDateChange = (date) => {
    setReleaseDate(date);
    
    // Lấy giá trị end_date hiện tại
    const currentEndDate = form.getFieldValue('end_date');
    
    // Nếu release_date bị xóa, tự động xóa end_date
    if (!date) {
      form.setFieldValue('end_date', null);
      return;
    }
    
    // Nếu đã có end_date và release_date > end_date, cập nhật end_date = release_date
    if (currentEndDate && date.isAfter(currentEndDate)) {
      form.setFieldValue('end_date', date);
    }
  };
  
  // Tạo hàm disabledDate cho end_date
  const disabledEndDate = (current) => {
    return releaseDate ? current && current.isBefore(releaseDate, 'day') : true;
  };

  const handlePosterChange = (info) => {    
    if (info && info.file) {
      const fileObj = info.file.originFileObj || info.file;
      
      setPosterFile(fileObj);
      setPosterFileName(fileObj.name);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(fileObj);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setIsFormSubmitting(true);
      
      // Validate the essential data
      if (!values.director_id) {
        message.error("Please select a director");
        setIsFormSubmitting(false);
        return;
      }
      
      if (!values.actor_ids || values.actor_ids.length === 0) {
        message.error("Please select at least one actor");
        setIsFormSubmitting(false);
        return;
      }
      
      if (!values.producer_ids || values.producer_ids.length === 0) {
        message.error("Please select at least one producer");
        setIsFormSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("year", values.year);
      formData.append("country", values.country || "");
      formData.append("description", values.description || "");
      formData.append("trailer", values.trailer || "");
      formData.append("age_rating", values.age_rating || 0);
      formData.append("duration", values.duration);
      formData.append("director_id", values.director_id);
      
      // Thêm release_date nếu có
      if (values.release_date) {
        formData.append("release_date", values.release_date.format('YYYY-MM-DD'));
      }
      
      // Thêm end_date nếu có
      if (values.end_date) {
        formData.append("end_date", values.end_date.format('YYYY-MM-DD'));
      }
      
      // Append multiple actors, producers, and genres
      values.actor_ids.forEach(actorId => {
        formData.append("actor_id", actorId);
      });
      
      values.producer_ids.forEach(producerId => {
        formData.append("producer_id", producerId);
      });
      
      if (values.genre_ids && values.genre_ids.length > 0) {
        values.genre_ids.forEach(genreId => {
          formData.append("genre_id", genreId);
        });
      }
      
      if (posterFile) {
        formData.append("poster", posterFile);
      }
      
      await createMovie(formData).unwrap();
      message.success("Movie added successfully!");
      navigate("/admin/movies");
    } catch (error) {
      console.error("Error creating movie:", error);
      message.error("Failed to add movie: " + (error.data?.message || "An error occurred"));
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Add New Movie</Title>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
          initialValues={{
            age_rating: 0
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="name"
              label="Movie Title"
              rules={[{ required: true, message: "Please enter movie title" }]}
            >
              <Input placeholder="Enter movie title" />
            </Form.Item>

            <Form.Item
              name="year"
              label="Production Year"
              rules={[
                { required: true, message: "Please enter production year" },
                {
                  validator: (_, value) => {
                    const currentYear = new Date().getFullYear();
                    if (value && (value < 1900 || value > currentYear)) {
                      return Promise.reject(`Production year must be between 1900 and ${currentYear}`);
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <InputNumber min={1900} max={new Date().getFullYear()} className="w-full" />
            </Form.Item>

            <Form.Item
              name="release_date"
              label="Release Date"
              rules={[{ required: true, message: "Please select release date" }]}
            >
              <DatePicker 
                className="w-full" 
                format="DD/MM/YYYY"
                placeholder="Select release date"
                onChange={handleReleaseDateChange}
              />
            </Form.Item>

            <Form.Item
              name="end_date"
              label="End Date"
              tooltip="Must be greater than or equal to release date"
            >
              <DatePicker 
                className="w-full" 
                format="DD/MM/YYYY"
                placeholder="Select end date"
                disabled={!releaseDate}
                disabledDate={disabledEndDate}
              />
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select production country" }]}
            >
              <CountrySelect />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[
                { required: true, message: "Please enter movie duration" },
                { type: 'number', min: 1, max: 240, message: "Duration must be between 1 and 240 minutes" }
              ]}
            >
              <InputNumber min={1} max={240} className="w-full" />
            </Form.Item>

            <Form.Item
              name="age_rating"
              label="Age Rating"
            >
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item
              name="trailer"
              label="Trailer"
            >
              <Input placeholder="Enter trailer URL (YouTube)" />
            </Form.Item>

            <Form.Item
              label="Movie Poster"
            >
              <div>
                <Upload
                  listType="picture-card"
                  beforeUpload={() => false}
                  onChange={handlePosterChange}
                  maxCount={1}
                  showUploadList={false}
                  accept="image/*"
                >
                  {posterPreview ? (
                    <div className="relative w-full h-32">
                      <img 
                        src={posterPreview} 
                        alt="Poster" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div className="mt-2">Upload poster</div>
                    </div>
                  )}
                </Upload>
                {posterFileName && (
                  <div className="mt-2 text-sm text-[var(--text-secondary)] font-semibold">
                    Selected file: {posterFileName}
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label="Description"
            className="col-span-full"
          >
            <TextArea rows={4} placeholder="Enter movie description" />
          </Form.Item>

          <Divider orientation="left">Cast, Director & Genre</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="director_id"
              label="Director"
              rules={[{ required: true, message: "Please select a director" }]}
            >
              <Select placeholder="Select director">
                {directors.map(director => (
                  <Option key={director.id} value={director.id}>{director.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="actor_ids"
              label="Actors"
              rules={[{ required: true, message: "Please select at least one actor" }]}
            >
              <Select 
                mode="multiple"
                placeholder="Select actors"
                optionFilterProp="children"
              >
                {actors.map(actor => (
                  <Option key={actor.id} value={actor.id}>{actor.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="producer_ids"
              label="Producers"
              rules={[{ required: true, message: "Please select at least one producer" }]}
            >
              <Select 
                mode="multiple"
                placeholder="Select producers"
                optionFilterProp="children"
              >
                {producers.map(producer => (
                  <Option key={producer.id} value={producer.id}>{producer.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="genre_ids"
              label="Genres"
            >
              <Select 
                mode="multiple"
                placeholder="Select genres"
                optionFilterProp="children"
              >
                {genres.map(genre => (
                  <Option key={genre.id} value={genre.id}>{genre.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="mt-6">
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting || isFormSubmitting}
                disabled={isSubmitting || isFormSubmitting}
                icon={<PlusOutlined />}
                className="bg-blue-500"
              >
                {(isSubmitting || isFormSubmitting) ? "Processing..." : "Add Movie"}
              </Button>
              <Button 
                icon={<RollbackOutlined />}
                onClick={() => navigate("/admin/movies")}
                disabled={isSubmitting || isFormSubmitting}
              >
                Back
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}

// Component cho Select quốc gia
function CountrySelect({ value, onChange }) {
  const { data: countriesData, isLoading, error } = useGetCountriesQuery();
  
  if (isLoading) return <Spin size="small" />;
  
  if (error) {
    console.error("Error loading country list:", error);
    return <Input placeholder="Enter production country" value={value} onChange={onChange} />;
  }

  const countries = countriesData || [];

  return (
    <Select 
      showSearch
      placeholder="Select production country"
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().includes(input.toLowerCase())
      }
      value={value}
      onChange={onChange}
    >
      {countries.map(country => (
        <Option key={country.code} value={country.name}>
          {country.name}
        </Option>
      ))}
    </Select>
  );
}
