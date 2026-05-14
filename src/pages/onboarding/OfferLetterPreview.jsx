import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiFileText, FiDownload, FiChevronRight, FiChevronLeft, FiPrinter, FiSettings, FiEdit } from "react-icons/fi";
import { setStep, updateOfferLetter } from "../../store/slices/onboardingSlice";

const OfferLetterPreview = () => {
  const dispatch = useDispatch();

  // Use a more robust selector to prevent crashes
  const onboarding = useSelector((state) => state.onboarding);
  const employeeDetails = onboarding?.employeeDetails || {};
  const offerLetter = onboarding?.offerLetter || {};

  const [template, setTemplate] = useState(offerLetter.template || "standard");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateContent = (empName, pos, date) => {
    return `Date: ${new Date().toLocaleDateString('en-GB')}

To: ${empName || "[Candidate Name]"}
Position: ${pos || "[Job Title]"}

Subject: Offer of Employment

Dear ${empName || "Candidate"},

On behalf of the Company, we are pleased to offer you the position of ${pos || "[Job Title]"}. We believe your skills and experience will be a valuable asset to our team.

This offer is contingent upon the successful completion of our onboarding process. Your proposed joining date is ${date || "[Joining Date]"}.

Your compensation will be discussed in detail during the final interview stage. Please review the attached terms and conditions of employment.

We look forward to welcoming you to the team.

Sincerely,

Human Resources Department
UAE Operations`;
  };

  const [content, setContent] = useState("");

  useEffect(() => {
    const initialContent = offerLetter.content || generateContent(
      employeeDetails.fullName,
      employeeDetails.designation,
      employeeDetails.joiningDate
    );
    setContent(initialContent);
  }, [employeeDetails, offerLetter.content]);

  const handleNext = () => {
    dispatch(updateOfferLetter({ content, template, generated: true }));
    dispatch(setStep(4));
  };

  const handleBack = () => {
    dispatch(setStep(2));
  };

  const simulateDownload = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      alert("Offer Letter PDF generated successfully.");
    }, 1000);
  };

  if (!onboarding) return <div className="p-10 text-center">Loading Onboarding Data...</div>;

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      {/* Configuration Sidebar */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FiSettings className="text-primary-500" />
            Settings
          </h3>
          <div className="space-y-4">
            <label className="text-xs font-bold text-gray-400 uppercase">Template</label>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm"
            >
              <option value="standard">Standard UAE</option>
              <option value="modern">Modern</option>
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 p-6 text-center">
          <div className="grid grid-cols-2 gap-4">
            <button onClick={simulateDownload} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border hover:border-primary-500 transition-all flex flex-col items-center gap-2">
              <FiDownload size={20} className="text-gray-400" />
              <span className="text-[10px] font-bold">PDF</span>
            </button>
            <button className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border hover:border-primary-500 transition-all flex flex-col items-center gap-2">
              <FiPrinter size={20} className="text-gray-400" />
              <span className="text-[10px] font-bold">PRINT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Area */}
      <div className="lg:col-span-2">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-8 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FiFileText className="text-primary-500" />
              <span className="text-sm font-bold">Offer Letter Preview</span>
            </div>
          </div>

          <div className="p-6 md:p-10">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[500px] p-8 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg shadow-inner outline-none resize-none font-serif text-sm md:text-base leading-relaxed text-gray-800 dark:text-gray-200"
            />
          </div>

          <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex justify-between">
            <button onClick={handleBack} className="flex items-center gap-2 font-bold text-gray-500 hover:text-gray-900">
              <FiChevronLeft size={20} /> Back
            </button>
            <button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              Review <FiChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferLetterPreview;
