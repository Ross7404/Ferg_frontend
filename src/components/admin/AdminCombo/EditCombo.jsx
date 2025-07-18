import { useState, useCallback, memo } from "react";
import PropTypes from "prop-types";
import { useGetFoodAndDrinksQuery } from "../../../api/foodAndDrinkApi";
import { useUpdateComboMutation } from "../../../api/comboApi";
import { FiX, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";
import { formatImage } from "@/utils/formatImage";

// Component Item is separated to avoid unnecessary re-renders
const ComboItem = memo(({ item, index, foodAndDrinks, onItemChange, onRemoveItem }) => {
  // Add check to avoid errors when foodAndDrinks hasn't loaded
  const hasFoodOptions = Array.isArray(foodAndDrinks) && foodAndDrinks.length > 0;
  
  return (
    <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Food/Beverage
        </label>
        <select
          value={item.foodAndDrinkId}
          onChange={(e) => onItemChange(index, "foodAndDrinkId", e.target.value)}
          className={`w-full px-3 py-2 text-sm border ${!hasFoodOptions ? 'border-yellow-300' : 'border-gray-200'} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white`}
          disabled={!hasFoodOptions}
        >
          <option value="">Select item</option>
          {hasFoodOptions ? (
            foodAndDrinks.map((foodAndDrink) => (
              <option key={foodAndDrink.id} value={foodAndDrink.id}>
                {foodAndDrink.name}
              </option>
            ))
          ) : (
            <option value="" disabled>Loading items list...</option>
          )}
        </select>
      </div>

      <div className="w-28">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Quantity
        </label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onItemChange(index, "quantity", Number(e.target.value))}
          min="1"
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemoveItem(index)}
        className="mt-7 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
      >
        <FiTrash2 className="w-5 h-5" />
      </button>
    </div>
  );
});

ComboItem.displayName = "ComboItem";

// Định nghĩa PropTypes cho ComboItem
ComboItem.propTypes = {
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  foodAndDrinks: PropTypes.array,
  onItemChange: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired
};

const EditCombo = ({ combo, setEditForm }) => {
  const { data: foodAndDrinkData, isLoading: isLoadingFoods, error: foodDataError } = useGetFoodAndDrinksQuery();
  // Đảm bảo truy cập đúng cấu trúc dữ liệu API trả về
  const foodAndDrinks = foodAndDrinkData?.items || [];
  
  const [update] = useUpdateComboMutation();
  const [name, setName] = useState(combo.name);
  const [price, setPrice] = useState(combo.price);
  const [profile_picture, setProfile_picture] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    combo?.profile_picture ? formatImage(combo.profile_picture) : null
  );
  
  // Đảm bảo khởi tạo các món trong combo một cách an toàn
  const [selectedItems, setSelectedItems] = useState(() => {
    if (!combo.ComboItems || !Array.isArray(combo.ComboItems)) {
      console.warn("ComboItems is missing or not an array:", combo);
      return [];
    }
    
    // Map các item trong combo để tạo dữ liệu cho form
    return combo.ComboItems.map((item) => {
      if (!item.FoodAndDrink) {
        console.warn("FoodAndDrink data missing in item:", item);
        return { foodAndDrinkId: item.product_id || "", quantity: item.quantity || 1 };
      }
      return {
        foodAndDrinkId: item.FoodAndDrink.id,
        quantity: item.quantity,
      };
    }).filter(item => item.foodAndDrinkId); // Lọc bỏ các item không có id
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    name === "comboName" ? setName(value) : setPrice(value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile_picture(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Dọn dẹp URL khi component unmount
  const handleClosePreview = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setProfile_picture(null);
  };

  const handleItemChange = useCallback((index, field, value) => {
    setSelectedItems(prev => 
      prev.map((item, i) => i === index ? { ...item, [field]: value } : item)
    );
  }, []);

  const addItem = useCallback(() => {
    setSelectedItems(prev => [...prev, { foodAndDrinkId: "", quantity: 1 }]);
  }, []);

  const removeItem = useCallback((index) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const validateFields = () => {
    setError("");

          if (!name.trim()) {
        setError("Combo name cannot be empty.");
        return false;
      }
      if (!price || price <= 0) {
        setError("Combo price must be a valid number greater than 0.");
        return false;
      }
      if (selectedItems.length === 0 || selectedItems.every(item => !item.foodAndDrinkId)) {
        setError("You must select at least one item.");
        return false;
      }
      const foodAndDrinkIds = selectedItems.map((item) => item.foodAndDrinkId).filter(Boolean);
      const hasDuplicates = new Set(foodAndDrinkIds).size !== foodAndDrinkIds.length;
      if (hasDuplicates) {
        setError("You cannot select duplicate items.");
        return false;
      }
      if (selectedItems.some(item => item.quantity <= 0)) {
        setError("Item quantity must be greater than 0.");
        return false;
      }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateFields()) return;

    try {
      setIsSubmitting(true);
      
      // Tạo FormData object
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      
      if (profile_picture) {
        formData.append("profile_picture", profile_picture);
      }
      
      // Chuyển đổi mảng selectedItems thành JSON string
      const itemsForServer = selectedItems.map(item => ({
        foodAndDrinkId: item.foodAndDrinkId,
        quantity: item.quantity
      }));
      formData.append("items", JSON.stringify(itemsForServer));
      
      // Gọi API với FormData
      const response = await update({ 
        id: combo.id, 
        data: formData 
      }).unwrap();
      
      toast.success(response?.message || "Combo updated successfully!");
      setEditForm(false);
    } catch (error) {
      console.error("Error while updating combo:", error);
      toast.error(`Failed to update combo: ${error.data?.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    // Dọn dẹp resources
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setEditForm(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Edit Combo</h3>
        <button
          onClick={closeModal}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <FiX className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Combo Name
              </label>
              <input
                type="text"
                name="comboName"
                value={name}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter combo name..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                Combo Price
              </label>
              <input
                type="number"
                name="comboPrice"
                value={price}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price..."
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Image
            </label>
            <div className="mt-1 flex justify-center px-4 py-4 border-2 border-gray-200 border-dashed rounded-lg hover:border-gray-300 transition-colors duration-200">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative w-28 h-28 mx-auto">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleClosePreview}
                      className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-full transform translate-x-1/2 -translate-y-1/2 hover:bg-red-600"
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <FiUpload className="mx-auto h-10 w-10 text-[var(--text-secondary)]" />
                    <div className="flex justify-center text-sm text-[var(--text-secondary)]">
                      <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                        <span>Upload image</span>
                        <input
                          type="file"
                          className="sr-only"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">PNG, JPG, GIF up to 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Item List</h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add item</span>
              </button>
            </div>

            {/* Hiển thị thông báo trạng thái tải dữ liệu */}
            {isLoadingFoods && (
              <div className="p-3 bg-blue-50 rounded-lg mb-3">
                <p className="text-sm text-blue-600">Loading food and beverage list...</p>
              </div>
            )}
            
            {foodDataError && (
              <div className="p-3 bg-red-50 rounded-lg mb-3">
                <p className="text-sm text-red-600">
                  Unable to load food and beverage list. Please try again later.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {selectedItems.map((item, index) => (
                <ComboItem 
                  key={index} 
                  item={item}
                  index={index}
                  foodAndDrinks={foodAndDrinks}
                  onItemChange={handleItemChange}
                  onRemoveItem={removeItem}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </>
              ) : (
                "Update"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default EditCombo;
