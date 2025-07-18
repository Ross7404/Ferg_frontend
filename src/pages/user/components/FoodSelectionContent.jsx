import { useEffect, useState, useCallback, useMemo } from "react";
import { useGetCombosQuery } from "@/api/comboApi";

import { formatImage } from "@/utils/formatImage";
import { formatTime } from "../../../utils/format";
// Component to display FoodItem
function FoodItem({ item, onQuantityChange }) {
  return (
    <div className="flex flex-col p-3 border rounded-lg shadow-sm hover:shadow-md transition mb-3 bg-[var(--secondary-dark)]">
      <div className="flex items-center justify-between">
        {/* Left side: Image + Info */}
        <div className="flex items-center space-x-3">
          {/* Image */}
          <div className="w-16 h-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
            <img
              src={formatImage(item.profile_picture)}
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div>
            <h3 className="text-base font-semibold text-[var(--text-primary)]">{item.name}</h3>
            <p className="font-semibold text-left text-[var(--accent-color)] text-sm">
              {Number(item.price).toLocaleString()}đ
            </p>
          </div>
        </div>

        {/* Right side: Increase/Decrease quantity */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            disabled={item.quantity === 0}
            className="px-2 py-1 text-base font-bold text-[var(--accent-color)] disabled:text-gray-400 border border-gray-300 rounded"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            className="px-2 py-1 text-base font-bold text-[var(--accent-color)] border border-gray-300 rounded"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Display list of items in combo */}
      {item.ComboItems && item.ComboItems.length > 0 && (
        <div className="mt-2 ml-16 border-t pt-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Includes:</p>
          <div className="grid grid-cols-2 gap-x-2 gap-y-0 mt-1">
            {item.ComboItems.map((comboItem) => (
              <div key={comboItem.id} className="flex items-center text-xs text-[var(--text-primary)]">
                <span className="inline-flex items-center justify-center w-4 h-4 bg-[var(--accent-color)] text-[var(--text-primary)] rounded-full font-medium text-xs mr-1">
                  {comboItem.quantity}
                </span>
                <span>{comboItem.FoodAndDrink?.name}</span>
                {comboItem.FoodAndDrink?.price && (
                  <span className="ml-1 text-[var(--text-secondary)] text-xs">
                    ({Number(comboItem.FoodAndDrink.price).toLocaleString()}đ)
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Component loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center p-3 border rounded-lg">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
          <div className="flex-grow px-3">
            <div className="h-4 w-1/2 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
          </div>
          <div className="w-16 h-7 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  );
}

export default function FoodSelectionContent({
  selectedFoodItems = [],
  onUpdateFoodItems,
}) {
  // Data fetching
  const { data: foodItems, isLoading, error } = useGetCombosQuery();
  const [localFoodItems, setLocalFoodItems] = useState([]);
  // Initialize local food list from API and selected items
  useEffect(() => {
    if (foodItems?.items) {
      const initialItems = foodItems.items.map((item) => ({
        ...item,
        quantity:
          selectedFoodItems.find((selected) => selected.id === item.id)
            ?.quantity || 0,
      }));
      setLocalFoodItems(initialItems);
    }
  }, [foodItems, selectedFoodItems]);

  // Handle food quantity changes
  const handleQuantityChange = useCallback(
    (id, change) => {
      setLocalFoodItems((prev) => {
        const updatedItems = prev.map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + change) }
            : item
        );

        // Only send items with quantity > 0 to parent component
        const selectedItems = updatedItems
          .filter((item) => item.quantity > 0)
          .map(({ id, name, price, quantity, profile_picture }) => ({
            id,
            name,
            price,
            quantity,
            image: profile_picture,
          }));

        onUpdateFoodItems(selectedItems);
        return updatedItems;
      });
    },
    [onUpdateFoodItems]
  );

  // Render food list
  const renderContent = useMemo(() => {
    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center mb-6">
          <p className="text-red-700">
            Error loading food list. Please try again later.
          </p>
        </div>
      );
    }

    if (isLoading) {
      return <LoadingSkeleton />;
    }

    if (!localFoodItems?.length) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 font-medium">No food items available</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {localFoodItems.map((item) => (
          <FoodItem
            key={item.id}
            item={item}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>
    );
  }, [error, isLoading, localFoodItems, handleQuantityChange]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Select food & drink</h1>
      <p className="text-gray-600 mb-6">
        Add food and drinks for a better movie experience
      </p>
      {renderContent}
    </div>
  );
}
