// src/admin/components/ContactPersonModal.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createContactPerson,
  updateContactPerson,
  fetchContactPersonById,
  fetchCustomerById,
} from "../../../store/slices/accounts/customersSlice";
import { X, Upload, MessageCircle, Loader2 } from "lucide-react";

export default function ContactPersonModal({
  isOpen,
  onClose,
  customerId,
  editId = null,
  salutations = [],
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  
  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    email: "",
    workPhone: "",
    mobile: "",
    skype: "",
    designation: "",
    department: "",
    enablePortal: false,
  });

  const isEditMode = !!editId;

  useEffect(() => {
    if (!isOpen) return;

    const initForm = async () => {
      if (isEditMode) {
        setFetching(true);
        const result = await dispatch(fetchContactPersonById({ customerId, id: editId }));
        if (fetchContactPersonById.fulfilled.match(result)) {
          const cp = result.payload;
          setFormData({
            salutation: cp.salutation || "",
            firstName: cp.first_name || cp.firstName || "",
            lastName: cp.last_name || cp.lastName || "",
            email: cp.email || "",
            workPhone: cp.work_phone || cp.workPhone || "",
            mobile: cp.mobile || "",
            skype: cp.skype || "", // If API supports it
            designation: cp.designation || "",
            department: cp.department || "",
            enablePortal: cp.enable_portal || false,
          });
        }
        setFetching(false);
      } else {
        setFormData({
          salutation: "",
          firstName: "",
          lastName: "",
          email: "",
          workPhone: "",
          mobile: "",
          skype: "",
          designation: "",
          department: "",
          enablePortal: false,
        });
      }
    };

    initForm();
  }, [isOpen, isEditMode, editId, customerId, dispatch]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName && !formData.lastName && !formData.email) {
      alert("Please fill at least a name or email.");
      return;
    }

    setLoading(true);
    
    // Clean up phone numbers if they already have prefixes
    const cleanPhone = (phone) => phone.replace(/^\+91\s*/, "");
    
    const payload = {
      customerId,
      id: editId,
      ...formData,
      workPhone: formData.workPhone ? `+91 ${cleanPhone(formData.workPhone)}` : "",
      mobile: formData.mobile ? `+91 ${cleanPhone(formData.mobile)}` : "",
    };

    let result;
    if (isEditMode) {
      result = await dispatch(updateContactPerson(payload));
    } else {
      result = await dispatch(createContactPerson(payload));
    }

    const isSuccess = isEditMode
      ? updateContactPerson.fulfilled.match(result)
      : createContactPerson.fulfilled.match(result);

    if (isSuccess) {
      await dispatch(fetchCustomerById(customerId));
      onClose();
    } else {
      alert(result.payload || "Failed to save contact person");
    }
    
    setLoading(false);
  };

  // Helper to safely extract string from salutation objects or plain strings
  const getSalutationValue = (s) => {
    if (typeof s === "string") return s;
    if (s && typeof s === "object") return s.value || s.label || s.code || "";
    return "";
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[60]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl z-[70] flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {isEditMode ? "Edit Contact Person" : "Add Contact Person"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {fetching ? (
             <div className="flex flex-col items-center justify-center h-64 text-gray-500">
               <Loader2 size={24} className="animate-spin text-green-500 mb-2" />
               <span className="text-sm">Loading details...</span>
             </div>
          ) : (
            <form id="contactPersonForm" onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-8">
              
              {/* Left Side: Inputs */}
              <div className="flex-1 space-y-4">
                
                {/* Name Row */}
                <div className="flex items-start gap-4">
                  <label className="w-32 pt-2 text-sm text-gray-700 dark:text-gray-300">Name</label>
                  <div className="flex-1 flex gap-2">
                    <select
                      name="salutation"
                      value={formData.salutation}
                      onChange={handleChange}
                      className="w-1/4 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    >
                      <option value="">Salutation</option>
                      {salutations.map((s, idx) => {
                        const val = getSalutationValue(s);
                        return (
                          <option key={`${val}-${idx}`} value={val}>
                            {val}
                          </option>
                        );
                      })}
                      {salutations.length === 0 && <option value="Mr.">Mr.</option>}
                      {salutations.length === 0 && <option value="Mrs.">Mrs.</option>}
                    </select>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="First Name"
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Last Name"
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm text-gray-700 dark:text-gray-300">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4">
                  <label className="w-32 pt-2 text-sm text-gray-700 dark:text-gray-300">Phone</label>
                  <div className="flex-1 space-y-2">
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm">+91</span>
                      <input
                        type="text"
                        name="workPhone"
                        value={formData.workPhone}
                        onChange={handleChange}
                        placeholder="Work Phone"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-r px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l bg-gray-50 dark:bg-gray-700 text-gray-500 text-sm">+91</span>
                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Mobile"
                        className="flex-1 border border-gray-300 dark:border-gray-600 rounded-r px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Skype */}
                <div className="flex items-center gap-4">
                  <label className="w-32 text-sm text-gray-700 dark:text-gray-300">Skype Name/Number</label>
                  <div className="flex-1 flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l bg-gray-50 dark:bg-gray-700 text-blue-500">
                      <MessageCircle size={16} />
                    </span>
                    <input
                      type="text"
                      name="skype"
                      value={formData.skype}
                      onChange={handleChange}
                      placeholder="Skype Name/Number"
                      className="flex-1 border border-gray-300 dark:border-gray-600 rounded-r px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Other Details */}
                <div className="flex items-start gap-4">
                  <label className="w-32 pt-2 text-sm text-gray-700 dark:text-gray-300">Other Details</label>
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Designation"
                      className="w-1/2 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Department"
                      className="w-1/2 border border-gray-300 dark:border-gray-600 rounded px-2 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none"
                    />
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700 my-2" />

                {/* Portal Access */}
                <div className="space-y-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="enablePortal"
                      checked={formData.enablePortal}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">Enable portal access</span>
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 pl-6 leading-relaxed">
                    This customer will be able to see all their transactions with your organization by logging in to the portal using their email address. <a href="#" className="text-blue-500 hover:underline">Learn More</a>
                  </p>
                </div>

              </div>

              {/* Right Side: Image Upload */}
              <div className="w-full md:w-64 shrink-0">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center text-center h-64 bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center mb-3">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Drag & Drop Profile Image</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight mb-4">
                    Supported Files: jpg, jpeg, png, gif, bmp<br />Maximum File Size: 5MB
                  </p>
                  <button type="button" className="text-sm text-gray-700 dark:text-gray-300 underline font-medium hover:text-gray-900">Upload File</button>
                </div>
              </div>
              
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button
            type="submit"
            form="contactPersonForm"
            disabled={loading || fetching}
            className="px-5 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />} Save
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>

      </div>
    </>
  );
}