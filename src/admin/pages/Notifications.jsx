import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../store/slices/notificationSlice";
import Pagination from "../components/common/Paginations";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  const getNotificationUI = (notif) => {
    const title = (notif.title || notif.type || "Notification").toLowerCase();

    if (title.includes("probation") || title.includes("alert")) {
      return {
        type: "Probation Alert",
        alertType: notif.title || "Probation Contract Alert",
        typeColor: "text-[#7B61FF] dark:text-[#B8A7FF]",
        icon: "far fa-clock",
        iconColor: "text-[#F2994A] dark:text-[#FFB870]",
      };
    } else if (title.includes("document") || title.includes("expiry")) {
      return {
        type: "employee_document",
        alertType: notif.title || "Document Expiry",
        typeColor: "text-[#F2994A] dark:text-[#FFB870]",
        icon: "far fa-bell",
        iconColor: "text-[#F2994A] dark:text-[#FFB870]",
      };
    } else if (title.includes("leave")) {
      return {
        type: "leave_request",
        alertType: notif.title || "Leave Request",
        typeColor: "text-green-500 dark:text-green-400",
        icon: "far fa-calendar-alt",
        iconColor: "text-green-500 dark:text-green-400",
      };
    }

    return {
      type: "notification",
      alertType: notif.title || "Notification",
      typeColor: "text-gray-700 dark:text-gray-300",
      icon: "far fa-bell",
      iconColor: "text-gray-500 dark:text-gray-400",
    };
  };

  const filteredNotifications = (notifications || []).filter((n) => {
    if (activeTab === "unread" && n.read) return false;
    if (activeTab === "read" && !n.read) return false;
    if (
      searchQuery &&
      !(n.message || "").toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const totalFiltered = filteredNotifications.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / perPage));
  const start = (currentPage - 1) * perPage;
  const paginatedNotifications = filteredNotifications.slice(
    start,
    start + perPage,
  );

  const totalCount = (notifications || []).length;
  const readCount = (notifications || []).filter((n) => n.read).length;

  return (
    <div className="p-4 md:p-6 bg-[#F9FAFB] dark:bg-gray-900 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <i className="far fa-bell text-2xl text-gray-700 dark:text-gray-200"></i>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You have {unreadCount} unread notifications
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                unreadCount > 0 && dispatch(markAllNotificationsAsRead())
              }
              disabled={unreadCount === 0}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                unreadCount > 0
                  ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }`}
            >
              <i className="fas fa-check-circle"></i>
              Mark All as Read
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "all"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "unread"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setActiveTab("read")}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "read"
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Read ({readCount})
            </button>
          </div>

          <div className="relative w-full md:w-64">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"></i>
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>

        {/* Notification list */}
        <div className="flex flex-col gap-3">
          {paginatedNotifications.length === 0 ? (
            <div className="p-12 text-center text-gray-500 dark:text-gray-400">
              <i className="fas fa-bell-slash text-4xl mb-4 opacity-50"></i>
              <p>No notifications found</p>
            </div>
          ) : (
            paginatedNotifications.map((notification) => {
              const ui = getNotificationUI(notification);
              const isUnread = !notification.read;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start justify-between p-4 rounded-xl border transition-colors ${
                    isUnread
                      ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/20 dark:border-emerald-800/50"
                      : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center shadow-sm border border-gray-100 dark:border-gray-600">
                        <i className={`${ui.icon} ${ui.iconColor} text-sm`}></i>
                      </div>
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold mb-1 ${ui.typeColor}`}
                      >
                        {ui.alertType}
                      </div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                        {ui.type}
                      </h4>
                      <p
                        className={`text-sm mb-2 ${
                          isUnread
                            ? "text-gray-800 dark:text-gray-100"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {notification.time ||
                            notification.created_at ||
                            "Just now"}
                        </span>
                        {isUnread && (
                          <>
                            <span className="w-1 h-1 bg-green-500 dark:bg-green-400 rounded-full"></span>
                            <span className="text-xs text-green-500 dark:text-green-400 font-medium">
                              Unread
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      isUnread && dispatch(markNotificationAsRead(notification.id))
                    }
                    disabled={!isUnread}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      isUnread
                        ? "bg-green-500 text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 cursor-default"
                    }`}
                  >
                    <i
                      className={
                        isUnread ? "fas fa-check" : "fas fa-check-double"
                      }
                    ></i>
                    {isUnread ? "Mark as Read" : "Read"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {totalFiltered > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={totalFiltered}
          itemsPerPage={perPage}
        />
      )}
    </div>
  );
};

export default Notifications;