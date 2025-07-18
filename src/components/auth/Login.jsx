import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { GoogleOAuthProvider } from "@react-oauth/google";
import {
  useLoginMutation,
  useVerifyGoogleTokenMutation,
} from "@/api/authApi";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { validateEmail } from "@/utils/auth";
import { useResendActiveAccountMutation } from "../../api/authApi";

export default function Login() {
  const navigate = useNavigate();
  const [resendActive] = useResendActiveAccountMutation();

  const [loginByGoogle] = useVerifyGoogleTokenMutation();
  const [login] = useLoginMutation();

  const [isShowBtnActive, setIsShowBtnActive] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm({ 
    mode: "all", 
    criteriaMode: "all",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError("");
    
    try {
      const response = await login({ 
        email: data.email, 
        password: data.password 
      });
      if (response?.data?.error && response?.data?.status === 403) {
        setIsShowBtnActive(true);
        return toast.error(response?.data?.message || "Account not activated!");
      }
      if(response?.data?.error) {
        return toast.error(response?.data?.message || "System error");;
      }
      
      if (response.data.success && response.data.status === 200) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
        const user = {
          role: response.data.data.role,
          id: response.data.data.id,
        };
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!");
        
        if (response.data.data.role === "admin" || response.data.data.role === "branch_admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      toast.error(
        error?.data?.message ||
          "An error occurred while logging in. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlur = (fieldName) => {
    trigger(fieldName);
  };

  const handleGoogleLogin = async (response) => {
    setIsLoading(true);
    try {
      const token = response.credential;
      const data = await loginByGoogle(token);

      if (data.data.status === 200) {
        localStorage.setItem("accessToken", data.data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.data.refreshToken);
        const user = {
          role: data.data.data.role,
          id: data.data.data.id,
        };
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Login successful!");

        if (data.data.data.role === "admin" || data.data.data.role === "branch_admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        setServerError("Incorrect username or password!");
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast.error("Google login failed. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActive = async () => {
    const email = getValues("email");
    if (!email) {
      return toast.error("Please enter your email to activate your account");
    }
    
    try {
      const response = await resendActive({email});
      if(response?.data.success) {
        return toast.success(response?.data.message || "Check your email"); 
      }
      toast.error(response?.data.message || "System error");
    } catch (error) {
      toast.error(error?.data?.message || "System error");
      console.error("Resend active error:", error);
    }
  }
  
  return (
    <GoogleOAuthProvider clientId="518283456823-ss29g1s16v4dngd2vojjtr1rig4olmc2.apps.googleusercontent.com">
      <div className="bg-[var(--primary-dark)] font-[sans-serif] min-h-screen flex items-center justify-center p-4">
        <div className="max-w-5xl w-full bg-[var(--secondary-dark)] rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
          {/* Logo Section - Left */}
          <div className="md:w-2/5 bg-gradient-to-br from-orange-400 to-orange-600 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute w-full h-full top-0 left-0 bg-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="w-40 mx-auto animate-float rounded-lg overflow-hidden">
                <Link to="/">
                  <img
                    src="/src/public/LogoHeader.jpg"
                    alt="logo"
                    className="w-40 object-contain drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] transform transition-transform duration-700 hover:rotate-12 animate-pulse"
                  />
                </Link>
              </div>
              <h2 className="text-white text-2xl font-bold text-center mt-6 animate-typing overflow-hidden whitespace-nowrap">
                Ferg-Cinema
              </h2>
              <p className="text-orange-100 text-center mt-2 animate-fadeIn opacity-0">
                Online movie ticket booking system
              </p>
            </div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
          </div>

          {/* Form Section - Right */}
          <div className="md:w-3/5 p-8 overflow-y-auto max-h-screen">
            <div className="max-w-md mx-auto">
              <h2 className="text-orange-600 text-center text-2xl font-bold mb-6 animate-slideDown">
                Login
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div
                  className="animate-slideIn"
                  style={{ animationDelay: "0.2s" }}
                >
                  <label className="text-[var(--text-primary)] text-sm block mb-1">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      {...register("email", {
                        required: "Email is required",
                        validate: {
                          validFormat: (value) =>
                            validateEmail(value) || "Invalid email format",
                        },
                      })}
                      type="text"
                      className="w-full text-sm text-[var(--text-primary)] border-b border-orange-200 focus:border-orange-500 px-2 py-2 outline-none transition-colors duration-300"
                      placeholder="Enter email"
                      onBlur={() => handleBlur("email")}
                    />
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="#F97316"
                      stroke="#F97316"
                      className="w-[18px] h-[18px] absolute right-2"
                      viewBox="0 0 682.667 682.667"
                    >
                      <defs>
                        <clipPath id="a" clipPathUnits="userSpaceOnUse">
                          <path d="M0 512h512V0H0Z" data-original="#000000" />
                        </clipPath>
                      </defs>
                      <g
                        clipPath="url(#a)"
                        transform="matrix(1.33 0 0 -1.33 0 682.667)"
                      >
                        <path
                          fill="none"
                          strokeMiterlimit={10}
                          strokeWidth={40}
                          d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z"
                          data-original="#000000"
                        />
                        <path
                          d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z"
                          data-original="#000000"
                        />
                      </g>
                    </svg>
                  </div>
                  <small className="text-red-500 text-xs block h-5">
                    {errors.email?.message || serverError}
                  </small>
                </div>
                <div
                  className="animate-slideIn"
                  style={{ animationDelay: "0.4s" }}
                >
                  <label className="text-[var(--text-primary)] text-sm mb-1 block">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <input
                      {...register("password", {
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                      type={showPassword ? "text" : "password"}
                      className="w-full text-[var(--text-primary)] text-sm border-b border-orange-200 px-2 py-2 outline-none focus:border-orange-500 transition-colors duration-300"
                      placeholder="Enter password"
                      onBlur={() => handleBlur("password")}
                    />
                    {showPassword ? (
                      <FaEye
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="w-[16px] text-orange-400 absolute right-2 cursor-pointer"
                      />
                    ) : (
                      <FaEyeSlash
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="w-[16px] text-orange-400 absolute right-2 cursor-pointer"
                      />
                    )}
                  </div>
                  <small className="text-red-500 text-xs block h-5">
                    {errors.password?.message}
                  </small>
                </div>
                <div
                  className="flex flex-wrap items-center justify-end gap-4 animate-slideIn"
                  style={{ animationDelay: "0.6s" }}
                >
                  {isShowBtnActive && (
                    <button
                      type="button"
                      onClick={handleActive}
                      className="text-blue-600 hover:text-[var(--text-primary)] font-medium text-sm flex items-center"
                    >
                      <FaEnvelope className="mr-1" /> Resend activation email
                    </button>
                  )}
                  <div className="text-sm">
                    <Link
                      to="/resetPass"
                      className="text-[var(--text-primary)] hover:text-[var(--text-primary)] font-semibold transition-colors duration-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>
                <div
                  className="mt-6 animate-slideIn"
                  style={{ animationDelay: "0.8s" }}
                >
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
                      "Login"
                    )}
                  </button>
                </div>
                <p
                  className="text-[var(--text-secondary)] text-sm mt-4 text-center animate-slideIn"
                  style={{ animationDelay: "1s" }}
                >
                  Don't have an account?{" "}
                  <Link
                    to="/register"
                    className="text-orange-500 hover:text-orange-600 ml-1 whitespace-nowrap font-semibold transition-colors duration-300"
                  >
                    Register now
                  </Link>
                </p>
                <div
                  className="my-5 flex items-center gap-4 animate-slideIn"
                  style={{ animationDelay: "1.2s" }}
                >
                  <hr className="w-full border-orange-200" />
                  <p className="text-sm text-[var(--text-secondary)] text-center">or</p>
                  <hr className="w-full border-orange-200" />
                </div>
                <div
                  className="flex w-full justify-center animate-slideIn"
                  style={{ animationDelay: "1.4s" }}
                >
                  <div className="w-full google-login-wrapper">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={(error) =>
                        console.error("Google login error:", error)
                      }
                      useOneTap
                      theme="outline"
                      text="signin_with"
                      shape="rectangular"
                      locale="vi"
                      logo_alignment="center"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

/* Thêm style keyframes để tạo hiệu ứng float cho logo và typing cho chữ */
const style = document.createElement("style");
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
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
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


