import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import io from "socket.io-client";
import { formatCurrency } from '../../utils/format';
import MomoPayment from '../../components/Payment/MomoPayment';

const API_URL = import.meta.env.VITE_API_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

export default function Payment({paymentMethod, setPaymentMethod}) {
  const navigate = useNavigate();
  const { showtime_id } = useParams();
  
  // State hooks
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [socket, setSocket] = useState(null);
  const [showMomoPayment, setShowMomoPayment] = useState(false);
  const [localMethod, setLocalMethod] = useState("");
  // =========== QUẢN LÝ DỮ LIỆU ĐẶT VÉ ===========
  
  // Lấy dữ liệu đặt vé từ localStorage
  const reservation = useMemo(() => {
    const data = localStorage.getItem('reservation');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu đặt vé:", error);
      return null;
    }
  }, []);

  // Lấy dữ liệu người dùng từ localStorage
  const userData = useMemo(() => {
    const data = localStorage.getItem('user');
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Lỗi khi đọc dữ liệu người dùng:", error);
      return null;
    }
  }, []);
  
  // Kiểm tra reservation và chuyển hướng nếu không có
  useEffect(() => {
    if (!reservation && !isLoading) {
      toast.error("Please select seats before proceeding to payment");
      navigate(`/booking/${showtime_id}`);
    }
  }, [reservation, navigate, showtime_id, isLoading]);

  // =========== KẾT NỐI SOCKET ===========
  
  // Thiết lập kết nối socket
  useEffect(() => {
    if (!userData || !userData.id) return;
    
    initializeSocket();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userData]);
  
  // Khởi tạo kết nối socket
  const initializeSocket = () => {
    const newSocket = io(SOCKET_URL, {
      path: "/booking",
      query: {
        userType: "user",
        user_id: userData.id,
      },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      setSocket(newSocket);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Lỗi kết nối socket:", error);
    });
    
    // Xử lý sự kiện khi phiên đặt vé hết hạn
    newSocket.on("reservationExpired", (data) => {
      if (data.user_id === userData.id && !paymentSuccess) {
        handleSessionExpired();
      }
    });
  };

  const handleChangeMethod = (value) => {
    setLocalMethod(value);
    setPaymentMethod(value);
  }

  // =========== XỬ LÝ THANH TOÁN ===========
  
  // Xử lý thanh toán
  const handlePayment = useCallback(async () => {
    if (!reservation) {
      toast.error("No booking information available");
      return;
    }
    
    if (!userData || !userData.id) {
      toast.error("Please login to proceed with payment");
      return;
    }

    // Nếu chọn thanh toán Momo, hiển thị form thanh toán Momo
    if (paymentMethod === 'momo') {
      setShowMomoPayment(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Chuẩn bị dữ liệu cho API
      const paymentData = {
        showtime_id: parseInt(showtime_id),
        user_id: userData.id,
        payment_method: paymentMethod,
        seat_ids: reservation.seats.map(seat => seat.id),
        food_items: reservation.food_items || [],
        total_price: reservation.totalPrice || calculateTotalPrice()
      };
      
      // Gọi API
      const response = await axios.post(`${API_URL}/api/v1/payments/create`, paymentData);
      
      if (response.data.success) {
        // Lưu dữ liệu thanh toán và hiển thị thông báo thành công
        setPaymentData(response.data.data);
        setPaymentSuccess(true);
        toast.success("Payment successful");
        
        // Xóa dữ liệu đặt vé khỏi localStorage
        localStorage.removeItem("reservation");
        
        // Thông báo tới server rằng ghế đã được xác nhận
        if (socket) {
          socket.emit("seatsConfirmed", {
            seat_ids: reservation.seats.map(seat => seat.id),
            user_id: userData.id
          });
        }
      } else {
        toast.error(response.data.message || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán:", error);
      toast.error(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [reservation, userData, paymentMethod, showtime_id, socket]);

  // Xử lý thanh toán Momo thành công
  const handleMomoSuccess = (payUrl) => {
    // Lưu thông tin thanh toán vào localStorage để khôi phục sau khi quay lại từ cổng thanh toán
    const momoPaymentInfo = {
      showtime_id: parseInt(showtime_id),
      user_id: userData.id,
      payment_method: 'momo',
      seat_ids: reservation.seats.map(seat => seat.id),
      food_items: reservation.food_items || [],
      total_price: reservation.totalPrice || calculateTotalPrice(),
      paymentStatus: 'pending',
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('momoPaymentInfo', JSON.stringify(momoPaymentInfo));
    
    // Chuyển hướng đến trang thanh toán MOMO
    window.location.href = payUrl;
  };

  // Xử lý thanh toán Momo thất bại
  const handleMomoError = (error) => {
    toast.error(`Lỗi thanh toán MOMO: ${error.message}`);
    setShowMomoPayment(false);
  };

  // Tính tổng tiền
  const calculateTotalPrice = () => {
    if (!reservation) return 0;
    
    // Tính giá ghế
    let totalPrice = 0;
    
    // Cộng giá ghế
    if (reservation.seats && reservation.seats.length > 0) {
      const basePrice = Number(reservation.showtime?.base_price || 0);
      
      totalPrice += reservation.seats.reduce((sum, seat) => {
        const extraPrice = Number(seat.type_price_offset || 0);
        return sum + basePrice + extraPrice;
      }, 0);
    }
    
    // Cộng giá đồ ăn
    if (reservation.food_items && reservation.food_items.length > 0) {
      totalPrice += reservation.food_items.reduce((sum, item) => {
        return sum + Number(item.price) * item.quantity;
      }, 0);
    }
    
    return totalPrice;
  };

  // =========== XỬ LÝ CÁC TRƯỜNG HỢP ĐẶC BIỆT ===========
  
  // Xử lý khi phiên đặt vé hết hạn
  const handleSessionExpired = () => {
    const room_id = reservation.showtime?.room?.id;
    localStorage.removeItem("reservation");
    localStorage.removeItem(`momoPaymentInfo`);
    localStorage.removeItem(`payment_info`);
    toast.info("Booking session has expired. Please select seats again.");
    navigate(`/booking/${showtime_id}?room_id=${room_id}`);
  };
  
  // Xử lý khi người dùng hủy đặt vé
  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel the booking?")) {
      const room_id = reservation.showtime?.room?.id;

      localStorage.removeItem("reservation");
      
      // Thông báo tới server rằng ghế đã được giải phóng
      if (socket && reservation) {
        socket.emit("cancelReservation", {
          seat_ids: reservation.seats.map(seat => seat.id),
          showtime_id: parseInt(showtime_id),
          user_id: userData?.id
        });
      }
      
      toast.success("Booking cancelled");
      navigate(`/booking/${showtime_id}?room_id=${room_id}`);
    }
  };
  
  // Quay lại trang chọn đồ ăn
  const handleBack = useCallback(() => {
    navigate(`/food-selection/${showtime_id}`);
  }, [navigate, showtime_id]);

  // =========== RENDER COMPONENT ===========
  
  // Nếu đang hiển thị trang thanh toán Momo
  if (showMomoPayment) {
    const totalPrice = reservation?.totalPrice || calculateTotalPrice();
    const orderInfo = `Thanh toán vé xem phim ${reservation?.showtime?.movie?.name || ''}`;
    
    return (
      <div className="container mx-auto max-w-4xl p-6 bg-[var(--secondary-dark)] rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Pay with MOMO</h1>
          <p className="text-[var(--text-secondary)]">Please complete the payment through MOMO e-wallet</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Phần thanh toán MOMO */}
          <div className="bg-[var(--primary-dark)] rounded-xl shadow p-6">
            <MomoPayment 
              amount={totalPrice}
              orderInfo={orderInfo}
              onSuccess={handleMomoSuccess}
              onError={handleMomoError}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setShowMomoPayment(false)}
            className="px-6 py-2 bg-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--primary-dark)]/80"
          >
            Back
          </button>
        </div>
      </div>
    );
  }
  
  // Nếu thanh toán thành công, hiển thị trang xác nhận
  if (paymentSuccess && paymentData) {
    return (
      <div className="container mx-auto max-w-4xl p-6 bg-[var(--secondary-dark)] rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--accent-color)] mb-2">Payment Successful!</h1>
          <p className="text-[var(--text-secondary)]">Thank you for your booking. Here is your ticket information.</p>
        </div>
        
        <div className="bg-[var(--primary-dark)] p-6 rounded-lg border border-[var(--accent-color)]/20 mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">Booking Information</h2>
              
              <div className="space-y-2 text-[var(--text-primary)]">
                <p><span className="font-semibold text-[var(--accent-color)]">Booking Code:</span> {paymentData.booking_code}</p>
                <p><span className="font-semibold text-[var(--accent-color)]">Movie:</span> {reservation?.showtime?.movie?.name}</p>
                <p><span className="font-semibold text-[var(--accent-color)]">Cinema:</span> {reservation?.showtime?.room?.cinema?.name} - {reservation?.showtime?.room?.name}</p>
                <p><span className="font-semibold text-[var(--accent-color)]">Showtime:</span> {reservation?.showtime?.start_time?.time} - {reservation?.showtime?.start_time?.date}</p>
                <p>
                    <span className="font-semibold text-[var(--accent-color)]">Seats:</span>{' '}
                  {reservation?.seats?.map(seat => `${seat.seat_row}${seat.seat_number}`).join(', ')}
                </p>
                
                {reservation?.food_items && reservation.food_items.length > 0 && (
                  <div className="mt-4">
                    <p className="font-semibold text-[var(--accent-color)]">Food & Beverages:</p>
                    <ul className="list-disc ml-5 mt-1">
                      {reservation.food_items.map(item => (
                        <li key={item.id}>
                          {item.name} x {item.quantity} - {formatCurrency(item.price * item.quantity)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <p className="text-lg font-bold mt-4 text-[var(--accent-color)]">
                  Total: {formatCurrency(paymentData.total_price)}
                </p>
              </div>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-6 flex flex-col items-center">
              <p className="text-sm mt-2 text-[var(--text-secondary)]">Scan QR code to view ticket information</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-center">
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[var(--accent-color)] text-[var(--text-primary)] rounded-lg hover:bg-[var(--accent-color)]/80"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Hiển thị trang thanh toán
  return (
    <div className="bg-[var(--secondary-dark)] min-h-screen">
      <div className="p-6">        
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 text-[var(--text-primary)]">Select Payment Method</h2>
          
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-[var(--primary-dark)] rounded-lg cursor-pointer hover:bg-[var(--primary-dark)] bg-[var(--secondary-dark)]">
              <input
                type="radio"
                name="paymentMethod"
                value="vnpay"
                checked={localMethod === 'vnpay'}
                onChange={() => handleChangeMethod('vnpay')}
                className="mr-3 accent-[var(--accent-color)]"
              />
              <div className='text-left'>
                <p className="font-medium text-[var(--text-primary)]">VN PAY Payment</p>
                <p className="text-sm text-[var(--text-secondary)]">Pay through VN Pay system</p>
              </div>
            </label>
          
          </div>
        </div>
        
        {/* Ghi chú */}
        <div className="bg-[var(--primary-dark)] p-4 rounded-lg border border-[var(--accent-color)]/20 mb-6">
          <h3 className="font-semibold text-[var(--accent-color)] mb-2">Notes:</h3>
          <ul className="list-disc ml-5 text-[var(--text-secondary)] text-left text-sm">
            <li>Paid tickets cannot be refunded or exchanged for other movies/showtimes.</li>
            <li>Please arrive 15-30 minutes before showtime to collect tickets and food.</li>
            <li>Electronic receipt will be sent to your email.</li>
          </ul>
        </div>
        
        {/* Nút hủy đặt vé */}
        <div className="mt-8 text-center">
          <button
            onClick={handleCancel}
            className="text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 hover:underline"
            disabled={isLoading}
          >
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
} 