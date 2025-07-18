import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logoHeader from "@/public/LogoHeader.jpg";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useNewPassMutation } from "@/api/authApi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";

export default function NewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [newPass] = useNewPassMutation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({ 
    mode: "all", 
    criteriaMode: "all",
  });

  const handleBlur = (fieldName) => {
    trigger(fieldName);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    
    try {
      const response = await newPass({ token, password: data.password, email });

      if (response.data.status === 401) {
        toast.error("Invalid or expired token!");
      } else {
        toast.success("Update successful, please login");
        navigate("/login");
      }
    } catch (error) {
      toast.error("An error occurred, please try again later.");
      console.error("Reset password error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[var(--primary-dark)] font-[sans-serif] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-5xl w-full bg-[var(--secondary-dark)] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Logo Section - Left */}
        <div className="md:w-2/5 bg-gradient-to-br from-orange-400 to-orange-600 p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute w-full h-full top-0 left-0 bg-pattern opacity-10"></div>
          <div className="relative z-10">
            <div className="w-40 rounded-lg overflow-hidden mx-auto animate-float">
              <Link to="/">
                <img 
                  src={logoHeader}
                  alt="logo" 
                  className="w-40 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:rotate-12 animate-pulse"
                />
              </Link>
            </div>
            <h2 className="text-white text-2xl font-bold text-center mt-6 animate-typing overflow-hidden whitespace-nowrap">Ferg-Cinema</h2>
            <p className="text-orange-100 text-center mt-2 animate-fadeIn opacity-0">Online movie ticket booking system</p>
          </div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
        </div>
        
        {/* Form Section - Right */}
        <div className="md:w-3/5 p-8 overflow-y-auto max-h-screen">
          <div className="max-w-md mx-auto">
            <h2 className="text-orange-600 text-center text-2xl font-bold mb-6 animate-slideDown">
              Reset Password
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="animate-slideIn" style={{animationDelay: "0.2s"}}>
                <label className="text-[var(--text-primary)] text-sm block mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    {...register("password", {
                      required: "Please enter new password",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters"
                      }
                    })}
                    type={showPassword ? "text" : "password"}
                    className="w-full text-sm text-[var(--text-primary)] border-b border-orange-200 focus:border-orange-500 px-2 py-2 outline-none transition-colors duration-300"
                    placeholder="Enter new password"
                    onBlur={() => handleBlur("password")}
                  />
                  {showPassword ? (
                    <FaEye
                      onClick={() => setShowPassword(false)}
                      className="w-[16px] text-orange-400 absolute right-2 cursor-pointer"
                    />
                  ) : (
                    <FaEyeSlash
                      onClick={() => setShowPassword(true)}
                      className="w-[16px] text-orange-400 absolute right-2 cursor-pointer"
                    />
                  )}
                </div>
                <small className="text-red-500 text-xs block h-5">
                  {errors.password?.message}
                </small>
              </div>
              <div className="mt-6 animate-slideIn" style={{animationDelay: "0.4s"}}>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 px-4 text-sm tracking-wide rounded-md text-white bg-orange-500 hover:bg-orange-600 focus:outline-none transform transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
              <p className="text-[var(--text-secondary)] text-sm mt-4 text-center animate-slideIn" style={{animationDelay: "0.6s"}}>
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-orange-500 hover:text-orange-700 font-semibold transition-colors duration-300 ml-1 whitespace-nowrap"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Thêm style keyframes để tạo hiệu ứng */
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }
  
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  
  @keyframes typing {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
  
  .animate-typing {
    animation: typing 1.5s steps(20, end) forwards;
    width: 0;
    border-right: 2px solid orange;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeIn {
    animation: fadeIn 1s ease-out 1.5s forwards;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideDown {
    animation: slideDown 0.8s ease-out forwards;
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-slideIn {
    opacity: 0;
    animation: slideIn 0.5s ease-out forwards;
  }
  
  .bg-pattern {
    background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 20px 20px;
  }
`;
document.head.appendChild(style);
