import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearError, loginUser, setRememberMe } from "../store/slices/authSlice";
import { showToast } from "../components/common/Toast";
import { useAppTheme } from "../context/ThemeContext"; // Import the theme hook

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, userType } = useSelector(
    (state) => state.auth
  );
  
  // Get the primary color from theme context
  const { primaryColor } = useAppTheme();

  // Helper function to adjust color brightness
  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color.startsWith('#')) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }
    
    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));
    
    return `#${Math.round(r).toString(16).padStart(2, '0')}${Math.round(g).toString(16).padStart(2, '0')}${Math.round(b).toString(16).padStart(2, '0')}`;
  };

  // eslint-disable-next-line no-unused-vars
  const lighterColor = adjustColor(primaryColor, 15);
  const darkerColor = adjustColor(primaryColor, -15);

  // Load remembered email if exists
  useEffect(() => {
    const remembered = localStorage.getItem("remember-me") === "true";
    const savedEmail = localStorage.getItem("remembered-email");
    if (remembered && savedEmail) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(savedEmail);
      setRememberMeState(true);
    }
  }, []);

  // Redirect based on user type after successful login
  useEffect(() => {
    if (isAuthenticated && userType) {
      const redirectPath = userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, userType, navigate]);

  // Show error toast if login fails
  useEffect(() => {
    if (error) {
      showToast(error, "error");
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    dispatch(setRememberMe(rememberMe));
    await dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding - Dynamic gradient based on theme */}
      <div 
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-10"
        style={{ 
          background: `linear-gradient(135deg, ${primaryColor}, ${darkerColor})`,
          transition: 'background 0.3s ease'
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white max-w-md">
          <div className="mb-8">
            <img
              src="https://violet-leopard-500489.hostingersite.com/hr/public/assets/images/hr-logo2.jpg"
              alt="Logo"
              className="w-20 h-20 object-contain rounded-lg bg-white p-2 mx-auto shadow-lg"
            />
          </div>
          <h1 className="text-4xl font-bold mb-4">Human Resource Management</h1>
          <p className="text-lg opacity-90 mb-10">
            Unified portal for administrators and employees. Seamlessly manage
            attendance, leaves, reports, and more in one place.
          </p>
          <div className="space-y-3 text-left">
            {[
              "Employee Directory & Profiles",
              "Smart Attendance Tracking",
              "Real-time Analytics & Reports",
              "Leave Management System",
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-3 rounded-xl"
              >
                <i className="fas fa-check-circle"></i>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please enter your credentials to sign in
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all"
                  placeholder="your@email.com"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMeState(e.target.checked)}
                  className="w-4 h-4 transition-all"
                  style={{ accentColor: primaryColor }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: primaryColor,
                '&:hover': { backgroundColor: adjustColor(primaryColor, -10) }
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = adjustColor(primaryColor, -10)}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = primaryColor}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-right-to-bracket"></i> Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;