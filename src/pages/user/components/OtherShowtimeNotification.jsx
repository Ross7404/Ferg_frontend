import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

// Component hiển thị thông báo khi có đơn hàng ở suất chiếu khác
export default function OtherShowtimeNotification({ 
  activeReservationInfo, 
  onContinuePayment,
  onReservationCancel // New prop to handle reservation cancellation in parent
}) {
  const showCancelConfirm = () => {
    Modal.confirm({
      title: 'Confirm order cancellation',
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to cancel your order for the movie "${activeReservationInfo?.showtime?.Movie?.name}"?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        // Clear storage
        localStorage.removeItem("reservation");
        localStorage.removeItem("finalPrice");
        sessionStorage.clear();
        
        // Notify parent component about the cancellation
        if (typeof onReservationCancel === 'function') {
          onReservationCancel();
        } else {
          // Fallback if parent doesn't provide the callback
          window.location.reload();
        }
      }
    });
  };

  return (
    <div className="bg-yellow-50 p-4 mb-4 rounded-lg border border-yellow-200">
      <p className="text-yellow-800 font-medium">
        You have an order to pay for another show
      </p>
      <p className="text-sm text-yellow-700 mt-1">
        Movie: {activeReservationInfo?.showtime?.Movie?.name} - {activeReservationInfo?.showtime?.Room?.Cinema?.name}
      </p>
      <div className="space-x-2">
      <button
        onClick={showCancelConfirm}
        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Cancel
      </button>
      <button
        onClick={onContinuePayment}
        className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
      >
        Continue payment
      </button>
      </div>
    </div>
  );
} 