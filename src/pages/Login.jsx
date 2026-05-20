import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearError, loginUser, setRememberMe } from "../store/slices/authSlice";
import { showToast } from "../components/common/Toast";

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

  // Redirect based on user type after successful login - immediate redirect
  useEffect(() => {
    if (isAuthenticated && userType) {
      const redirectPath = userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";
      // Navigate immediately without showing extra loader
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

    // Save remember me preference
    dispatch(setRememberMe(rememberMe));

    await dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-600 to-green-500 relative overflow-hidden items-center justify-center p-10">
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
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
                  className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
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
                  className="w-4 h-4 accent-green-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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