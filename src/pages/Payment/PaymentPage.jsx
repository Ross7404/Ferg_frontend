import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import MomoPayment from "../../components/Payment/MomoPayment";
import TestVNPay from "./TestVNPay";
import { IoMdCloseCircleOutline } from "react-icons/io";

const PaymentPage = ({
  user_id,
  listSeatTypes,
  showtimeData,
  selectedSeats,
  paymentMethod,
  setShowPopupConfirm,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy dữ liệu từ localStorage
  const dataPage = JSON.parse(localStorage.getItem("reservation") || "{}");
  const dataTotal = JSON.parse(localStorage.getItem("payment_info") || "{}");
  const promotion_id = localStorage.getItem("promotion_id") || null;
  const finalPrice = localStorage.getItem("finalPrice") || 0;
  const star = localStorage.getItem("starDiscount") || 0;
  let starDiscount = 0;
  star > 0 ? (starDiscount = Number(star) / 1000) : (starDiscount = 0);
  // Lấy thông tin ghế và tính giá
  const seat_ids = selectedSeats?.map((seat) => {
    let basePrice = 0;
    const price_offset = listSeatTypes?.seat_types?.find(
      (type) => type.id === seat.type_id
    )?.price_offset;

    basePrice = Number(showtimeData?.base_price) + Number(price_offset);
    return { id: seat.id, price: basePrice };
  });

  // Chuẩn bị dữ liệu hiển thị
  const movieName =
    showtimeData?.showtime?.Movie?.name ||
    showtimeData?.Movie?.name ||
    dataPage?.showtime?.Movie?.name ||
    "Không xác định";

  // Định dạng suất chiếu
  let showtimeText = "Không xác định";
  if (showtimeData?.start_time && showtimeData?.show_date) {
    showtimeText = `${showtimeData.start_time} ${showtimeData.show_date}`;
  } else if (showtimeData?.showtime?.start_time) {
    showtimeText = showtimeData.showtime.start_time;
  } else if (dataPage?.showtime?.start_time) {
    showtimeText =
      typeof dataPage.showtime.start_time === "object"
        ? `${dataPage.showtime.start_time.time} - ${dataPage.showtime.start_time.date}`
        : dataPage.showtime.start_time;
  }

  const dataConfirm = {
    movie: movieName,
    showtime: showtimeText,
    foodItems: dataPage?.foodItems,
    total: finalPrice || 0,
  };

  // Lấy thông tin thanh toán
  const amount = dataTotal?.total_amount || 0;
  const orderInfo = `Thanh toán vé xem phim ${movieName}`;

  // Chuẩn bị dữ liệu gửi đến API
  const dataApi = {
    user_id,
    total: finalPrice,
    amount: finalPrice,
    seat_ids: seat_ids,
    showtime_id: dataPage?.showtime.id,
    combos: dataPage?.foodItems,
    promotion_id,
    orderInfo: orderInfo,
    starDiscount: starDiscount,
  };
  // Xử lý khi thanh toán thành công
  const handlePaymentSuccess = (payUrl) => {
    // Chuyển hướng đến trang thanh toán MOMO
    window.open(payUrl, "_blank");
  };

  // Xử lý khi thanh toán thất bại
  const handlePaymentError = (error) => {
    toast.error(`Lỗi thanh toán: ${error.message}`);
  };

  // Kiểm tra nếu không có thông tin thanh toán
  if (!amount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-[var(--primary-dark)] text-[var(--text-primary)] p-6 rounded-lg mb-6 border border-red-500">
          <h2 className="text-xl font-bold mb-2">
            Payment information not found
          </h2>
          <p className="text-[var(--text-secondary)]">Please return to the booking page and try again.</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-[var(--accent-color)] text-[var(--text-primary)] px-6 py-2 rounded-lg hover:bg-[var(--accent-color)]/80"
        >
                      Back
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="relative w-full max-w-xl mx-auto bg-[var(--secondary-dark)] rounded-lg shadow-lg border border-[var(--accent-color)]/20">
        <button
          onClick={() => setShowPopupConfirm(false)}
          className="absolute top-4 right-4 z-50 text-[var(--text-secondary)] hover:text-[var(--accent-color)] transition-colors"
        >
          <IoMdCloseCircleOutline size={28} />
        </button>

        <div className="w-full max-w-xl mx-auto text-center p-6">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
            Confirm Booking
          </h1>

          <table className="w-full border-collapse border border-[var(--primary-dark)] text-left mb-6">
            <tbody>
              <tr>
                <td className="border border-[var(--primary-dark)] px-4 py-3 font-semibold text-[var(--accent-color)] bg-[var(--primary-dark)]/50">
                  Movie:
                </td>
                <td className="border border-[var(--primary-dark)] px-4 py-3 text-[var(--text-primary)]">
                  {dataConfirm?.movie}
                </td>
              </tr>
              <tr>
                <td className="border border-[var(--primary-dark)] px-4 py-3 font-semibold text-[var(--accent-color)] bg-[var(--primary-dark)]/50">
                  Showtime:
                </td>
                <td className="border border-[var(--primary-dark)] px-4 py-3 text-[var(--text-primary)]">
                  {dataConfirm?.showtime}
                </td>
              </tr>
              <tr>
                <td className="border border-[var(--primary-dark)] px-4 py-3 font-semibold text-[var(--accent-color)] bg-[var(--primary-dark)]/50">
                  Food Items:
                </td>
                <td className="border border-[var(--primary-dark)] px-4 py-3 text-[var(--text-primary)]">
                  {dataConfirm?.foodItems?.length > 0
                    ? dataConfirm?.foodItems?.map((item, index) => (
                        <p key={index}>
                          {item.quantity} x {item.name}
                        </p>
                      ))
                    : "No food items"}
                </td>
              </tr>
              <tr>
                <td className="border border-[var(--primary-dark)] px-4 py-3 font-semibold text-[var(--accent-color)] bg-[var(--primary-dark)]/50">
                  Total:
                </td>
                <td className="border border-[var(--primary-dark)] px-4 py-3 text-[var(--text-primary)]">
                  {dataConfirm?.total.toLocaleString()} VNĐ
                </td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            {paymentMethod == "vnpay" ? (
              <TestVNPay
                data={dataApi}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            ) : (
              <MomoPayment
                data={dataApi}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
