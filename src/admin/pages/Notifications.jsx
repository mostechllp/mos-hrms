import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../store/slices/notificationSlice";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const getNotificationUI = (notif) => {
    const title = (notif.title || notif.type || "Notification").toLowerCase();
    
    if (title.includes("probation") || title.includes("alert")) {
      return {
        type: "Probation Alert",
        alertType: notif.title || "Probation Contract Alert",
        typeColor: "text-[#7B61FF]",
        icon: "far fa-clock",
        iconColor: "text-[#F2994A]",
      };
    } else if (title.includes("document") || title.includes("expiry")) {
      return {
        type: "employee_document",
        alertType: notif.title || "Document Expiry",
        typeColor: "text-[#F2994A]",
        icon: "far fa-bell",
        iconColor: "text-[#F2994A]",
      };
    } else if (title.includes("leave")) {
      return {
        type: "leave_request",
        alertType: notif.title || "Leave Request",
        typeColor: "text-[#20B256]",
        icon: "far fa-calendar-alt",
        iconColor: "text-[#20B256]",
      };
    }
    
    return {
      type: "notification",
      alertType: notif.title || "Notification",
      typeColor: "text-gray-700",
      icon: "far fa-bell",
      iconColor: "text-gray-500",
    };
  };

  const filteredNotifications = (notifications || []).filter((n) => {
    if (activeTab === "unread" && n.read) return false;
    if (activeTab === "read" && !n.read) return false;
    if (searchQuery && !(n.message || "").toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const totalCount = (notifications || []).length;
  const readCount = (notifications || []).filter(n => n.read).length;

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <i className="far fa-bell text-2xl text-gray-700"></i>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-sm text-gray-500 mt-1">You have {unreadCount} unread notifications</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => dispatch(markAllNotificationsAsRead())}
              className="flex items-center gap-2 px-4 py-2 bg-[#20B256] text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors"
            >
              <i className="fas fa-check-circle"></i>
              Mark All as Read
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 text-sm font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "all" ? "bg-[#20B256] text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "unread" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "read" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Read ({readCount})
            </button>
          </div>
          <div className="relative w-full md:w-64">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#20B256] focus:border-[#20B256]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <i className="fas fa-bell-slash text-4xl mb-4 opacity-50"></i>
              <p>No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const ui = getNotificationUI(notification);
              return (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-4 rounded-xl border ${
                    !notification.read ? "bg-[#EAF9EF] border-[#CDEEDB]" : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-gray-100">
                        <i className={`${ui.icon} ${ui.iconColor} text-sm`}></i>
                      </div>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold mb-1 ${ui.typeColor}`}>
                        {ui.alertType}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">{ui.type}</h4>
                      <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {notification.time || notification.created_at || "Just now"}
                        </span>
                        {!notification.read && (
                          <>
                            <span className="w-1 h-1 bg-[#20B256] rounded-full"></span>
                            <span className="text-xs text-[#20B256] font-medium">Unread</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => dispatch(markNotificationAsRead(notification.id))}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#20B256] text-white text-xs font-medium rounded-md hover:bg-green-600 transition-colors"
                  >
                    <i className="far fa-eye"></i>
                    View
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
