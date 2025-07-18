import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  SaveOutlined, 
  RollbackOutlined 
} from "@ant-design/icons";
import {
  useGetMovieByIdQuery,
  useUpdateMovieMutation,
} from "@/api/movieApi";
import { useGetActorsNotPageQuery } from "@/api/actorApi";
import { useGetDirectorsNotPageQuery } from "@/api/directorApi";
import { useGetProducersNotPageQuery } from "@/api/producerApi";
import { useGetAllGenresForDashboardQuery } from "@/api/genreApi";
import { useGetCountriesQuery } from "@/api/countryApi";
import { formatImage } from "@/utils/formatImage";
import moment from "moment";

const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function EditMovies() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const { data: movieData, error, isLoading } = useGetMovieByIdQuery(id, {
    skip: !id,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: false,
    refetchOnFocus: false
  });
  const movie = movieData?.movie;
  const [updateMovie, { isLoading: isUpdating }] = useUpdateMovieMutation();

  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState("");
  const [posterFileName, setPosterFileName] = useState("");
  const [formInitialized, setFormInitialized] = useState(false);
  const [releaseDate, setReleaseDate] = useState(null);

  const { data: directorData } = useGetDirectorsNotPageQuery();
  const directors = directorData?.data || [];
  
  const { data: actorData } = useGetActorsNotPageQuery();
  const actors = actorData?.data || [];
  
  const { data: producerData } = useGetProducersNotPageQuery();
  const producers = producerData?.data || [];
  
  const { data: genreData } = useGetAllGenresForDashboardQuery();
  const genres = genreData?.data || [];

  const handleReleaseDateChange = (date) => {
    setReleaseDate(date);
    const currentEndDate = form.getFieldValue('end_date');
    if (!date) {
      form.setFieldValue('end_date', null);
      return;
    }
    if (currentEndDate && date.isAfter(currentEndDate)) {
      form.setFieldValue('end_date', date);
    }
  };

  const disabledEndDate = (current) => {
    return releaseDate ? current && current.isBefore(releaseDate, 'day') : true;
  };

  useEffect(() => {
    if (movie?.poster && !posterPreview) {
      const posterUrl = formatImage(movie.poster);
      setPosterPreview(posterUrl);
      const posterPathParts = movie.poster.split('/');
      setPosterFileName(posterPathParts[posterPathParts.length - 1]);
    }
  }, [movie, posterPreview]);

  useEffect(() => {
    if (movie && !formInitialized) {
      const actorIds = movie.MovieActors?.map(ma => ma.Actor?.id || ma.actor_id) || [];
      const genreIds = movie.MovieGenres?.map(mg => mg.Genre?.id || mg.genre_id) || [];
      const producerIds = movie.MovieProducers?.map(mp => mp.Producer?.id || mp.producer_id) || [];
      const releaseDateMoment = movie.release_date ? moment(movie.release_date) : null;
      const endDateMoment = movie.end_date ? moment(movie.end_date) : null;

      if (releaseDateMoment) {
        setReleaseDate(releaseDateMoment);
      }

      const formValues = {
        name: movie.name,
        description: movie.description,
        trailer: movie.trailer,
        year: movie.year,
        country: movie.country,
        age_rating: movie.age_rating || 0,
        duration: movie.duration,
        director_id: movie.Director?.id || movie.director_id,
        actor_ids: actorIds,
        genre_ids: genreIds,
        producer_ids: producerIds,
        release_date: releaseDateMoment,
        end_date: endDateMoment
      };

      form.setFieldsValue(formValues);
      setFormInitialized(true);
    }
  }, [movie, form, formInitialized]);

  const handlePosterChange = (info) => {    
    if (info && info.file) {
      const fileObj = info.file.originFileObj || info.file;
      setPosterFile(fileObj);
      setPosterFileName(fileObj.name);
      const reader = new FileReader();
      reader.onload = () => setPosterPreview(reader.result);
      reader.readAsDataURL(fileObj);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (!values.director_id) {
        message.error("Please select a director");
        return;
      }
      if (!values.actor_ids || values.actor_ids.length === 0) {
        message.error("Please select at least one actor");
        return;
      }
      if (!values.producer_ids || values.producer_ids.length === 0) {
        message.error("Please select at least one producer");
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

      if (values.release_date) {
        formData.append("release_date", values.release_date.format('YYYY-MM-DD'));
      }
      if (values.end_date) {
        formData.append("end_date", values.end_date.format('YYYY-MM-DD'));
      }

      values.actor_ids.forEach(actorId => {
        formData.append("actor_id", actorId);
      });
      values.producer_ids.forEach(producerId => {
        formData.append("producer_id", producerId);
      });
      if (values.genre_ids?.length > 0) {
        values.genre_ids.forEach(genreId => {
          formData.append("genre_id", genreId);
        });
      }
      if (posterFile) {
        formData.append("poster", posterFile);
      }

      await updateMovie({ id, movieData: formData }).unwrap();
      message.success("Movie updated successfully!");
      navigate("/admin/movies");
    } catch (error) {
      console.error("Error updating movie:", error);
      message.error("Failed to update movie: " + (error.data?.message || "An error occurred"));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-red-500 bg-red-50 p-4 rounded-lg">
          Error loading data: {error.message || "Could not load movie information"}
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-amber-500 bg-amber-50 p-4 rounded-lg">
          Movie not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={3}>Edit Movie</Title>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="name"
              label="Movie Title"
              rules={[{ required: true, message: "Please enter the movie title" }]}
            >
              <Input placeholder="Enter movie title" />
            </Form.Item>

            <Form.Item
              name="year"
              label="Release Year"
              rules={[
                { required: true, message: "Please enter the release year" },
                {
                  validator: (_, value) => {
                    const currentYear = new Date().getFullYear();
                    if (value && (value < 1900 || value > currentYear)) {
                      return Promise.reject(`Year must be between 1900 and ${currentYear}`);
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
              label="End Showing Date"
              tooltip="Must be after or equal to release date"
            >
              <DatePicker 
                className="w-full" 
                format="DD/MM/YYYY"
                placeholder="Select end showing date"
                disabled={!releaseDate}
                disabledDate={disabledEndDate}
              />
            </Form.Item>

            <Form.Item
              name="country"
              label="Country"
              rules={[{ required: true, message: "Please select country" }]}
            >
              <CountrySelect />
            </Form.Item>

            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[
                { required: true, message: "Please enter duration" },
                { type: 'number', min: 1, max: 240, message: "Duration must be from 1 to 240 minutes" }
              ]}
            >
              <InputNumber min={1} max={240} className="w-full" />
            </Form.Item>

            <Form.Item name="age_rating" label="Age Rating">
              <InputNumber min={0} className="w-full" />
            </Form.Item>

            <Form.Item name="trailer" label="Trailer">
              <Input placeholder="Enter YouTube trailer link" />
            </Form.Item>

            <Form.Item label="Movie Poster">
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
                      <div className="mt-2">Upload Poster</div>
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

          <Form.Item name="description" label="Description" className="col-span-full">
            <TextArea rows={4} placeholder="Enter movie description" />
          </Form.Item>

          <Divider orientation="left">Cast, Director & Genre</Divider>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Item
              name="director_id"
              label="Director"
              rules={[{ required: true, message: "Please select a director" }]}
            >
              <Select placeholder="Select a director">
                {directors.map(d => (
                  <Option key={d.id} value={d.id}>{d.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="actor_ids"
              label="Actors"
              rules={[{ required: true, message: "Please select at least one actor" }]}
            >
              <Select mode="multiple" placeholder="Select actors" optionFilterProp="children">
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
              <Select mode="multiple" placeholder="Select producers" optionFilterProp="children">
                {producers.map(p => (
                  <Option key={p.id} value={p.id}>{p.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="genre_ids" label="Genres">
              <Select mode="multiple" placeholder="Select genres" optionFilterProp="children">
                {genres.map(g => (
                  <Option key={g.id} value={g.id}>{g.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item className="mb-0 mt-6">
            <Space className="w-full justify-end">
              <Button 
                icon={<RollbackOutlined />}
                onClick={() => navigate("/admin/movies")}
              >
                Go Back
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

function CountrySelect({ value, onChange }) {
  const { data: countriesData, isLoading, error } = useGetCountriesQuery();
  
  if (isLoading) return <Spin size="small" />;
  
  if (error) {
    console.error("Error loading countries:", error);
    return <Input placeholder="Enter country" value={value} onChange={onChange} />;
  }

  const countries = countriesData || [];

  return (
    <Select 
      showSearch
      placeholder="Select country"
      optionFilterProp="children"
      filterOption={(input, option) =>
        option.children.toLowerCase().includes(input.toLowerCase())
      }
      value={value}
      onChange={onChange}
    >
      {countries.map(c => (
        <Option key={c.code} value={c.name}>{c.name}</Option>
      ))}
    </Select>
  );
}