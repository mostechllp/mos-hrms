// src/pages/Login.js

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  clearError,
  loginUser,
  setRememberMe,
  requestPasswordReset, // ADDED
  resetPassword, // ADDED
} from "../store/slices/authSlice";
import { showToast } from "../components/common/Toast";
import { useAppTheme } from "../context/ThemeContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMeState] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // ===== ADDED: Forgot password state =====
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // ===== END ADDED =====

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated, userType } = useSelector(
    (state) => state.auth,
  );

  const { primaryColor } = useAppTheme();

  const adjustColor = (color, percent) => {
    let r, g, b;
    if (color.startsWith("#")) {
      r = parseInt(color.slice(1, 3), 16);
      g = parseInt(color.slice(3, 5), 16);
      b = parseInt(color.slice(5, 7), 16);
    } else {
      return color;
    }

    r = Math.max(0, Math.min(255, r + (r * percent) / 100));
    g = Math.max(0, Math.min(255, g + (g * percent) / 100));
    b = Math.max(0, Math.min(255, b + (b * percent) / 100));

    return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
  };

  const darkerColor = adjustColor(primaryColor, -15);

  // Load remembered email if exists
  useEffect(() => {
    const remembered = localStorage.getItem("remember-me") === "true";
    const savedEmail = localStorage.getItem("remembered-email");
    if (remembered && savedEmail) {
      setEmail(savedEmail);
      setRememberMeState(true);
    }
  }, []);

  // Redirect based on user type after successful login
  useEffect(() => {
    if (isAuthenticated && userType) {
      const redirectPath =
        userType === "admin" ? "/admin/dashboard" : "/employee/dashboard";
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

    if (!agreeToTerms) {
      showToast(
        "Please agree to the Privacy Policy and Terms & Conditions",
        "error",
      );
      return;
    }

    dispatch(setRememberMe(rememberMe));
    await dispatch(loginUser({ email, password, agreeToTerms }));
  };

  // ===== ADDED: Forgot password handlers =====
  const handleForgotPassword = () => {
    setResetEmail(email || "");
    setResetStep(1);
    setCodeSent(false);
    setResetCode("");
    setNewPassword("");
    setShowForgotPassword(true);
  };

  const handleRequestCode = async () => {
    if (!resetEmail) {
      showToast("Please enter your email address", "error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    setIsRequestingCode(true);
    try {
      const result = await dispatch(
        requestPasswordReset({ email: resetEmail }),
      ).unwrap();
      showToast(result.message || "Reset code sent to your email!", "success");
      setCodeSent(true);
      setResetStep(2);
    } catch (error) {
      showToast(
        error || "Failed to send reset code. Please try again.",
        "error",
      );
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetCode) {
      showToast("Please enter the reset code", "error");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    setIsResetting(true);
    try {
      const result = await dispatch(
        resetPassword({
          email: resetEmail, // ADDED
          code: resetCode,
          password: newPassword,
          passwordConfirmation: confirmPassword, // ADDED
        }),
      ).unwrap();

      showToast(result.message || "Password reset successfully!", "success");
      setShowForgotPassword(false);
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword(""); // ADDED
      setResetStep(1);
      setCodeSent(false);
    } catch (error) {
      showToast(
        error || "Failed to reset password. Please try again.",
        "error",
      );
    } finally {
      setIsResetting(false);
    }
  };

  // Close forgot password modal on Escape key
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape" && showForgotPassword) {
        setShowForgotPassword(false);
        setResetStep(1);
        setCodeSent(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [showForgotPassword]);
  // ===== END ADDED =====

  // Privacy Policy Content
  const PrivacyPolicyContent = () => (
    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
        Privacy Policy
      </h3>
      <p>
        <strong>Last Updated:</strong> January 2026
      </p>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          1. Information We Collect
        </h4>
        <p>
          We collect information you provide directly, such as your name, email
          address, phone number, and location data for attendance tracking
          purposes.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          2. Location Data
        </h4>
        <p>
          When you use our attendance punching feature, we collect your location
          data to verify your presence at the workplace. This includes:
        </p>
        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
          <li>GPS coordinates of your device</li>
          <li>IP address</li>
          <li>Device information</li>
          <li>Timestamp of your punch-in/punch-out</li>
        </ul>
        <p className="mt-2">
          Location data is only collected when you actively punch in or out for
          attendance.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          3. How We Use Your Information
        </h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Track attendance and work hours</li>
          <li>Generate reports for management</li>
          <li>Ensure workplace safety compliance</li>
          <li>Improve our HR management services</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          4. Data Security
        </h4>
        <p>
          We implement appropriate technical and organizational measures to
          protect your personal data against unauthorized access, alteration,
          disclosure, or destruction.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          5. Your Rights
        </h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>Access your personal data</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data</li>
          <li>Withdraw consent at any time</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          6. Contact Us
        </h4>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-1">Email: privacy@mostech.com</p>
        <p>Phone: +971 000000000</p>
      </div>
    </div>
  );

  // Terms & Conditions Content
  const TermsContent = () => (
    <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
        Terms & Conditions
      </h3>
      <p>
        <strong>Last Updated:</strong> January 2026
      </p>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          1. Acceptance of Terms
        </h4>
        <p>
          By accessing and using this HR Management System, you agree to comply
          with and be bound by these Terms & Conditions.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          2. User Accounts
        </h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials
          </li>
          <li>
            You must notify us immediately of any unauthorized use of your
            account
          </li>
          <li>
            You are responsible for all activities that occur under your account
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          3. Attendance Tracking
        </h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>
            Location data is required for attendance verification purposes
          </li>
          <li>False attendance reporting is strictly prohibited</li>
          <li>
            Attendance records are maintained for compliance and payroll
            processing
          </li>
          <li>
            You must have location services enabled for accurate
            punch-in/punch-out
          </li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          4. Acceptable Use
        </h4>
        <ul className="list-disc list-inside ml-4 space-y-1">
          <li>
            Use the system only for legitimate HR and administrative purposes
          </li>
          <li>Do not attempt to circumvent security measures</li>
          <li>
            Do not use the system for any unlawful or prohibited activities
          </li>
          <li>Do not share your account credentials with others</li>
        </ul>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          5. Data Privacy
        </h4>
        <p>
          Your use of this system is also governed by our Privacy Policy. We
          collect and process your personal data in accordance with applicable
          data protection laws.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          6. Termination
        </h4>
        <p>
          We reserve the right to suspend or terminate your account if you
          violate these Terms & Conditions or engage in any fraudulent or
          malicious activities.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          7. Changes to Terms
        </h4>
        <p>
          We may update these Terms & Conditions from time to time. Continued
          use of the system constitutes acceptance of the updated terms.
        </p>
      </div>

      <div>
        <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
          8. Contact
        </h4>
        <p>
          If you have any questions about these Terms & Conditions, please
          contact us at:
        </p>
        <p className="mt-1">Email: support@mostech.com</p>
        <p>Phone: +971 0000000000</p>
      </div>
    </div>
  );

  // Modal Component
  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <i className="fas fa-times text-gray-500 text-lg"></i>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding with Footer inside */}
      <div
        className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-10 flex-col"
        style={{
          background: `linear-gradient(135deg, ${primaryColor}, ${darkerColor})`,
          transition: "background 0.3s ease",
        }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-center text-white max-w-md flex-1 flex flex-col items-center justify-center">
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
          <div className="space-y-3 text-left w-full max-w-sm">
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

        {/* Footer inside Left Side - One line */}
        <div className="relative z-10 w-full text-center text-white/70 text-xs md:text-sm pt-2 pb-0 border-t border-white/20">
          <p>
            © {new Date().getFullYear()} All Rights Reserved &nbsp;|&nbsp;
            Developed by{" "}
            <a
              href="https://mostech.ae/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-white/90 font-medium transition-colors hover:underline"
            >
              Mostech Business Solutions
            </a>
          </p>
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
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
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

              {/* ADDED: Forgot Password button */}
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Privacy Policy & Terms Checkbox */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 transition-all flex-shrink-0"
                  style={{ accentColor: primaryColor }}
                  disabled={loading}
                />
                <label className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed cursor-pointer select-none">
                  <span>I agree to the </span>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-block"
                  >
                    Privacy Policy
                  </button>
                  <span> and </span>
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-blue-600 dark:text-blue-400 hover:underline font-medium inline-block"
                  >
                    Terms & Conditions
                  </button>
                  <span className="text-red-500"> *</span>
                </label>
              </div>
              {!agreeToTerms && (
                <p className="text-xs text-red-500 pl-7">
                  You must agree to the Privacy Policy and Terms & Conditions to
                  continue
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-semibold py-3 rounded-full transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
              style={{
                backgroundColor: primaryColor,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = adjustColor(
                  primaryColor,
                  -10,
                ))
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = primaryColor)
              }
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

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </Modal>

      {/* Terms & Conditions Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
      >
        <TermsContent />
      </Modal>

      {/* ===== ADDED: Forgot Password Modal - Two Step Process ===== */}
      {showForgotPassword && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => {
            setShowForgotPassword(false);
            setResetStep(1);
            setCodeSent(false);
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 animate-slideUp max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <i
                    className="fas fa-key text-sm"
                    style={{ color: primaryColor }}
                  ></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {resetStep === 1 ? "Reset Password" : "Enter Reset Code"}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep(1);
                  setCodeSent(false);
                }}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* Step 1: Request Code */}
            {resetStep === 1 && (
              <>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter your email address and we'll send you a code to reset
                    your password.
                  </p>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleRequestCode();
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all"
                        placeholder="your@email.com"
                        disabled={isRequestingCode}
                        autoFocus
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetStep(1);
                      setCodeSent(false);
                    }}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    disabled={isRequestingCode}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestCode}
                    disabled={isRequestingCode || !resetEmail}
                    className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = adjustColor(
                        primaryColor,
                        -10,
                      ))
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = primaryColor)
                    }
                  >
                    {isRequestingCode ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Sending...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i> Send Code
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Enter Code & New Password */}
            {resetStep === 2 && (
              <>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <i className="fas fa-check-circle text-green-500"></i>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Code sent to <strong>{resetEmail}</strong>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Reset Code
                    </label>
                    <div className="relative">
                      <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        value={resetCode}
                        onChange={(e) =>
                          setResetCode(e.target.value.toUpperCase())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleResetPassword();
                          }
                        }}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all uppercase"
                        placeholder="Enter 6-digit code"
                        disabled={isResetting}
                        maxLength={6}
                        autoFocus
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Enter the 6-digit code sent to your email
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleResetPassword();
                          }
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all"
                        placeholder="New password (min 6 characters)"
                        disabled={isResetting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i
                          className={`fas ${showNewPassword ? "fa-eye-slash" : "fa-eye"}`}
                        ></i>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleResetPassword();
                          }
                        }}
                        className="w-full pl-11 pr-11 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-primary-custom focus:ring-2 focus:ring-primary-custom/20 transition-all"
                        placeholder="Confirm new password"
                        disabled={isResetting}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <i
                          className={`fas ${showConfirmPassword ? "fa-eye-slash" : "fa-eye"}`}
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setResetStep(1);
                      setCodeSent(false);
                      setResetCode("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    disabled={isResetting}
                  >
                    <i className="fas fa-arrow-left mr-1"></i> Back
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={
                      isResetting ||
                      !resetCode ||
                      !newPassword ||
                      !confirmPassword ||
                      newPassword !== confirmPassword
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: primaryColor,
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = adjustColor(
                        primaryColor,
                        -10,
                      ))
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = primaryColor)
                    }
                  >
                    {isResetting ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Resetting...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i> Reset Password
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* ===== END ADDED ===== */}
    </div>
  );
};

export default Login;
