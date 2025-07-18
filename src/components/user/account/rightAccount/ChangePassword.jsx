import { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useUpdateUserMutation } from "@/api/userApi";
import { toast } from "react-toastify";
import { useResetPassMutation } from "@/api/authApi";
import { useForm } from "react-hook-form";
import { validateEmail } from "@/utils/auth";

function PasswordInput({ label, register, name, validation, showPassword, setShowPassword, error, placeholder }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">{label}</label>
      <div className="relative flex items-center">
        <input
          type={showPassword ? "text" : "password"}
          {...register(name, validation)}
          placeholder={placeholder}
          className="w-full bg-[var(--primary-dark)] border border-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--accent-color)]/20"
        />
        {showPassword ? (
          <FaEye className="absolute right-2 text-[var(--text-secondary)] cursor-pointer" onClick={() => setShowPassword(false)} />
        ) : (
          <FaEyeSlash className="absolute right-2 text-[var(--text-secondary)] cursor-pointer" onClick={() => setShowPassword(true)} />
        )}
      </div>
      {error && <small className="text-red-500 text-xs block h-5">{error}</small>}
    </div>
  );
}

export default function ChangePassword({ setToggleUpdatePassword, userid }) {
  const [updatePassword] = useUpdateUserMutation();
  const [resetPassword] = useResetPassMutation();
  
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form cho đổi mật khẩu
  const {
    register: passwordRegister,
    handleSubmit: handlePasswordSubmit,
    watch: watchPassword,
    formState: { errors: passwordErrors },
    trigger: triggerPassword,
  } = useForm({
    mode: "all",
    criteriaMode: "all",
  });

  // Form cho quên mật khẩu
  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
    trigger: triggerReset,
  } = useForm({
    mode: "all",
    criteriaMode: "all",
  });

  const handleBlur = (formType, fieldName) => {
    if (formType === "password") {
      triggerPassword(fieldName);
    } else {
      triggerReset(fieldName);
    }
  };

  const onPasswordSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");

    try {
      const response = await updatePassword({ 
        password: data.currentPassword, 
        newPassword: data.newPassword, 
        id: userid 
      });
      
      if (response?.data?.status === 401) {
        setServerError(response?.data?.message || "An error occurred");
      } else {
        toast.success("Password updated successfully");
        setToggleUpdatePassword(false);
      }
    } catch (error) {
      toast.error("An error occurred while updating password");
      console.error("Update password error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    setIsResetLoading(true);
    
    try {
      const response = await resetPassword(data.email);
      if(response?.data.error) {
        toast.error(response?.data.message || "System error");
      } else {
        toast.info(response?.data.message || "Password reset link has been sent to your email");
        setShowForgotPassword(false);
        setToggleUpdatePassword(false);
      }
    } catch (error) {
      toast.error("An error occurred while sending password reset request");
      console.error("Reset password error:", error);
    } finally {
      setIsResetLoading(false);
    }
  };

  return (
    <div className="bg-[var(--secondary-dark)] rounded-lg shadow-lg p-6 w-96">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Password</h2>
        <IoMdCloseCircleOutline
          className="text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition duration-200"
          size={24}
          onClick={() => setToggleUpdatePassword(false)}
        />
      </div>
      {!showForgotPassword ? (
        <form onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
          <PasswordInput 
            label="Current password" 
            register={passwordRegister} 
            name="currentPassword"
            validation={{
              required: "Please enter current password",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            }}
            showPassword={showPassword} 
            setShowPassword={setShowPassword} 
            error={passwordErrors.currentPassword?.message || serverError} 
            placeholder="Enter current password"
            onBlur={() => handleBlur("password", "currentPassword")}
          />
          <PasswordInput 
            label="New password" 
            register={passwordRegister} 
            name="newPassword"
            validation={{
              required: "Please enter new password",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters"
              }
            }}
            showPassword={showNewPassword} 
            setShowPassword={setShowNewPassword} 
            error={passwordErrors.newPassword?.message} 
            placeholder="Enter new password"
            onBlur={() => handleBlur("password", "newPassword")}
          />
          <PasswordInput 
            label="Confirm new password" 
            register={passwordRegister} 
            name="confirmPassword"
            validation={{
              required: "Please confirm new password",
              validate: value => value === watchPassword("newPassword") || "Passwords do not match"
            }}
            showPassword={showConfirmPassword} 
            setShowPassword={setShowConfirmPassword} 
            error={passwordErrors.confirmPassword?.message} 
            placeholder="Confirm new password"
            onBlur={() => handleBlur("password", "confirmPassword")}
          />
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[var(--accent-color)] text-[var(--text-primary)] rounded-lg py-2 hover:bg-[var(--accent-color)]/80 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
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
          <p className="text-center text-sm text-[var(--text-secondary)] mt-2 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => setShowForgotPassword(true)}>Forgot password?</p>
        </form>
      ) : (
        <form onSubmit={handleResetSubmit(onResetSubmit)}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">Enter email</label>
            <input
              type="email"
              {...resetRegister("email", {
                required: "Vui lòng nhập email",
                validate: {
                  validFormat: value => validateEmail(value) || "Email không hợp lệ"
                }
              })}
              placeholder="Nhập email để nhận link đặt lại mật khẩu"
              className="w-full bg-[var(--primary-dark)] border border-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--accent-color)]/20"
              onBlur={() => handleBlur("reset", "email")}
            />
            <small className="text-red-500 text-xs block h-5">
              {resetErrors.email?.message}
            </small>
          </div>
          <button 
            type="submit" 
            disabled={isResetLoading}
            className="w-full bg-[var(--accent-color)] text-[var(--text-primary)] rounded-lg py-2 hover:bg-[var(--accent-color)]/80 transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isResetLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FaSpinner className="animate-spin" />
                Đang gửi...
              </span>
            ) : (
              "Gửi link đặt lại mật khẩu"
            )}
          </button>
          <p className="text-center text-sm text-[var(--text-secondary)] mt-2 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => setShowForgotPassword(false)}>Quay lại</p>
        </form>
      )}
    </div>
  );
}