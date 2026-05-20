import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import illustration from "../assets/images/404-illustration.png";

const NotFound = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dashboardRoute = user?.type === "employee" ? "/employee/dashboard" : "/admin/dashboard";
  const homeRoute = isAuthenticated ? dashboardRoute : "/login";

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
          <Link
            to={homeRoute}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 24px",
              background: "#4caf50",
              color: "#fff",
              borderRadius: "999px",
              fontWeight: "600",
              fontSize: "0.875rem",
              textDecoration: "none",
              boxShadow: "0 2px 10px rgba(76,175,80,0.25)",
              transition: "background 0.18s, transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#43a047";
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 4px 14px rgba(76,175,80,0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#4caf50";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 10px rgba(76,175,80,0.25)";
            }}
          >
            Back to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
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