import { useState, useCallback, useMemo, useEffect } from "react";
import { useGetRoomByIdQuery } from "@/api/roomApi";
import { useGetListSeatTypesQuery } from "@/api/seatTypeApi";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useGetShowtimeByIdQuery } from "../../api/showtimeApi";
import { toast } from "react-toastify";

// Custom hooks
import useReservation from "./hooks/useReservation";
import useSocketConnection from "./hooks/useSocketConnection";
import usePaymentCalculation from "./hooks/usePaymentCalculation";

// Components
import FoodSelectionContent from "./components/FoodSelectionContent";
import BookingSidebar from "./components/booking/BookingSidebar";
import SeatSelectionStep from "./components/booking/SeatSelectionStep";
import PaymentStep from "./components/booking/PaymentStep";
import PaymentPage from "../Payment/PaymentPage";
import { useCheckPromotionMutation } from "../../api/promotionApi";

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function Booking() {
  const navigate = useNavigate();
  const { showtime_id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [paymentMethod, setPaymentMethod] = useState("");
  
  const room_id = searchParams.get("room_id");
  const step = searchParams.get("step") || "seats"; // seats, food, payment

  // Lấy thông tin người dùng từ localStorage
  const userData = useMemo(
    () => JSON.parse(localStorage.getItem("user") || "{}"),
    []
  );
  const user_id = userData?.id;

  //Check mã giảm giá
  const [checkPromotion] = useCheckPromotionMutation();

  // API queries
  const { data: listSeats, refetch: refetchSeats } = useGetRoomByIdQuery(
    {room_id, showtime_id},
    { skip: !room_id }
  );

  const { data: showtimeData } = useGetShowtimeByIdQuery(showtime_id, {
    skip: !showtime_id,
  });  

  const { data: listSeatTypes } = useGetListSeatTypesQuery();

  // State hooks
  const [selectedFoodItems, setSelectedFoodItems] = useState([]);
  const [discountCode, setDiscountCode] = useState("");
  const [onApplyStar, setOnApplyStar] = useState({
    starsUsed: 0,
    discountAmount: 0
  });
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isCheckingDiscount, setIsCheckingDiscount] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");
  const [showPopupConfirm, setShowPopupConfirm] = useState(false);
  const [descriptionDiscount, setDescriptionDiscount] = useState("");

  // Custom hooks
  const {
    selectedSeats,
    setSelectedSeats,
    hasActiveReservation,
    activeReservationInfo,
    isLoading,
    setIsLoading,
    clearExpiredReservation,
    saveSelectedSeatsToSession,
    updateExistingReservationSeats,
    updateExistingReservation,
    saveReservationData,
  } = useReservation(showtime_id, room_id, user_id, setSearchParams, () =>
    setSelectedFoodItems([])
  );

  const socket = useSocketConnection(
    SOCKET_URL,
    showtime_id,
    user_id,
    clearExpiredReservation,
    refetchSeats
  );
  
  const {
    calculateTicketPrice,
    calculateTotalPrice,
    prepareSeatsWithPricing,
    calculateDiscount,
    calculateTotalBeforeDiscount,
  } = usePaymentCalculation(
    showtimeData,
    listSeatTypes,
    selectedSeats,
    selectedFoodItems,
    appliedDiscount,
    hasActiveReservation,
    activeReservationInfo
  );

  // =========== XỬ LÝ CHỌN GHẾ ===========

  // Xử lý khi người dùng nhấp vào một ghế
  const handleSeatClick = useCallback(
    (seat) => {
      // Kiểm tra đăng nhập
      if (!user_id) {
        toast.error("Please login to book seats!");
        navigate("/login");
        return;
      }

      // Kiểm tra xem có đơn hàng đang xử lý ở suất chiếu khác không
      if (hasActiveReservation && activeReservationInfo?.isOtherShowtime) {
        toast.error(
          `You have an unpaid order for another showtime. Please complete the payment before booking new tickets!`
        );
        return;
      }

      if (seat.is_enabled && !isLoading) {
        toggleSeatSelection(seat);
      }
    },
    [user_id, hasActiveReservation, activeReservationInfo, isLoading]
  );


  // Chọn hoặc bỏ chọn ghế
  const toggleSeatSelection = useCallback(
    (seat) => {
      setSelectedSeats((prev) => {
        const isSelected = prev.find((s) => s.id === seat.id);
        if (activeReservationInfo && !activeReservationInfo.isOtherShowtime) {
          updateExistingReservationSeats(seat, isSelected);
          return prev;
        } else {
          if (isSelected) {
            return prev.filter((s) => s.id !== seat.id);
          } else {
            return [...prev, seat];
          }
        }
      });
    },
    [
      selectedSeats,
      activeReservationInfo,
      updateExistingReservationSeats,
      setSelectedSeats,
    ]
  );

  // =========== XỬ LÝ TIẾP TỤC ĐẶT VÉ ===========

  // Xử lý khi người dùng nhấp vào nút Tiếp tục từ màn chọn ghế
  const handleContinueFromSeats = useCallback(() => {
    // Kiểm tra điều kiện
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat!");
      return;
    }

    if (!socket?.connected) {
      toast.error("Lost connection to server, please try again later!");
      return;
    }

    if (!user_id) {
      toast.error("Please login to book seats!");
      return;
    }


    setIsLoading(true);

    // Xóa đồ ăn cũ khi bắt đầu phiên mới
    setSelectedFoodItems([]);

    // Lưu ghế đã chọn vào sessionStorage
    saveSelectedSeatsToSession();

    // Chuẩn bị thông tin ghế bao gồm cả giá
    const preparedSeats = prepareSeatsWithPricing(selectedSeats);

    // Xử lý đơn hàng hiện tại hoặc tạo mới
    if (activeReservationInfo && !activeReservationInfo.isOtherShowtime) {
      updateExistingReservation(preparedSeats);
    } else {
      createNewReservation(preparedSeats);
    }
  }, [
    selectedSeats,
    socket,
    user_id,
    activeReservationInfo,
    saveSelectedSeatsToSession,
    prepareSeatsWithPricing,
    updateExistingReservation,
    setSelectedFoodItems,
  ]);

  // Hàm Kiểm tra xem có ghế bị bỏ lẻ không

  // Tạo đơn đặt vé mới
  const createNewReservation = useCallback(
    (preparedSeats) => {
      // Gửi yêu cầu đặt ghế lên server qua socket
      socket.emit(
        "reserveSeats",
        {
          seat_ids: selectedSeats.map((seat) => seat.id),
          showtime_id,
          user_id,
        },
        (response) => {
          setIsLoading(false);

          if (response.success) {            
            // Lưu thông tin vào localStorage
            saveReservationData(preparedSeats, response, showtimeData);

            // Chuyển đến bước chọn thức ăn
            setSearchParams({ room_id, step: "food" });
          } else {
            toast.error(response.message || "An error occurred, please try again!");
            refetchSeats();
          }
        }
      );
    },
    [
      socket,
      selectedSeats,
      showtime_id,
      user_id,
      saveReservationData,
      showtimeData,
      setSearchParams,
      room_id,
      refetchSeats,
    ]
  );

  // =========== XỬ LÝ ĐỒ ĂN ===========

  // Cập nhật đồ ăn đã chọn
  const handleUpdateFoodItems = useCallback(
    (foodItems) => {
      setSelectedFoodItems(foodItems);

      // Cập nhật đồ ăn trong reservation
      if (activeReservationInfo) {
        const updatedReservation = {
          ...activeReservationInfo,
          foodItems,
        };
        localStorage.setItem("reservation", JSON.stringify(updatedReservation));
      }
    },
    [activeReservationInfo]
  );

  // Chuyển đến bước thanh toán
  const handleContinueToPayment = useCallback(() => {
    setSearchParams({ room_id, step: "payment" });
  }, [setSearchParams, room_id]);

  // =========== XỬ LÝ THANH TOÁN ===========

  // Xử lý hoàn tất thanh toán
  const handlePayment = useCallback(() => {
    // Dữ liệu thanh toán
    const paymentData = {
      user_id,
      showtime_id,
      seat_ids: selectedSeats.map((seat) => seat.id),
      food_items: selectedFoodItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
      payment_method: selectedPaymentMethod,
      total_amount: calculateTotalPrice(),
      discount_code: appliedDiscount?.code || null,
      discount_percentage: appliedDiscount?.percentage || null,
    };

    // Lưu thông tin thanh toán vào localStorage để sử dụng sau khi quay lại từ trang thanh toán
    localStorage.setItem(
      "payment_info",
      JSON.stringify({
        ...paymentData,
        timestamp: new Date().toISOString(),
      })
    );

    // Thay vì xử lý thanh toán ở đây, chúng ta chuyển hướng đến trang Payment tương ứng
  }, [
    navigate,
    showtime_id,
    user_id,
    selectedSeats,
    selectedFoodItems,
    calculateTotalPrice,
    selectedPaymentMethod,
    appliedDiscount,
    room_id,
  ]);

  // Xử lý tiếp tục sau khi chọn phương thức thanh toán
  const handleContinueFromPayment = useCallback(() => {
    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    setShowPopupConfirm(true);
    handlePayment();
  }, [selectedPaymentMethod, handlePayment]);

  // Xử lý áp dụng mã giảm giá
  const handleApplyDiscount = useCallback(async (code) => {
    // If a code is provided directly, use it instead of the state value
    const promotionCode = code || discountCode;
    
    if (!promotionCode.trim()) {
      toast.error("Vui lòng nhập mã giảm giá");
      return;
    }

    setIsCheckingDiscount(true);

    const data = { user_id, code: promotionCode };
    const response = await checkPromotion(data);
    if (response?.data?.error === true) {
      toast.error(response?.data?.message);
      setAppliedDiscount(null);
      setIsCheckingDiscount(false);
      return;
    }

    if (response?.data?.success === true) {
      toast.success(response?.data?.message);
      localStorage.setItem(
        "promotion_id",
        JSON.stringify(response?.data?.promotion.id) || null
      );

      switch (response?.data?.promotion?.applicable_to) {
        case "total_bill":
          setDescriptionDiscount("Giảm theo tổng giá");
          break;
        case "ticket":
          setDescriptionDiscount("Giảm theo giá ghế");
          break;
        case "food":
          setDescriptionDiscount("Giảm theo đồ ăn");
          break;
        default:
          setDescriptionDiscount("");
      }

      setAppliedDiscount({
        code: response?.data?.promotion.code,
        discount_type: response?.data?.promotion.discount_type,
        discount_value: response?.data?.promotion.discount_value,
        max_discount: response?.data?.promotion.max_discount,
        applicable_to: response?.data?.promotion.applicable_to,
        // percentage: 10,
        description: response?.data?.promotion.name,
      });

      setIsCheckingDiscount(false);
    }
  }, [discountCode, user_id, checkPromotion]);

  // =========== TÍNH TOÁN VÀ HIỂN THỊ ===========

  // Xử lý nút Quay lại
  const handleBack = useCallback(() => {
    if (step === "food") {
      setSearchParams({ room_id, step: "seats" });
    } else if (step === "payment") {
      setSearchParams({ room_id, step: "food" });
    } else {
      navigate(-1);
    }
  }, [navigate, step, setSearchParams, room_id]);

  // Hiển thị nút tương ứng với bước hiện tại
  const renderContinueButton = useCallback(() => {
    switch (step) {
      case "food":
        return (
          <button
            onClick={handleContinueToPayment}
            className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded"
          >
            Continue
          </button>
        );
      case "payment":
        // Nút thanh toán được xử lý trong component PaymentContent
        // return null;
        return (
          <button
            onClick={handleContinueFromPayment}
            className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        );
      case "seats":
      default:
        return (
          <button
            onClick={handleContinueFromSeats}
            disabled={selectedSeats.length === 0 || isLoading}
            className="w-full px-4 py-2 bg-[var(--accent-color)] text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        );
    }
  }, [
    step,
    hasActiveReservation,
    activeReservationInfo,
    selectedSeats,
    isLoading,
    handleContinueFromSeats,
    handleContinueToPayment,
    setSearchParams,
  ]);

  // Hiển thị nội dung tương ứng với bước hiện tại
  const renderContent = useCallback(() => {
    switch (step) {
      case "food":
        return (
          <FoodSelectionContent
            selectedFoodItems={selectedFoodItems}
            onUpdateFoodItems={handleUpdateFoodItems}
          />
        );
      case "payment":
        return (
          <PaymentStep
            user_id={user_id}
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            discountCode={discountCode}
            setDiscountCode={setDiscountCode}
            handleApplyDiscount={handleApplyDiscount}
            isCheckingDiscount={isCheckingDiscount}
            selectedSeats={selectedSeats}
            selectedFoodItems={selectedFoodItems}
            calculateTotalPrice={calculateTotalPrice}
            selectedPaymentMethod={selectedPaymentMethod}
            setSelectedPaymentMethod={setSelectedPaymentMethod}
            handlePayment={handlePayment}
            onApplyStar={onApplyStar}
            setOnApplyStar={setOnApplyStar}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
          />
        );
      case "seats":
      default:
        return (
          <SeatSelectionStep
            listSeats={listSeats}
            refetchSeats={refetchSeats}
            selectedSeats={selectedSeats}
            listSeatTypes={listSeatTypes}
            isLoading={isLoading}
            hasActiveReservation={hasActiveReservation}
            activeReservationInfo={activeReservationInfo}
            handleSeatClick={handleSeatClick}
            setSearchParams={setSearchParams}
          />
        );
    }
  }, [
    step,
    selectedFoodItems,
    handleUpdateFoodItems,
    appliedDiscount,
    setAppliedDiscount,
    discountCode,
    setDiscountCode,
    handleApplyDiscount,
    isCheckingDiscount,
    selectedSeats,
    calculateTotalPrice,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    handlePayment,
    listSeats,
    listSeatTypes,
    isLoading,
    hasActiveReservation,
    activeReservationInfo,
    handleSeatClick,
    setSearchParams,
  ]);

  // =========== RENDER COMPONENT ===========
  useEffect(() => {
    if (socket) {
      const handleReservationExpired = (data) => {
        if (data.user_id === user_id) {
          setSelectedFoodItems([]);
        }
      };

      socket.on("reservationExpired", handleReservationExpired);

      return () => {
        socket.off("reservationExpired", handleReservationExpired);
      };
    }
  }, [socket, user_id]);
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row w-full py-8">
        {/* Phần hiển thị bên trái - Nội dung thay đổi theo bước */}
        <div className="w-full md:w-[70%] text-center">{renderContent()}</div>

        {/* Phần hiển thị bên phải - Thông tin phim và ghế đã chọn */}
        <BookingSidebar
          showtimeData={showtimeData}
          imageBaseUrl={IMAGE_BASE_URL}
          selectedSeats={selectedSeats}
          hasActiveReservation={hasActiveReservation}
          activeReservationInfo={activeReservationInfo}
          selectedFoodItems={selectedFoodItems}
          calculateTotalPrice={calculateTotalBeforeDiscount}
          discountValue={calculateDiscount}
          handleBack={handleBack}
          renderContinueButton={renderContinueButton}
          setSearchParams={setSearchParams}
          descriptionDiscount={descriptionDiscount || ""}
          listSeatTypes={listSeatTypes}
          onApplyStar={onApplyStar}
        />
      </div>
      {/* Xác nhận đặt vé */}
      {showPopupConfirm && (
        <div className="relative">
          <PaymentPage
            user_id={user_id}
            listSeatTypes={listSeatTypes}
            showtimeData={showtimeData}
            selectedSeats={selectedSeats}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            setShowPopupConfirm={setShowPopupConfirm}
          />
        </div>
      )}
    </>
  );
}
