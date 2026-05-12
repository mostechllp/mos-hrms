import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";
import Sidebar from "../common/Sidebar";
import Header from "../common/Header";
import TaskWidget from "../widgets/TaskWidget";
import NotesWidget from "../widgets/NotesWidget";

const Layout = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="app flex min-h-screen">
      <div
        className={`overlay ${sidebarOpen ? "show" : ""}`}
        onClick={toggleSidebar}
      />

      <div id="sidebar">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="main">
        <Header onMenuClick={toggleSidebar} />
        <div className="content-section py-7 px-4 md:px-7">
          <Outlet />
        </div>
      </div>
      <TaskWidget/>
      <NotesWidget/>
    </div>
  );
};

export default Layout;
