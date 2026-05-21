import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import illustration from "../assets/images/404-illustration.png";

const NotFound = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [, setHomeRoute] = useState("/login");

  // Update homeRoute whenever auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      const dashboardRoute = user?.type === "employee" ? "/employee/dashboard" : "/admin/dashboard";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHomeRoute(dashboardRoute);
    } else {
      setHomeRoute("/login");
    }
  }, [isAuthenticated, user]);

  const handleBackToDashboard = () => {
    // Use the current state to determine where to go
    if (isAuthenticated) {
      const dashboardRoute = user?.type === "employee" ? "/employee/dashboard" : "/admin/dashboard";
      navigate(dashboardRoute, { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Illustration */}
      <img
        src={illustration}
        alt="404 - Page not found illustration"
        style={{
          width: "100%",
          maxWidth: "600px",
          marginBottom: "1rem",
          userSelect: "none",
          pointerEvents: "none",
        }}
        draggable={false}
      />

      {/* Text */}
      <div style={{ textAlign: "center", maxWidth: "420px" }}>
        <h2
          style={{
            fontSize: "clamp(1.4rem, 4vw, 1.9rem)",
            fontWeight: "700",
            color: "#37474f",
            marginBottom: "0.6rem",
            letterSpacing: "-0.02em",
          }}
        >
          Page Not Found
        </h2>
        <p
          style={{
            color: "#78909c",
            fontSize: "0.95rem",
            lineHeight: "1.65",
            marginBottom: "1.75rem",
          }}
        >
          The page you're looking for doesn't exist or has been moved to another URL.
        </p>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >

          <button
            onClick={() => {
              // Check if there's history to go back to
              if (window.history.length > 1) {
                window.history.back();
              } else {
                // If no history, go to home route
                handleBackToDashboard();
              }
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              background: "transparent",
              color: "#607d8b",
              border: "1.5px solid #cfd8dc",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "0.875rem",
              cursor: "pointer",
              transition: "background 0.18s, transform 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#eceff1";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ← Go Back
          </button>
        </div>

        <p style={{ marginTop: "1.5rem", fontSize: "0.73rem", color: "#b0bec5" }}>
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
};

export default NotFound;