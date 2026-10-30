import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { X, Edit2, HelpCircle } from "lucide-react";
import { Button } from "../ui";

const ItemViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const item = useSelector((state) => 
    state.items.items.find((i) => i.id === id)
  );

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Item not found</h2>
        <Button onClick={() => navigate("/admin/accounts/items")}>Back to Items</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-normal text-gray-800 dark:text-gray-100">
            {item.name}
          </h1>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {item.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => navigate(`/admin/accounts/items/edit/${item.id}`)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50"
          >
            <Edit2 size={14} className="mr-1" /> Edit
          </Button>
          <button
            onClick={() => navigate("/admin/accounts/items")}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-6xl py-8 px-8">
        
        {/* Core Info Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="text-xs text-gray-500 mb-1">Usage Unit</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.usageUnit || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Selling Price</p>
            <p className="text-sm font-medium text-green-600">${(Number(item.rate) || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Cost Price</p>
            <p className="text-sm font-medium text-red-600">${(Number(item.purchaseRate) || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Sales Information */}
        <div className="mb-10">
          <h2 className="text-lg font-normal text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
            Sales Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs text-gray-500 mb-1">Account</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{item.salesAccount || "Sales"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {item.description || "No description provided."}
              </p>
            </div>
          </div>
        </div>

        {/* Purchase Information */}
        <div className="mb-10">
          <h2 className="text-lg font-normal text-gray-800 dark:text-gray-200 mb-4 border-b pb-2">
            Purchase Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
            <div>
              <p className="text-xs text-gray-500 mb-1">Account</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{item.purchaseAccount || "Cost of Goods Sold"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Preferred Vendor</p>
              <p className="text-sm text-gray-900 dark:text-gray-100">{item.preferredVendor || "-"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500 mb-1">Description</p>
              <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {item.purchaseDescription || "No description provided."}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ItemViewPage;