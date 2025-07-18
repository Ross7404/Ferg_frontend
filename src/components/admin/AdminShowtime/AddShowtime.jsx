import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Form,
  Select,
  TimePicker,
  Button,
  Table,
  message,
  Space,
  Spin,
  Typography,
  InputNumber,
  DatePicker,
} from "antd";
import { FiPlus, FiX, FiTrash2 } from "react-icons/fi";
import { useGetCinemaByBranchIdQuery, useGetAllCinemaNotPaginationQuery } from "@/api/cinemaApi";
import { useGetRoomsByCinemaIdQuery } from "@/api/roomApi";
import { useGetMoviesByAddShowtimeQuery } from "@/api/movieApi";
import {
  useCreateShowtimeMutation,
  useLazyGetShowtimeByRoomIdQuery,
} from "@/api/showtimeApi";
import { useGetPriceSettingsQuery } from "@/api/priceSettingApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

// Hàm kiểm tra trùng lịch chiếu (cập nhật để kiểm tra cả ngày và giờ)
const checkDuplicateShowtime = (
  showtimes,
  roomId,
  selectedDate,
  start,
  end
) => {
  return showtimes.some((showtime) => {
    // Kiểm tra nếu cùng phòng và cùng ngày
    const isSameRoom = Number(showtime.room_id) === Number(roomId);
    const isSameDate = showtime.show_date === selectedDate;

    if (!isSameRoom || !isSameDate) return false;

    // Kiểm tra thời gian có bị chồng chéo không
    return (
      (start >= new Date(`2023-01-01T${showtime.start_time}`).getTime() &&
        start < new Date(`2023-01-01T${showtime.end_time}`).getTime()) ||
      (end > new Date(`2023-01-01T${showtime.start_time}`).getTime() &&
        end <= new Date(`2023-01-01T${showtime.end_time}`).getTime()) ||
      (start <= new Date(`2023-01-01T${showtime.start_time}`).getTime() &&
        end >= new Date(`2023-01-01T${showtime.end_time}`).getTime())
    );
  });
};

// Hàm kiểm tra khoảng cách thời gian giữa các suất chiếu (tối thiểu 15 phút)
const checkMinimumTimeGap = (showtimes, roomId, selectedDate, start, end) => {
  const MIN_GAP_MINUTES = 15;
  const MIN_GAP_MILLISECONDS = MIN_GAP_MINUTES * 60 * 1000;

  // Lọc các suất chiếu cùng phòng, cùng ngày
  const relevantShowtimes = showtimes.filter(
    (showtime) =>
      Number(showtime.room_id) === Number(roomId) &&
      showtime.show_date === selectedDate
  );

  for (const showtime of relevantShowtimes) {
    const showtimeStart = new Date(
      `2023-01-01T${showtime.start_time}`
    ).getTime();
    const showtimeEnd = new Date(`2023-01-01T${showtime.end_time}`).getTime();

    // Kiểm tra suất chiếu mới bắt đầu trước khi suất hiện tại kết thúc cộng thêm khoảng thời gian tối thiểu
    if (start <= showtimeEnd + MIN_GAP_MILLISECONDS && end > showtimeStart) {
      return {
        hasError: true,
        message: `Showtime must be at least one show behind the previous show ${MIN_GAP_MINUTES} minutes!`,
      };
    }

    // Kiểm tra suất chiếu mới kết thúc sau khi suất hiện tại bắt đầu trừ đi khoảng thời gian tối thiểu
    if (end >= showtimeStart - MIN_GAP_MILLISECONDS && start < showtimeEnd) {
      return {
        hasError: true,
        message: `Showtime must be at least one show behind the next ${MIN_GAP_MINUTES} minutes!`,
      };
    }
  }

  return { hasError: false };
};

export default function AddShowtime() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const branch_id = searchParams.get("branch_id");
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [movieDuration, setMovieDuration] = useState(0);
  const [selectedShowtimes, setSelectedShowtimes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [movieReleaseDate, setMovieReleaseDate] = useState(null);

  // API calls
  const { data: priceSettings } = useGetPriceSettingsQuery(branch_id, {
    skip: !branch_id,
  });
  
  // Lấy dữ liệu rạp phim dựa trên branch_id
  const { data: cinemasDataByBranch, isLoading: cinemasLoadingByBranch } =
    useGetCinemaByBranchIdQuery(branch_id, {
      skip: !branch_id
    });
    
  // Lấy tất cả rạp phim khi không có branch_id
  const { data: allCinemasData, isLoading: allCinemasLoading } =
    useGetAllCinemaNotPaginationQuery({
      skip: !!branch_id
    });

  const { data: moviesData, isLoading: moviesLoading } = useGetMoviesByAddShowtimeQuery();
  
  const { data: roomsData, isLoading: roomsLoading } =
    useGetRoomsByCinemaIdQuery(selectedCinema, {
      skip: !selectedCinema,
    });
  const [checkShowtime] = useLazyGetShowtimeByRoomIdQuery();
  const [addShowtime, { isLoading: submitting }] = useCreateShowtimeMutation();

  // Dữ liệu đã xử lý
  const cinemas = useMemo(() => {
    // Nếu có branch_id, sử dụng dữ liệu từ cinemasDataByBranch
    if (branch_id !== "null") {      
      return cinemasDataByBranch?.cinemas || [];
    }
    // Nếu không có branch_id, sử dụng dữ liệu từ allCinemasData
    return allCinemasData?.data || [];
  }, [branch_id, cinemasDataByBranch, allCinemasData]);
  
  const movies = useMemo(() => moviesData?.data || [], [moviesData]);
  const rooms = useMemo(() => roomsData?.data || [], [roomsData]);
  const basePrice = useMemo(
    () => priceSettings?.data?.base_ticket_price || 55000,
    [priceSettings]
  );  

  useEffect(() => {
    if (selectedMovie) {
      const movie = movies.find((m) => m.id === Number(selectedMovie));
      if (movie) {
        setMovieDuration(movie.duration || 0);
        setMovieReleaseDate(
          movie.release_date ? dayjs(movie.release_date) : null
        );
      }
    } else {
      setMovieReleaseDate(null);
    }
  }, [selectedMovie, movies]);

  useEffect(() => {
    // Thiết lập giá trị mặc định cho ngày là hôm nay
    form.setFieldsValue({ show_date: dayjs() });
  }, [form]);

  // Tự động tính toán giờ kết thúc khi người dùng chọn giờ bắt đầu
  useEffect(() => {
    const startTime = form.getFieldValue('start_time');
    if (startTime && movieDuration > 0) {
      // Tính toán giờ kết thúc = giờ bắt đầu + thời lượng phim + 15 phút buffer
      const endTime = dayjs(startTime).add(movieDuration + 15, 'minute');
      
      // Cập nhật giá trị trong form
      form.setFieldsValue({ end_time: endTime });
    }
  }, [form.getFieldValue('start_time'), movieDuration]);

  const handleCinemaChange = (value) => {
    setSelectedCinema(value);
    form.setFieldsValue({ room_id: undefined });
  };

  const handleMovieChange = (value) => {
    setSelectedMovie(value);

    // Update show_date field validation
    if (value) {
      const movie = movies.find((m) => m.id === Number(value));
      if (movie && movie.release_date) {
        const releaseDate = dayjs(movie.release_date);
        const currentShowDate = form.getFieldValue("show_date");

        if (currentShowDate && currentShowDate.isBefore(releaseDate, "day")) {
          form.setFieldsValue({ show_date: releaseDate });
        }
      }
    }
  };

  // Xử lý khi người dùng chọn giờ bắt đầu
  const handleStartTimeChange = (time) => {
    if (time && movieDuration > 0) {
      // Tính toán giờ kết thúc = giờ bắt đầu + thời lượng phim + 15 phút buffer
      const endTime = dayjs(time).add(movieDuration + 15, 'minute');
      
      // Cập nhật giá trị trong form
      form.setFieldsValue({ end_time: endTime });
    }
  };

  const addShowtimeToList = async () => {
    try {
      // Validate form trước khi thêm
      const values = await form.validateFields();

      const startTime = dayjs(values.start_time).format("HH:mm");
      const endTime = dayjs(values.end_time).format("HH:mm");
      const showDate = dayjs(values.show_date).format("YYYY-MM-DD");

      // Kiểm tra thời gian bắt đầu phải lớn hơn thời gian hiện tại ít nhất 1 giờ
      const currentDateTime = dayjs();
      const selectedDateTime = dayjs(
        `${showDate} ${startTime}`,
        "YYYY-MM-DD HH:mm"
      );
      const minimumDateTime = currentDateTime.add(1, "hour");

      if (selectedDateTime.isBefore(minimumDateTime)) {
        message.error(
          "Start time must be at least 1 hour from current time!"
        );
        return;
      }

      // Kiểm tra ngày chiếu phải sau hoặc bằng ngày phát hành phim
      if (movieReleaseDate) {
        const showDateObj = dayjs(showDate);
        if (showDateObj.isBefore(movieReleaseDate, "day")) {
          message.error(
            `Show date must be from movie release date (${movieReleaseDate.format(
              "DD/MM/YYYY"
            )}) trở đi!`
          );
          return;
        }
      }

      // Kiểm tra xem end_time có phải sau start_time đủ thời lượng phim không
      const startMinutes =
        dayjs(values.start_time).hour() * 60 +
        dayjs(values.start_time).minute();
      const endMinutes =
        dayjs(values.end_time).hour() * 60 + dayjs(values.end_time).minute();
      const duration = endMinutes - startMinutes;

      if (duration < movieDuration) {
        message.error(`The projection time must be at least ${movieDuration} minutes!`);
        return;
      }

      // Kiểm tra giới hạn thời gian kết thúc không quá thời lượng phim + 30 phút
      const MAX_BUFFER_MINUTES = 30;
      const maxDuration = movieDuration + MAX_BUFFER_MINUTES;

      if (duration > maxDuration) {
        message.error(
          `The screen time must not exceed ${maxDuration} minutes (movie duration + ${MAX_BUFFER_MINUTES} minutes)!`
        );
        return;
      }

      // Kiểm tra trùng lịch
      const start = new Date(`2023-01-01T${startTime}`).getTime();
      const end = new Date(`2023-01-01T${endTime}`).getTime();

      const isDuplicate = checkDuplicateShowtime(
        selectedShowtimes,
        values.room_id,
        showDate,
        start,
        end
      );

      if (isDuplicate) {
        message.error(
          "Duplicate showtime in same room and same day! Please select another time or date."
        );
        return;
      }

      // Kiểm tra khoảng cách tối thiểu giữa các suất chiếu
      const timeGapCheck = checkMinimumTimeGap(
        selectedShowtimes,
        values.room_id,
        showDate,
        start,
        end
      );

      if (timeGapCheck.hasError) {
        message.error(timeGapCheck.message);
        return;
      }

      // Kiểm tra trùng lịch từ server
      const result = await checkShowtime({
        room_id: values.room_id,
        start_time: startTime,
        end_time: endTime,
        show_date: showDate, // Thêm ngày chiếu vào API check
      });

      if (result?.error?.status === 409) {
        message.error(
          "Showtime conflicts with existing schedule! Please select another time or date."
        );
        return;
      }

      // Tìm thông tin phim và phòng
      const movie = movies.find((m) => m.id === Number(values.movie_id));
      const room = rooms.find((r) => r.id === Number(values.room_id));

      // Thêm vào danh sách
      const newShowtimeData = {
        id: Date.now(),
        cinema_id: values.cinema_id,
        movie_id: values.movie_id,
        room_id: values.room_id,
        show_date: showDate,
        start_time: startTime,
        end_time: endTime,
        base_price: values.price || basePrice,
        movie_name: movie?.name || "Không xác định",
        room_name: room?.name || "Không xác định",
      };

      setSelectedShowtimes([...selectedShowtimes, newShowtimeData]);

      // Reset form fields (giữ nguyên các trường đã chọn, chỉ reset thời gian)
      form.setFieldsValue({
        start_time: undefined,
        end_time: undefined,
        room_id: undefined,
        price: basePrice,
      });

      message.success("Showtime added to list");
    } catch (error) {
      console.error("Form validation error:", error);
    }
  };

  const handleRemoveShowtime = (id) => {
    setSelectedShowtimes(selectedShowtimes.filter((item) => item.id !== id));
  };

  const handleSubmit = async () => {
    if (selectedShowtimes.length === 0) {
      message.error("Please add at least one showtime!");
      return;
    }

    setLoading(true);
    try {
      const formattedData = selectedShowtimes.map(
        ({
          movie_id,
          room_id,
          start_time,
          end_time,
          base_price,
          show_date,
        }) => ({
          movie_id,
          room_id,
          start_time,
          end_time,
          show_date, // Thêm ngày chiếu vào dữ liệu gửi lên server
          base_price,
        })
      );

      const response = await addShowtime(formattedData).unwrap();
      message.success("Create a successful screening");
      navigate("/admin/showtimes");
    } catch (error) {
      message.error(
        "An error occurred while creating the showtime.: " +
          (error.data?.message || error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Disable dates before release date or past dates
  const disableDates = (current) => {
    const isPastDate = current && current < dayjs().startOf("day");

    // If we have a release date, also disable dates before release date
    if (movieReleaseDate) {
      return isPastDate || current.isBefore(movieReleaseDate, "day");
    }

    return isPastDate;
  };

  // Columns for the showtimes table
  const columns = [
    {
      title: "#",
      key: "index",
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Movie",
      dataIndex: "movie_name",
      key: "movie_name",
    },
    {
      title: "Room",
      dataIndex: "room_name",
      key: "room_name",
    },
    {
      title: "Show Date",
      dataIndex: "show_date",
      key: "show_date",
    },
    {
      title: "Show Time",
      key: "time",
      render: (_, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: "Ticket Price",
      dataIndex: "base_price",
      key: "base_price",
      render: (price) => `${price.toLocaleString("en-US")} VND`,
    },
    {
      title: "Actions",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<FiTrash2 />}
          onClick={() => handleRemoveShowtime(record.id)}
        />
      ),
    },
  ];

  const isDataLoading =
    (branch_id ? cinemasLoadingByBranch : allCinemasLoading) || 
    moviesLoading || 
    (selectedCinema && roomsLoading);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Title level={4}>Add New Showtime</Title>
        <Button
          icon={<FiX />}
          onClick={() => navigate("/admin/showtimes")}
          type="text"
        />
      </div>

      {isDataLoading ? (
        <div className="flex justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              price: basePrice,
              show_date: dayjs(),
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Form.Item
                name="cinema_id"
                label="Cinema"
                rules={[{ required: true, message: "Please select a cinema" }]}
              >
                <Select
                  placeholder="Enter cinema"
                  onChange={handleCinemaChange}
                >
                  {cinemas.map((cinema) => (
                    <Option key={cinema.id} value={cinema.id}>
                      {cinema.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="movie_id"
                label="Movie"
                rules={[{ required: true, message: "Please select a movie" }]}
              >
                <Select 
                  placeholder="Enter movie" 
                  onChange={handleMovieChange}
                  showSearch
                  optionFilterProp="label"
                  filterOption={(input, option) => 
                    (option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  options={movies.map((movie) => ({
                    value: movie.id,
                    label: `${movie.name} - ${movie.duration} minues`
                  }))}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Form.Item
                name="room_id"
                label="Room"
                rules={[{ required: true, message: "Please select a room" }]}
              >
                <Select placeholder="Enter room" disabled={!selectedCinema}>
                  {rooms.map((room) => (
                    <Option key={room.id} value={room.id}>
                      {room.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="show_date"
                label="Show Date"
                rules={[
                  { required: true, message: "Please select a show date" },
                  {
                    validator: (_, value) => {
                      if (
                        movieReleaseDate &&
                        value &&
                        value.isBefore(movieReleaseDate, "day")
                      ) {
                        return Promise.reject(
                          `Show date must be from movie release date (${movieReleaseDate.format(
                            "DD/MM/YYYY"
                          )})!`
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <DatePicker
                  className="w-full"
                  format="DD/MM/YYYY"
                  disabledDate={disableDates}
                />
              </Form.Item>

              <Form.Item
                name="price"
                label="Price (VND)"
                rules={[{ required: true, message: "Please enter a price" }]}
              >
                <InputNumber
                  className="w-full"
                  min={10000}
                  step={1000}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Form.Item
                name="start_time"
                label="Start Time"
                rules={[
                  { required: true, message: "Please select a start time" },
                ]}
              >
                <TimePicker 
                  format="HH:mm" 
                  className="w-full" 
                  minuteStep={5} 
                  onChange={handleStartTimeChange}
                  placeholder={movieDuration > 0 ? `Select start time (Duration: ${movieDuration} minutes)` : "Please select start time"}
                />
              </Form.Item>

              <Form.Item
                name="end_time"
                label="End Time"
                rules={[
                  { required: true, message: "Please select an end time" },
                ]}
                tooltip={
                  movieDuration > 0
                    ? `Movie duration: ${movieDuration} minutes + 15 minutes of commercials`
                    : undefined
                }
              >
                <TimePicker 
                  format="HH:mm" 
                  className="w-full" 
                  minuteStep={5} 
                  placeholder="Automatically calculate when starting time is selected"
                />
              </Form.Item>
            </div>

            <div className="text-right">
              <Button
                type="primary"
                icon={<FiPlus />}
                onClick={addShowtimeToList}
                className="bg-blue-500"
              >
                Add to List
              </Button>
            </div>
          </Form>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="mb-4">
          <Title level={5}>
            List Showtimes ({selectedShowtimes.length})
          </Title>
          <Text type="secondary">
            Showtimes will be saved after you press the "Save Showtimes" button
          </Text>
        </div>

        <Table
          columns={columns}
          dataSource={selectedShowtimes}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "No showtimes yet" }}
          className="mb-6"
        />

        <div className="flex justify-end mt-6">
          <Space>
            <Button onClick={() => navigate("/admin/showtimes")}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={loading || submitting}
              disabled={selectedShowtimes.length === 0}
              className="bg-blue-500"
            >
              Save Showtimes
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
}
