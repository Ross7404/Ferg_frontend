import { IoMdCloseCircleOutline } from "react-icons/io";
import { useState } from "react";
import { useUpdateUserMutation } from "@/api/userApi";
import { toast } from "react-toastify";
import { useForm } from "react-hook-form";
import { validateEmail } from "@/utils/auth";
import { FaSpinner } from "react-icons/fa";

export default function ChangeEmail({ setToggleUpdateEmail, userid }) {
  const [updateEmail] = useUpdateUserMutation();
  const [isLoading, setIsLoading] = useState(false);
  
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
      const response = await updateEmail({ email: data.email, id: userid });    
      if (response.data.user.status === 200) {
        toast.success("Email updated successfully");
        setToggleUpdateEmail(false);
      } else {
        toast.error(response?.data.error || "System error, please try again in a few minutes");
      }
    } catch (error) {
      toast.error("An error occurred while updating email");
      console.error("Update email error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="bg-[var(--secondary-dark)] rounded-lg shadow-lg p-6 w-96">
      <div className="flex relative justify-center items-center mb-4">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Change Email</h2>
        <IoMdCloseCircleOutline
          className="absolute right-0 text-[var(--text-secondary)] cursor-pointer hover:text-[var(--text-primary)] transition duration-200"
          size={24}
          onClick={() => setToggleUpdateEmail(false)}
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <p className="text-sm text-[var(--text-secondary)] mb-4">
          Please provide your new email and password, we will send you a
          verification code!
        </p>
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
            New email
          </label>
          <input
            {...register("email", {
              required: "Please enter your email",
              validate: {
                validFormat: (value) => validateEmail(value) || "Invalid email format"
              }
            })}
            type="text"
            placeholder="Enter new email"
            className="w-full bg-[var(--primary-dark)] border border-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-[var(--accent-color)]/20"
            onBlur={() => handleBlur("email")}
          />
          <small className="text-red-500 text-xs block h-5">
            {errors.email?.message}
          </small>
        </div>
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
      </form>
    </div>
  );
}
