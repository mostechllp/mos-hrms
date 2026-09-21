// src/admin/pages/offboarding/LettersAndClearance.jsx

import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  Check,
  Download,
  Loader,
  X,
  Upload,
  File,
  Sparkles,
} from "lucide-react";
import { showToast } from "../common/Toast";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import OffboardingHeader from "./OffboardingHeader";
import {
  fetchOffboardingById,
  fetchOffboardingProgress,
} from "../../store/slices/offboardingSlice";
import { fetchEmployeeById } from "../../store/slices/employeeSlice";
import apiClient, { getStorageUrl } from "../../../utils/apiClient";

// ------------------------------------------------------------
// Backend-accepted letter types (mirrors API validation)
// ------------------------------------------------------------
const LETTER_TYPES = {
  RELIEVING: "relieving_letter",
  EXPERIENCE: "experience_letter",
  RESIGNATION_ACCEPTANCE: "resignation_acceptance",
  FINAL_SETTLEMENT: "final_settlement", // ← backend expects final_settlement
};

const LettersAndClearance = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const offboardingId = location.state?.id || searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [employeeName, setEmployeeName] = useState("");
  const [uploading, setUploading] = useState({});
  const [generatingLetter, setGeneratingLetter] = useState(null);
  const [lettersIssued, setLettersIssued] = useState(false);

  const { currentOffboarding, loading: offboardingLoading } = useSelector(
    (state) => state.offboarding,
  );
  const { currentEmployee } = useSelector((state) => state.employees);

  // ------------------------------------------------------------
  // Letters (matches backend letter_type enum exactly)
  // ------------------------------------------------------------
  const [lettersToGenerate, setLettersToGenerate] = useState([
    {
      id: "relieving_letter",
      title: "Relieving Letter",
      description: "Official confirmation of employment end date and role",
      type: LETTER_TYPES.RELIEVING,
      required: true,
      generated: false,
      file_path: null,
    },
    {
      id: "experience_letter",
      title: "Experience Certificate",
      description:
        "Detailed record of employment period, role, and responsibilities",
      type: LETTER_TYPES.EXPERIENCE,
      required: true,
      generated: false,
      file_path: null,
    },
    {
      id: "resignation_acceptance",
      title: "Resignation Acceptance",
      description:
        "Formal acknowledgment and acceptance of the employee's resignation",
      type: LETTER_TYPES.RESIGNATION_ACCEPTANCE,
      required: true,
      generated: false,
      file_path: null,
    },
    {
      id: "final_settlement",
      title: "Full and Final Settlement",
      description: "Statement of final dues, deductions, and settlement amount",
      type: LETTER_TYPES.FINAL_SETTLEMENT, // ← matches backend
      required: true,
      generated: false,
      file_path: null,
    },
  ]);

  // ------------------------------------------------------------
  // Optional proof uploads (letter_type must match API values)
  // ------------------------------------------------------------
  const [uploadDocuments, setUploadDocuments] = useState([
    {
      id: "signed_resignation_acceptance",
      title: "Signed Resignation Acceptance",
      document_type: LETTER_TYPES.RESIGNATION_ACCEPTANCE,
      status: "Pending",
      file: null,
      file_name: "",
      uploaded_at: null,
      required: false,
    },
    {
      id: "signed_final_settlement",
      title: "Signed Full and Final Settlement",
      document_type: LETTER_TYPES.FINAL_SETTLEMENT,
      status: "Pending",
      file: null,
      file_name: "",
      uploaded_at: null,
      required: false,
    },
  ]);

  // ------------------------------------------------------------
  // Bootstrap
  // ------------------------------------------------------------
  useEffect(() => {
    if (offboardingId) {
      dispatch(fetchOffboardingById(offboardingId));
      dispatch(fetchOffboardingProgress(offboardingId));
    } else {
      const stored = localStorage.getItem("offboarding_id");
      if (stored) {
        dispatch(fetchOffboardingById(stored));
        dispatch(fetchOffboardingProgress(stored));
      } else {
        setLoading(false);
        showToast(
          "No offboarding session found. Please start from initiation.",
          "warning",
        );
      }
    }
  }, [dispatch, offboardingId]);

  // ------------------------------------------------------------
  // Hydrate from server
  // ------------------------------------------------------------
  useEffect(() => {
    if (!offboardingLoading) {
      if (currentOffboarding) {
        if (currentOffboarding.employee_name) {
          setEmployeeName(currentOffboarding.employee_name);
        } else if (currentOffboarding.employee_id) {
          dispatch(fetchEmployeeById(currentOffboarding.employee_id));
        }

        const apiLetters =
          currentOffboarding.letters ||
          currentOffboarding.generated_letters ||
          currentOffboarding.offboarding_letters ||
          [];

        if (Array.isArray(apiLetters) && apiLetters.length > 0) {
          setLettersToGenerate((prev) =>
            prev.map((l) => {
              const apiLetter = apiLetters.find(
                (al) =>
                  al.letter_type === l.type ||
                  al.type === l.type ||
                  al.letter_type === l.id,
              );
              if (
                apiLetter &&
                (apiLetter.status === "generated" ||
                  apiLetter.status === "success" ||
                  apiLetter.document_path ||
                  apiLetter.document_url ||
                  apiLetter.file_path)
              ) {
                return {
                  ...l,
                  generated: true,
                  file_path:
                    apiLetter.document_url ||
                    apiLetter.document_path ||
                    apiLetter.file_path ||
                    apiLetter.url,
                };
              }
              return l;
            }),
          );
        }

        const apiDocs =
          currentOffboarding.uploaded_documents ||
          currentOffboarding.documents ||
          currentOffboarding.proof_documents ||
          apiLetters;

        if (Array.isArray(apiDocs) && apiDocs.length > 0) {
          setUploadDocuments((prev) =>
            prev.map((d) => {
              const apiDoc = apiDocs.find(
                (ad) =>
                  ad.document_type === d.document_type ||
                  ad.letter_type === d.document_type,
              );
              const apiStatus = String(apiDoc.status || "").toLowerCase();
              if (
                apiDoc &&
                (apiStatus === "uploaded" ||
                  apiDoc.document_path ||
                  apiDoc.document_url)
              ) {
                return {
                  ...d,
                  status: "Uploaded", // normalize to the shape the UI expects
                  file_name:
                    apiDoc.file_name ||
                    apiDoc.document_path?.split("/").pop() ||
                    "Uploaded Document",
                  file_path: apiDoc.document_url || apiDoc.document_path,
                  uploaded_at:
                    apiDoc.uploaded_at ||
                    apiDoc.updated_at ||
                    apiDoc.created_at,
                };
              }
              return d;
            }),
          );
        }
      }
      setLoading(false);
    }
  }, [currentOffboarding, offboardingLoading, dispatch]);

  useEffect(() => {
    if (currentEmployee) {
      setEmployeeName(
        `${currentEmployee.first_name} ${currentEmployee.last_name}`,
      );
    }
  }, [currentEmployee]);

  const pendingUploads = uploadDocuments.filter(
    (doc) => String(doc.status).toLowerCase() !== "uploaded",
  ).length;
  const allLettersGenerated = lettersToGenerate.every((l) => l.generated);

  // ------------------------------------------------------------
  // Response path extraction
  // ------------------------------------------------------------
  const extractPathFromResponse = (resData, type) => {
    if (!resData) return null;
    if (resData.files && resData.files[type]) return resData.files[type];

    if (resData.data) {
      if (typeof resData.data[type] === "string") return resData.data[type];
      if (resData.data.files && typeof resData.data.files[type] === "string")
        return resData.data.files[type];

      if (Array.isArray(resData.data)) {
        const letterObj = resData.data.find(
          (l) => l.type === type || l.letter_type === type,
        );
        if (letterObj?.file_path) return letterObj.file_path;
        if (letterObj?.document_url) return letterObj.document_url;
        if (letterObj?.document_path) return letterObj.document_path;
        if (letterObj?.url) return letterObj.url;
      }

      if (typeof resData.data === "object" && !Array.isArray(resData.data)) {
        if (resData.data.file_path) return resData.data.file_path;
        if (resData.data.document_url) return resData.data.document_url;
        if (resData.data.document_path) return resData.data.document_path;
        if (resData.data.url) return resData.data.url;
      }
    }
    return null;
  };

  // ------------------------------------------------------------
  // Generate a single letter
  // POST /admin/offboarding/{id}/letters
  // Body: { letter_type, status? }
  // ------------------------------------------------------------
  const handleGenerateLetter = async (letter) => {
    setGeneratingLetter(letter.id);

    try {
      const actualOffboardingId =
        offboardingId || localStorage.getItem("offboarding_id");

      const payload = {
        letter_type: letter.type,
        status: "generated",
      };

      const response = await apiClient.post(
        `/admin/offboarding/${actualOffboardingId}/letters`,
        payload,
      );

      if (
        response.data?.status === "success" ||
        response.data?.success === true ||
        response.status === 200
      ) {
        setLettersToGenerate((prev) =>
          prev.map((l) =>
            l.id === letter.id
              ? {
                  ...l,
                  generated: true,
                  file_path:
                    extractPathFromResponse(response.data, letter.type) ||
                    response.data.document_url ||
                    response.data.document_path ||
                    response.data.file_path ||
                    response.data.url ||
                    response.data.data?.file_path ||
                    response.data.data?.url,
                }
              : l,
          ),
        );
        showToast(`${letter.title} generated successfully`, "success");
      } else {
        showToast(
          response.data?.message || "Failed to generate letter",
          "error",
        );
      }
    } catch (error) {
      console.error("Generate letter error:", error);
      showToast(
        error.response?.data?.message || "Failed to generate letter",
        "error",
      );
    } finally {
      setGeneratingLetter(null);
    }
  };

  // ------------------------------------------------------------
  // Generate all letters sequentially
  // POST /admin/offboarding/{id}/letters (once per pending letter)
  // ------------------------------------------------------------
  const handleGenerateAllLetters = async () => {
    setIsGenerating(true);

    try {
      const actualOffboardingId =
        offboardingId || localStorage.getItem("offboarding_id");

      const updatedLetters = [...lettersToGenerate];
      let successCount = 0;

      for (let i = 0; i < updatedLetters.length; i++) {
        const letter = updatedLetters[i];
        if (letter.generated) continue;

        const payload = {
          letter_type: letter.type,
          status: "generated",
        };

        try {
          const response = await apiClient.post(
            `/admin/offboarding/${actualOffboardingId}/letters`,
            payload,
          );
          if (
            response.data?.status === "success" ||
            response.data?.success === true
          ) {
            updatedLetters[i] = {
              ...letter,
              generated: true,
              file_path:
                extractPathFromResponse(response.data, letter.type) ||
                response.data.document_url ||
                response.data.document_path ||
                response.data.file_path ||
                response.data.url,
            };
            successCount++;
          }
        } catch (e) {
          console.error(`Failed to generate ${letter.title}:`, e);
        }
      }

      setLettersToGenerate(updatedLetters);
      if (successCount > 0) {
        showToast(`Successfully generated ${successCount} letters`, "success");
      } else {
        showToast("No new letters were generated", "info");
      }
    } catch (error) {
      console.error("Generate all letters error:", error);
      showToast(
        error.response?.data?.message || "Failed to generate letters",
        "error",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // ------------------------------------------------------------
  // Download letter
  // ------------------------------------------------------------
  const handleDownloadLetter = async (letter) => {
    if (!letter.file_path) {
      showToast("No file available for download", "info");
      return;
    }

    try {
      const fileUrl = getStorageUrl(letter.file_path);
      const response = await fetch(fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;

      const fileNameMatch = fileUrl.match(/\/([^\/?#]+)[^\/]*$/);
      const fileName = fileNameMatch
        ? fileNameMatch[1]
        : `${letter.title.replace(/\s+/g, "_")}.pdf`;

      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to new tab:", error);
      window.open(getStorageUrl(letter.file_path), "_blank");
    }
  };

  // ------------------------------------------------------------
  // Upload a proof document
  // POST /admin/offboarding/{id}/letters/upload
  // Body (multipart): letter_type, file
  // ------------------------------------------------------------
  const handleFileUpload = async (docId, file) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showToast("File size should be less than 10MB", "error");
      return;
    }

    // Matches API: pdf,docx,jpg,jpeg,png
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
    ];
    if (!allowedTypes.includes(file.type)) {
      showToast("Only PDF, DOCX, JPEG, PNG files are allowed", "error");
      return;
    }

    setUploading((prev) => ({ ...prev, [docId]: true }));

    try {
      const actualOffboardingId =
        offboardingId || localStorage.getItem("offboarding_id");
      const doc = uploadDocuments.find((d) => d.id === docId);

      const formData = new FormData();
      formData.append("letter_type", doc?.document_type || "custom");
      formData.append("file", file);
      formData.append("offboarding_id", actualOffboardingId);

      const response = await apiClient.post(
        `/admin/offboarding/${actualOffboardingId}/letters/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      if (
        response.data?.status === "success" ||
        response.data?.success === true
      ) {
        const uploaded = response.data.data || response.data;
        setUploadDocuments((prev) =>
          prev.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  file_name: file.name,
                  // API uses `document_url` for the full URL and
                  // `document_path` for the relative storage path.
                  file_path: uploaded.document_url || uploaded.document_path,
                  status: "Uploaded",
                  uploaded_at: uploaded.updated_at || new Date().toISOString(),
                }
              : d,
          ),
        );
        showToast("Document uploaded successfully", "success");
      } else {
        showToast(response.data?.message || "Upload failed", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        error.response?.data?.message || "Failed to upload document",
        "error",
      );
    } finally {
      setUploading((prev) => ({ ...prev, [docId]: false }));
    }
  };

 const handleDownloadUploadedDoc = (doc) => {
  if (doc.file_path) {
    window.open(
      doc.file_path.startsWith("http")
        ? doc.file_path
        : getStorageUrl(doc.file_path),
      "_blank",
    );
  } else {
    showToast("No file available for download", "info");
  }
};

  // ------------------------------------------------------------
  // Complete the letters step, then complete offboarding
  // POST /admin/offboarding/{id}/letters/complete
  // POST /admin/offboarding/{id}/complete
  // ------------------------------------------------------------
  const handleSubmitAll = async () => {
    if (!lettersIssued) {
      showToast(
        "Please confirm that letters are issued to the employee",
        "warning",
      );
      return;
    }

    const missingRequiredLetters = lettersToGenerate.filter(
      (l) => l.required && !l.generated,
    );
    if (missingRequiredLetters.length > 0) {
      showToast(
        "Please generate all required letters before completing.",
        "error",
      );
      return;
    }

    setIsCompleting(true);

    try {
      const idToUse = offboardingId || localStorage.getItem("offboarding_id");

      // ─────────────────────────────────────────────
      // 1) Mark letters step complete
      // ─────────────────────────────────────────────
      await apiClient.post(`/admin/offboarding/${idToUse}/letters/complete`);

      // ─────────────────────────────────────────────
      // 2) Refresh progress so letters step is "done"
      // ─────────────────────────────────────────────
      await dispatch(fetchOffboardingProgress(idToUse)).unwrap();

      // ─────────────────────────────────────────────
      // 3) Mark the whole offboarding complete
      // ─────────────────────────────────────────────
      await apiClient.post(`/admin/offboarding/${idToUse}/complete`);

      // ─────────────────────────────────────────────
      // 4) Refresh progress one more time (final state)
      // ─────────────────────────────────────────────
      await dispatch(fetchOffboardingProgress(idToUse)).unwrap();

      showToast("Offboarding completed successfully!", "success");

      setTimeout(() => {
        navigate("/admin/employees/offboarding");
      }, 1500);
    } catch (error) {
      console.error("Complete offboarding error:", error);

      // Try to figure out which step failed so we can give a clearer message
      const endpoint = error.config?.url || "";
      let msg = error.response?.data?.message || error.message;

      if (!msg) {
        if (endpoint.includes("/letters/complete")) {
          msg = "Failed to mark letters step as complete. Please try again.";
        } else if (endpoint.includes("/complete")) {
          msg = "Failed to complete offboarding. Please try again.";
        } else {
          msg = "Failed to complete offboarding. Please try again.";
        }
      }

      showToast(msg, "error");
    } finally {
      setIsCompleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // ------------------------------------------------------------
  // Loading
  // ------------------------------------------------------------
  if (loading || offboardingLoading) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <OffboardingHeader currentStep={6} />
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 dark:text-gray-400">
                Loading documents...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-900/40 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <OffboardingHeader currentStep={6} />

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 rounded-2xl shadow-soft p-6 sm:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Letters & Clearance
              </h1>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-1 uppercase">
                {employeeName || "Employee"}
              </p>
              {currentOffboarding && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Offboarding ID: {currentOffboarding.id}
                </p>
              )}
            </div>
            {pendingUploads > 0 && (
              <span className="px-3 py-1.5 bg-yellow-50 dark:bg-yellow-900/20 text-orange-500 dark:text-orange-400 border border-yellow-200 dark:border-yellow-700/50 rounded-md text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                {pendingUploads} PENDING (OPTIONAL)
              </span>
            )}
          </div>

          {/* =================================================
              SECTION 1 — Generate Letters
              ================================================= */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-green-500" size={24} />
                  Generate Letters
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Generate official offboarding letters and certificates
                </p>
              </div>
              <button
                onClick={handleGenerateAllLetters}
                disabled={isGenerating || allLettersGenerated}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                  allLettersGenerated
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-[#22c55e] text-gray-900 hover:bg-[#16a34a]"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : allLettersGenerated ? (
                  <>
                    <CheckCircle size={16} />
                    All Generated
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate All
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {lettersToGenerate.map((letter) => (
                <div
                  key={letter.id}
                  className={`border rounded-2xl p-5 transition-all shadow-sm ${
                    letter.generated
                      ? "border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#1e293b] dark:text-white">
                        {letter.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {letter.description}
                      </p>
                      {letter.required && (
                        <span className="inline-block mt-1 text-[13px] font-medium text-red-500">
                          Required
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {letter.generated && (
                        <button
                          onClick={() => handleDownloadLetter(letter)}
                          className="p-2.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors"
                          title="Download"
                        >
                          <Download size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleGenerateLetter(letter)}
                        disabled={
                          generatingLetter === letter.id || letter.generated
                        }
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                          letter.generated
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default shadow-none"
                            : "bg-[#3b82f6] text-white hover:bg-[#2563eb] shadow-sm"
                        }`}
                      >
                        {generatingLetter === letter.id ? (
                          <>
                            <Loader size={16} className="animate-spin" />
                            Generating...
                          </>
                        ) : letter.generated ? (
                          <>
                            <CheckCircle size={16} />
                            Generated
                          </>
                        ) : (
                          <>
                            <File size={16} />
                            Generate
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              SECTION 2 — Optional uploads
              ================================================= */}
          <div className="mb-8">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Upload className="text-green-500" size={20} />
                Upload Proof Documents
                <span className="ml-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  Optional
                </span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload signed copies and acknowledgment receipts (not required
                to complete)
              </p>
            </div>

            <div className="space-y-3">
              {uploadDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800 dark:text-white">
                        {doc.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        Upload signed copy as PDF, DOCX, or image
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label
                        className={`cursor-pointer ${
                          uploading[doc.id]
                            ? "opacity-50 pointer-events-none"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all">
                          {uploading[doc.id] ? (
                            <Loader
                              size={16}
                              className="animate-spin text-green-500"
                            />
                          ) : (
                            <Upload size={16} className="text-gray-500" />
                          )}
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {doc.file_name ? "Change" : "Upload"}
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.docx,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(doc.id, e.target.files[0]);
                            }
                          }}
                          disabled={uploading[doc.id]}
                        />
                      </label>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                          doc.status === "Uploaded"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {doc.status === "Uploaded" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : uploading[doc.id] ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                      </span>

                      {doc.status === "Uploaded" && doc.file_path && (
                        <button
                          onClick={() => handleDownloadUploadedDoc(doc)}
                          className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                          title="Download document"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {doc.file_name && (
                    <div className="mt-2 pl-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {doc.file_name}
                      </p>
                      {doc.uploaded_at && (
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                          Uploaded: {formatDate(doc.uploaded_at)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* =================================================
              Progress
              ================================================= */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Letters Generated
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {lettersToGenerate.filter((l) => l.generated).length}/
                    {lettersToGenerate.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${
                        (lettersToGenerate.filter((l) => l.generated).length /
                          lettersToGenerate.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-gray-500 dark:text-gray-400">
                    Documents Uploaded{" "}
                    <span className="text-gray-400 normal-case font-normal">
                      (optional)
                    </span>
                  </span>
                  <span className="text-green-600 dark:text-green-400">
                    {
                      uploadDocuments.filter((d) => d.status === "Uploaded")
                        .length
                    }
                    /{uploadDocuments.length}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{
                      width: `${
                        (uploadDocuments.filter((d) => d.status === "Uploaded")
                          .length /
                          uploadDocuments.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {!allLettersGenerated
                ? "Generate all required letters to continue"
                : pendingUploads === 0
                  ? "All letters generated. Ready to complete offboarding!"
                  : `${pendingUploads} document(s) not uploaded (optional). You can still complete.`}
            </p>
          </div>

          {/* Issue Letters Checklist */}
          <div className="mb-6">
            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <input
                type="checkbox"
                checked={lettersIssued}
                onChange={(e) => setLettersIssued(e.target.checked)}
                className="w-5 h-5 text-green-500 rounded border-gray-300 focus:ring-green-500 dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Experience Letter and Relieving Letter are issued to the
                employee. <span className="text-red-500">*</span>
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={() => navigate("/admin/employees/offboarding")}
              className="px-6 py-2.5 rounded-full font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleSubmitAll}
              disabled={isCompleting || !lettersIssued || !allLettersGenerated}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${
                lettersIssued && allLettersGenerated
                  ? "bg-green-500 text-white hover:bg-green-600 shadow-sm hover:shadow-md"
                  : "bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              {isCompleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Completing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Complete Offboarding
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LettersAndClearance;
