import { useState, useCallback, memo } from "react";
import { useGetFoodAndDrinksQuery } from "../../../api/foodAndDrinkApi";
import { useCreateComboMutation } from "../../../api/comboApi";
import { FiX, FiUpload, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "react-toastify";

// Component Item is separated to avoid unnecessary re-renders
const ComboItem = memo(({ item, index, foodAndDrinks, onItemChange, onRemoveItem }) => {
  return (
    <div className="flex gap-2 items-start p-2 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Food/Beverage
        </label>
        <select
          value={item.foodAndDrinkId}
          onChange={(e) => onItemChange(index, "foodAndDrinkId", e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Select item</option>
          {foodAndDrinks?.map((foodAndDrink) => (
            <option key={foodAndDrink.id} value={foodAndDrink.id}>
              {foodAndDrink.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-24">
        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
          Quantity
        </label>
        <input
          type="number"
          value={item.quantity}
          onChange={(e) => onItemChange(index, "quantity", Number(e.target.value))}
          min="1"
          className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="button"
        onClick={() => onRemoveItem(index)}
        className="mt-6 p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-150"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
});

ComboItem.displayName = "ComboItem";

export default function AddCombo({ setAddForm }) {
  const { data: List } = useGetFoodAndDrinksQuery();
  const foodAndDrinks = List?.items || [];
  
  const [add2] = useCreateComboMutation();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [profile_picture, setProfile_picture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedItems, setSelectedItems] = useState([{ foodAndDrinkId: "", quantity: 1 }]);
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

  // Cleanup URL when component unmounts
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
    if (!profile_picture) {
      setError("Please select an image for the combo.");
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

    setIsSubmitting(true);
    
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('profile_picture', profile_picture);
      
      // Convert items array to JSON string and append
      formData.append('items', JSON.stringify(selectedItems));
      
      // Call the API with FormData
      await add2(formData);
      toast.success("Combo added successfully!");
      setAddForm(false);
    } catch (error) {
      console.error("Error while submitting combo:", error);
      toast.error("Failed to add combo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    // Cleanup resources
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setAddForm(false);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Add Combo</h3>
        <button
          onClick={closeModal}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <FiX className="w-5 h-5 text-[var(--text-secondary)]" />
        </button>
      </div>

      <div className="p-3">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)]s mb-1">
                Combo Name
              </label>
              <input
                type="text"
                name="comboName"
                value={name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter price..."
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              Image
            </label>
            <div className="mt-1 flex justify-center px-3 py-3 border-2 border-gray-200 border-dashed rounded-lg hover:border-gray-300 transition-colors duration-200">
              <div className="space-y-2 text-center">
                {imagePreview ? (
                  <div className="relative w-24 h-24 mx-auto">
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
                    <FiUpload className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
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

          <div className="space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-[var(--text-secondary)]">Item List</h4>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
              >
                <FiPlus className="w-4 h-4" />
                <span>Add item</span>
              </button>
            </div>

            <div className="space-y-2">
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
            <div className="mb-3 p-2 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <button
              type="button"
              onClick={closeModal}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
