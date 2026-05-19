import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  updateOrganization,
  fetchOrganizations,
} from "../store/slices/organizationSlice";
import { showToast } from "../../components/common/Toast";
import { getStorageUrl } from "../../utils/apiClient";

const EditOrganization = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organizations, loading } = useSelector(
    (state) => state.organizations || {},
  );
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    multi_company: "",
    logo: null,
    existingLogo: null,
  });
  const [initialized, setInitialized] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    if (!organizations || organizations.length === 0) {
      dispatch(fetchOrganizations());
    }
  }, [dispatch, organizations]);

  // Separate useEffect to handle form initialization
  useEffect(() => {
    if (organizations && organizations.length > 0 && id && !initialized) {
      const organization = organizations.find((org) => org.id === parseInt(id));

      if (organization) {
        const rawOrg = organization.raw || organization;
        // Handle multi_company value from API
        let multiCompanyValue = "No";

        // Check has_multiple_companies (API field)
        if (rawOrg.has_multiple_companies !== undefined) {
          const val = rawOrg.has_multiple_companies;
          if (val === true || val === 1 || val === "1" || val === "true") {
            multiCompanyValue = "Yes";
          }
        }
        // Fallback to multi_company (Redux field)
        else if (rawOrg.multi_company !== undefined) {
          const val = rawOrg.multi_company;
          if (val === "Yes" || val === true || val === 1 || val === "1") {
            multiCompanyValue = "Yes";
          }
        }

        // Get existing logo URL
        let existingLogoUrl = null;
        if (organization.logo) {
          existingLogoUrl = getStorageUrl(organization.logo);
        }

        const newFormData = {
          name: organization.name || "",
          phone: organization.phone || "",
          email: organization.email || "",
          address: organization.address || "",
          multi_company: multiCompanyValue,
          logo: null,
          existingLogo: existingLogoUrl,
        };

        console.log("Set form data:", newFormData);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData(newFormData);
        setLogoPreview(existingLogoUrl);
        setInitialized(true);
      }
    }
  }, [organizations, id, initialized]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("File size must be less than 2MB", "error");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/gif",
        "image/svg+xml",
      ];
      if (!allowedTypes.includes(file.type)) {
        showToast("Only JPG, PNG, GIF, and SVG files are allowed", "error");
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);

      setFormData((prev) => ({ ...prev, logo: file, existingLogo: null }));
    }
  };

  const removeLogo = () => {
    setFormData((prev) => ({ ...prev, logo: null, existingLogo: null }));
    setLogoPreview(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name.trim()) {
    showToast("Organization name is required", "error");
    return;
  }

  setUpdating(true);
  try {
    const submitData = new FormData();
    submitData.append("name", formData.name);
    if (formData.phone) submitData.append("phone", formData.phone);
    if (formData.email) submitData.append("email", formData.email);
    if (formData.address) submitData.append("address", formData.address);

    const multiCompanyValue = formData.multi_company === "Yes" ? 1 : 0;
    submitData.append("has_multiple_companies", multiCompanyValue);

    if (formData.logo) {
      submitData.append("logo", formData.logo);
    }

    console.log("Submitting update with FormData:");
    for (let pair of submitData.entries()) {
      console.log(`  ${pair[0]}: ${pair[1] instanceof File ? pair[1].name : pair[1]}`);
    }

    const result = await dispatch(
      updateOrganization({
        id: parseInt(id),
        data: submitData,
        isFormData: true,
      }),
    );

    if (updateOrganization.fulfilled.match(result)) {
      showToast("Organization updated successfully", "success");
      await dispatch(fetchOrganizations());
      navigate("/admin/organizations");
    } else {
      const errorMsg = result.payload || "Failed to update organization";
      showToast(errorMsg, "error");
      setUpdating(false);
    }
  } catch (error) {
    console.error("Update error:", error);
    showToast("An error occurred while updating", "error");
    setUpdating(false);
  }
};

  return (
    <div className="w-full overflow-x-hidden px-4 md:px-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm mb-4 md:mb-6 flex-wrap">
        <button
          onClick={() => navigate("/admin/organizations")}
          className="text-green-500 hover:text-green-600 font-medium"
        >
          Organizations
        </button>
        <i className="fas fa-chevron-right text-gray-400 text-[10px] md:text-xs"></i>
        <span className="text-gray-500 dark:text-gray-400">
          Edit Organization
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-green-600 dark:from-gray-200 dark:to-green-400 bg-clip-text text-transparent">
          Edit Organization
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Update organization information
        </p>
      </div>

      {loading && !initialized ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6"
        >
          {/* Organization Name */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Organization Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter organization name"
              required
            />
          </div>

          {/* Phone */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter phone number"
            />
          </div>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter email address"
            />
          </div>

          {/* Address */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter organization address"
            />
          </div>

          {/* Has Multiple Companies */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Has Multiple Companies?
            </label>
            <div className="flex gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="multi_company"
                  value="Yes"
                  checked={formData.multi_company === "Yes"}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 accent-green-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Yes</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="multi_company"
                  value="No"
                  checked={formData.multi_company === "No"}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 accent-green-500"
                />
                <span className="text-gray-700 dark:text-gray-300">No</span>
              </label>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Select whether this organization will have multiple companies
              under it
            </p>
          </div>

          {/* Organization Logo */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Organization Logo
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-green-500 transition-colors">
              <div className="space-y-1 text-center">
                {logoPreview ? (
                  <div className="mb-3">
                    <img
                      src={logoPreview}
                      alt="Preview"
                      className="mx-auto h-24 w-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      Remove Logo
                    </button>
                  </div>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="logo-upload"
                        className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="logo-upload"
                          name="logo"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/svg+xml"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PNG, JPG, GIF, SVG up to 2MB
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => navigate("/admin/organizations")}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {updating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Updating...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  Update Organization
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditOrganization;
