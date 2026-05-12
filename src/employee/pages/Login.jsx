import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setTheme } from "../store/slices/themeSlice";
import {
  FiSun,
  FiMoon,
  FiMail,
  FiLock,
  FiArrowRight,
  FiCheckCircle,
} from "react-icons/fi";
import { loginUser } from "../store/slices/authSlice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    const token = localStorage.getItem("employee-token");
    if (token) {
      navigate("/dashboard");
      return;
    }

    const remembered = localStorage.getItem("employee-remembered");
    if (remembered === "true") {
      const savedEmail = localStorage.getItem("employee-email");
      if (savedEmail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const remembered = localStorage.getItem("employee-remembered");
    if (remembered === "true") {
      const savedEmail = localStorage.getItem("employee-email");
      if (savedEmail) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  const showToast = (message, isSuccess = true) => {
    setToast({ message, isSuccess });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      showToast("Please enter your email address", false);
      return;
    }

    if (!password) {
      showToast("Please enter your password", false);
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(result)) {
        showToast("Login successful! Redirecting...", true);

        if (rememberMe) {
          localStorage.setItem("employee-remembered", "true");
          localStorage.setItem("employee-email", email);
        } else {
          localStorage.removeItem("employee-remembered");
          localStorage.removeItem("employee-email");
        }

        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        showToast(result.payload || "Login failed", false);
        setLoading(false);
      }
    } catch (error) {
      console.error("Login error:", error);
      showToast("An unexpected error occurred", false);
      setLoading(false);
    }
  };

  return (
    <div className="login-container flex w-full min-h-screen overflow-hidden">
      <div className="form-side flex-1 flex items-center justify-center bg-[var(--surface)] p-6 md:p-10 overflow-y-auto">
        <div className="theme-toggle-wrapper absolute top-6 left-6 z-10">
          <div className="theme-toggle flex bg-[var(--surface2)] border border-[var(--border)] rounded-full p-1 gap-1">
            <button
              onClick={() => dispatch(setTheme("light"))}
              className={`theme-btn w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                theme === "light"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <FiSun />
            </button>
            <button
              onClick={() => dispatch(setTheme("dark"))}
              className={`theme-btn w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                theme === "dark"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-[var(--text-secondary)]"
              }`}
            >
              <FiMoon />
            </button>
          </div>
        </div>

        <div className="login-card max-w-md w-full">
          <div className="login-header text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-3">
              Welcome Back
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Sign in to your employee account
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group mb-6">
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Company Email
              </label>
              <div className="input-wrapper relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-base" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full py-3.5 px-4 pl-12 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(46,204,113,0.12)] transition-all"
                />
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="block text-xs font-semibold text-[var(--text)] mb-2">
                Password
              </label>
              <div className="input-wrapper relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)] text-base" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full py-3.5 px-4 pl-12 bg-[var(--surface2)] border border-[var(--border)] rounded-lg text-sm text-[var(--text)] focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(46,204,113,0.12)] transition-all"
                />
              </div>
            </div>

            <div className="form-options flex justify-between items-center mb-7">
              <label className="checkbox-label flex items-center gap-2 cursor-pointer text-xs text-[var(--text-secondary)]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-green-500"
                />
                Remember me
              </label>
              <a
                href="#"
                className="forgot-link text-xs text-green-500 font-medium hover:text-green-600 hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="signin-btn w-full py-3.5 bg-green-500 border-none rounded-full text-white font-semibold cursor-pointer transition-all flex items-center justify-center gap-2.5 hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Authenticating...
                </>
              ) : (
                <>
                  <FiArrowRight /> Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="brand-side hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-green-500 relative items-center justify-center p-10 overflow-hidden">
        <div className="brand-content text-center text-white z-10 max-w-md">
          <div className="brand-icon mb-8 flex justify-center">
            <img
              src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
              alt="HMR Logo"
              className="w-16 h-16 object-contain rounded-xl bg-white p-2 shadow-lg hover:scale-105 transition-transform"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Employee Portal
          </h1>
          <p className="text-lg opacity-90">
            Access your attendance, leave requests, and personal information
            anytime, anywhere.
          </p>

          <div className="features-list mt-12 flex flex-col gap-5 text-left">
            {[
              { icon: "fingerprint", text: "Mark Attendance & Track Hours" },
              { icon: "calendar-alt", text: "Apply for Leaves & View Status" },
              { icon: "chart-line", text: "View Personal Analytics & Reports" },
              { icon: "user-circle", text: "Update Profile & Documents" },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="feature-item flex items-center gap-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm hover:bg-white/20 hover:translate-x-1 transition-all"
              >
                <i className={`fas fa-${feature.icon} text-2xl w-10`}></i>
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 bg-[var(--surface)] text-[var(--text)] py-3 px-5 rounded-full text-sm font-medium shadow-lg border-l-4 z-50 flex items-center gap-2 animate-slide-up ${
            toast.isSuccess ? "border-green-500" : "border-red-500"
          }`}
        >
          {toast.isSuccess ? (
            <FiCheckCircle className="text-green-500" />
          ) : (
            <FiCheckCircle className="text-red-500" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Login;
