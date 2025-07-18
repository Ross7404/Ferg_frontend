import { IoGiftSharp } from "react-icons/io5";
import { BiSolidMedal } from "react-icons/bi";
import { useUpdateUserMutation } from "@/api/userApi";
import { toast } from "react-toastify";
import { formatImage } from "@/utils/formatImage";
import { useState } from "react";
import { FaSpinner } from "react-icons/fa";

export default function LeftAccount({ user }) {  
  
  const [changeImage] = useUpdateUserMutation();
  const [isUploading, setIsUploading] = useState(false);
  
  const spendingMilestones = [
    { label: "0 đ", value: 0 },
    { label: "2,000,000 đ", value: 2000000 },
    { label: "4,000,000 đ", value: 4000000 },
  ];

  const handleUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) return;
    
    setIsUploading(true);
    try {
      const response = await changeImage({ id: user.id, image });          
      if(response?.data.error) {
        return toast.error(response?.data.error || "Error updating image");
      }

      if (response?.data.success && response?.data.status === 200) {
        toast.success(response?.data.message || "Image updated successfully");
      } else {
        toast.error(response?.data.error || "Error updating image");
      }
    } catch (error) {
      toast.error(error?.data?.message || "An error occurred while uploading the image");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const currentSpending = 0;
  const maxSpending = spendingMilestones[spendingMilestones.length - 1].value;

  return (
    <div className="w-full bg-[var(--secondary-dark)] shadow-lg rounded-xl p-4 sm:p-6 border border-[var(--primary-dark)]">
      <div className="text-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-4 border-[var(--primary-dark)] shadow-sm relative">
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
              <FaSpinner className="animate-spin text-[var(--text-primary)] text-xl" />
            </div>
          )}
          {user?.image ? (
            <img
              className="w-full h-full object-cover"
              src={formatImage(user?.image)}
              alt="User avatar"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--primary-dark)] text-[var(--text-secondary)]">
              Image
            </div>
          )}
        </div>

        <div className="relative mt-4 sm:mt-5 w-fit mx-auto">
          <label
            htmlFor="upload"
            className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--primary-dark)] text-[var(--text-primary)] rounded-lg before:border-[var(--accent-color)]/20 hover:before:border-[var(--accent-color)]/40 group before:bg-[var(--primary-dark)] before:absolute before:inset-0 before:rounded-lg before:border before:border-dashed before:transition-transform before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 ${isUploading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isUploading ? (
              <>
                <FaSpinner className="animate-spin w-4 h-4 sm:w-5 sm:h-5 relative" />
                <span className="font-medium text-xs sm:text-sm relative">Uploading...</span>
              </>
            ) : (
              <>
                <img
                  className="w-4 h-4 sm:w-5 sm:h-5 relative"
                  src="https://www.svgrepo.com/show/485545/upload-cicle.svg"
                  alt="Upload icon"
                />
                <span className="font-medium text-xs sm:text-sm relative group-hover:text-[var(--accent-color)]">
                  Upload image
                </span>
              </>
            )}
          </label>
          <input 
            hidden 
            type="file" 
            id="upload" 
            onChange={handleUpload} 
            disabled={isUploading}
            accept="image/*"
          />
        </div>

        <h2 className="flex items-center justify-center mt-4 text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
          <BiSolidMedal className="text-[var(--accent-color)] w-5 h-5 sm:w-6 sm:h-6" />
          <span className="ml-2">{user?.username || "User"}</span>
        </h2>
        <div className="flex items-center justify-center mt-1.5 text-[var(--text-secondary)] text-sm">
          <IoGiftSharp className="text-[var(--accent-color)] w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="ml-1.5">{user?.star} stars</span>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h3 className="text-[var(--text-primary)] text-sm sm:text-base font-medium mb-2">Total spending 2025</h3>
        <div className="relative w-full h-3 sm:h-4 bg-[var(--primary-dark)] rounded-md overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-[var(--accent-color)] rounded-md"
            style={{ width: `${(currentSpending / maxSpending) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          {spendingMilestones.map((milestone) => (
            <span key={milestone.value}>{milestone.label}</span>
          ))}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 border-t border-[var(--primary-dark)] pt-4 text-center">
        <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
          Support HOTLINE: <span className="font-medium text-[var(--text-primary)]">19002224</span> (9:00 -
          22:00)
        </p>
      </div>
    </div>
  );
}
