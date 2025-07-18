import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState } from "react";
import { useUpdateUserMutation } from "@/api/userApi";
import { toast } from "react-toastify";
import { FaSpinner } from "react-icons/fa";
import { validatePhone } from "@/utils/auth";

export default function ChangePhone({ setToggleUpdatePhone, userid }) {
  const [updatePhone] = useUpdateUserMutation();

  const [phone, setPhone] = useState("");
  const [errorPhone, setErrorPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleValidatePhone = () => {
    if (!phone.trim()) {
      setErrorPhone("Số điện thoại không được để trống");
      return false;
    }
    if (!validatePhone(phone)) {
      setErrorPhone("Số điện thoại không hợp lệ");
      return false;
    }
    setErrorPhone("");
    return true;
  };

  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    
    if (!handleValidatePhone()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await updatePhone({ phone, id: userid });
      if (response?.data.success && response.data.status === 200) {
        toast.success("Cập nhật số điện thoại thành công");
        setToggleUpdatePhone(false);
      } else {
        toast.error(response?.data.error || "Lỗi hệ thống, vui lòng thử lại sau ít phút");
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi khi cập nhật số điện thoại");
      console.error("Update phone error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[var(--secondary-dark)] rounded-lg shadow-lg p-6 w-96">
      <div className="flex relative justify-center items-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Phone Number</h2>
        <IoMdCloseCircleOutline
          className="absolute right-0 text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition duration-200"
          size={24}
          onClick={() => setToggleUpdatePhone(false)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
          New Phone Number
        </label>
        <input
          type="number"
          onChange={(e) => setPhone(e.target.value)}
          onBlur={handleValidatePhone}
          placeholder="Enter your new phone number"
          className="w-full bg-[var(--primary-dark)] border border-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--accent-color)]/20"
        />
        <small className="text-red-500 text-xs block h-5">{errorPhone}</small>
      </div>
      <button
        className="w-full bg-[var(--accent-color)] text-[var(--text-primary)] rounded-lg py-2 hover:bg-[var(--accent-color)]/80 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
        onClick={handleUpdatePhone}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin" />
            Processing...
          </span>
        ) : (
          "Update"
        )}
      </button>
    </div>
  );
}
