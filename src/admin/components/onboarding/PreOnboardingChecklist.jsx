import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronLeft, FiChevronRight, FiCheckSquare, FiSquare, FiList, FiCheckCircle } from "react-icons/fi";
import { setStep, updatePreOnboardingChecklist } from "../../store/slices/onboardingSlice";

const PreOnboardingChecklist = () => {
  const dispatch = useDispatch();
  const checklist = useSelector((state) => state.onboarding?.preOnboardingChecklist) || {};

  const handleNext = () => {
    dispatch(setStep(7));
  };

  const handleBack = () => {
    dispatch(setStep(5));
  };

  const toggleCheck = (section, field) => {
    dispatch(
      updatePreOnboardingChecklist({
        section,
        data: { [field]: !checklist[section]?.[field] },
      })
    );
  };

  const updateInput = (section, subSection, field, value) => {
    if (subSection) {
      dispatch(
        updatePreOnboardingChecklist({
          section,
          data: {
            [subSection]: {
              ...checklist[section]?.[subSection],
              [field]: value
            }
          },
        })
      );
    } else {
      dispatch(
        updatePreOnboardingChecklist({
          section,
          data: { [field]: value },
        })
      );
    }
  };

  const CheckboxItem = ({ label, checked, onChange }) => (
    <div 
      className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
      onClick={onChange}
    >
      <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${checked ? 'bg-green-500 text-white border-green-500' : 'border-2 border-gray-300 dark:border-gray-600'}`}>
        {checked && <FiCheckSquare size={16} />}
      </div>
      <span className={`text-sm font-medium ${checked ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <FiList size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Pre-Onboarding Checklist</h2>
            <p className="text-green-100 text-sm">Complete required setup before finalizing onboarding</p>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* HR & IT Tasks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <FiCheckCircle className="text-green-500" /> HR Tasks
              </h3>
              <div className="space-y-2">
                <CheckboxItem label="Employee information completed" checked={checklist.hrTasks?.infoCompleted} onChange={() => toggleCheck('hrTasks', 'infoCompleted')} />
                <CheckboxItem label="ID proof verified" checked={checklist.hrTasks?.idVerified} onChange={() => toggleCheck('hrTasks', 'idVerified')} />
                <CheckboxItem label="Academic certificate verified" checked={checklist.hrTasks?.academicVerified} onChange={() => toggleCheck('hrTasks', 'academicVerified')} />
                <CheckboxItem label="Employment reference verified" checked={checklist.hrTasks?.referenceVerified} onChange={() => toggleCheck('hrTasks', 'referenceVerified')} />
                <CheckboxItem label="All required documents verified" checked={checklist.hrTasks?.documentsVerified} onChange={() => toggleCheck('hrTasks', 'documentsVerified')} />
                <CheckboxItem label="Offer letter generated" checked={checklist.hrTasks?.offerGenerated} onChange={() => toggleCheck('hrTasks', 'offerGenerated')} />
                <CheckboxItem label="Offer letter sent" checked={checklist.hrTasks?.offerSent} onChange={() => toggleCheck('hrTasks', 'offerSent')} />
                <CheckboxItem label="Offer letter accepted" checked={checklist.hrTasks?.offerAccepted} onChange={() => toggleCheck('hrTasks', 'offerAccepted')} />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                <FiCheckCircle className="text-blue-500" /> IT Tasks
              </h3>
              <div className="space-y-2">
                <CheckboxItem label="Company email created" checked={checklist.itTasks?.emailCreated} onChange={() => toggleCheck('itTasks', 'emailCreated')} />
                <CheckboxItem label="HRMS account created" checked={checklist.itTasks?.hrmsCreated} onChange={() => toggleCheck('itTasks', 'hrmsCreated')} />
                <CheckboxItem label="Required system access created" checked={checklist.itTasks?.systemAccess} onChange={() => toggleCheck('itTasks', 'systemAccess')} />
                <CheckboxItem label="Required software configured" checked={checklist.itTasks?.softwareConfigured} onChange={() => toggleCheck('itTasks', 'softwareConfigured')} />
              </div>
            </div>
          </div>

          {/* Section 1: WhatsApp Groups */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              Section 1 — WhatsApp Groups
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Personal WhatsApp Group</h4>
                <CheckboxItem label="Employee Added?" checked={checklist.whatsappGroups?.personal?.added} onChange={() => updateInput('whatsappGroups', 'personal', 'added', !checklist.whatsappGroups?.personal?.added)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added Date</label>
                    <input type="date" value={checklist.whatsappGroups?.personal?.addedDate || ""} onChange={(e) => updateInput('whatsappGroups', 'personal', 'addedDate', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added By</label>
                    <input type="text" placeholder="Name" value={checklist.whatsappGroups?.personal?.addedBy || ""} onChange={(e) => updateInput('whatsappGroups', 'personal', 'addedBy', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
                <h4 className="font-bold text-gray-800 dark:text-gray-200">Whole Team WhatsApp Group</h4>
                <CheckboxItem label="Employee Added?" checked={checklist.whatsappGroups?.team?.added} onChange={() => updateInput('whatsappGroups', 'team', 'added', !checklist.whatsappGroups?.team?.added)} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added Date</label>
                    <input type="date" value={checklist.whatsappGroups?.team?.addedDate || ""} onChange={(e) => updateInput('whatsappGroups', 'team', 'addedDate', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Added By</label>
                    <input type="text" placeholder="Name" value={checklist.whatsappGroups?.team?.addedBy || ""} onChange={(e) => updateInput('whatsappGroups', 'team', 'addedBy', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Welcome Announcement */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              Section 2 — Welcome Announcement
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-200">Welcome Poster</h4>
              <CheckboxItem label="Announcement Published?" checked={checklist.welcomeAnnouncement?.published} onChange={() => toggleCheck('welcomeAnnouncement', 'published')} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Published Date</label>
                  <input type="date" value={checklist.welcomeAnnouncement?.publishedDate || ""} onChange={(e) => updateInput('welcomeAnnouncement', null, 'publishedDate', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Published By</label>
                  <input type="text" placeholder="Name" value={checklist.welcomeAnnouncement?.publishedBy || ""} onChange={(e) => updateInput('welcomeAnnouncement', null, 'publishedBy', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Google Meet Introduction */}
          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
              Section 3 — Google Meet Introduction
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Date</label>
                  <input type="date" value={checklist.googleMeet?.meetingDate || ""} onChange={(e) => updateInput('googleMeet', null, 'meetingDate', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Meeting Time</label>
                  <input type="time" value={checklist.googleMeet?.meetingTime || ""} onChange={(e) => updateInput('googleMeet', null, 'meetingTime', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Google Meet Link</label>
                  <input type="url" placeholder="https://meet.google.com/..." value={checklist.googleMeet?.meetLink || ""} onChange={(e) => updateInput('googleMeet', null, 'meetLink', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <CheckboxItem label="Calendar Invite Sent?" checked={checklist.googleMeet?.calendarInviteSent} onChange={() => toggleCheck('googleMeet', 'calendarInviteSent')} />
                <CheckboxItem label="Meeting Completed?" checked={checklist.googleMeet?.meetingCompleted} onChange={() => toggleCheck('googleMeet', 'meetingCompleted')} />
              </div>
              
              {checklist.googleMeet?.meetingCompleted && (
                <div className="mt-2 w-full md:w-1/3">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Completed Date</label>
                  <input type="date" value={checklist.googleMeet?.completedDate || ""} onChange={(e) => updateInput('googleMeet', null, 'completedDate', e.target.value)} className="w-full text-sm p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              )}
            </div>
          </div>

        </div>
        
        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FiChevronLeft /> Back
          </button>
          
          <button
            onClick={handleNext}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg"
          >
            Continue to Review <FiChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreOnboardingChecklist;
