import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import NProgress from "nprogress";
import { FiArrowRight, FiEye, FiLock, FiMail, FiShield } from "react-icons/fi";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 500 });

const LoginPage = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const { setUser } = useAppContext();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setLoginInfo((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const validateForm = () => {
    if (!loginInfo.email || !loginInfo.password) {
      toast.error("Please enter both email and password.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginInfo.email)) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      NProgress.start();

      const response = await axios.post(
        "https://voyeger2026-backend.onrender.com/api/users/login",
        loginInfo,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
          timeout: 15000,
        },
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Authentication failed, missing token or user data.");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userName", user.name);

      setUser({ token, role: user.role, email: user.email, name: user.name });
      toast.success("Login successful!");

      if (user.role === "Owner") {
        navigate("/hotelApp");
      } else if (user.role === "Vendor") {
        navigate("/vendorApp");
      } else {
        navigate("/");
      }
    } catch (error) {
      let errorMessage = "Login failed. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data?.message || `Server error (${error.response.status})`;
        if (error.response.status === 401) {
          errorMessage = "Invalid email or password.";
        }
        if (error.response.status === 403) {
          errorMessage = "You don't have permission.";
        }
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.message.includes("Network Error")) {
        errorMessage = "Network error. Please check your connection.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
      NProgress.done();
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden bg-[#ebebeb] text-black">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.12),_transparent_42%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur-md lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden flex-col justify-between bg-[linear-gradient(160deg,_#0f172a,_#111827_55%,_#1f2937)] p-10 text-white lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                <FiShield /> Secure access
              </div>
              <h1 className="mt-8 max-w-md text-5xl font-semibold leading-tight tracking-tight">
                Welcome back to Voyager.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
                Continue your trip planning, bookings, and saved preferences with the same theme across the app.
              </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <FiMail className="text-cyan-300" />
                Fast login flow with role-based routing.
              </div>
              <div className="flex items-center gap-3">
                <FiLock className="text-cyan-300" />
                Secure API request with timeout and progress feedback.
              </div>
              <div className="flex items-center gap-3">
                <FiEye className="text-cyan-300" />
                Clear form states and inline validation.
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 lg:p-12">
            <div className="mb-8 lg:max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Voyager</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Login</h2>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Sign in to continue with the current Voyager theme and your saved account data.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-black/70">
                  Login as
                </label>
                <select
                  name="role"
                  id="role"
                  value={loginInfo.role}
                  onChange={handleChange}
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f7] px-4 text-sm text-black outline-none transition focus:border-black/25 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <option value="User">User</option>
                  <option value="Owner">Owner</option>
                  <option value="Vendor">Vendor</option>
                </select>
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-black/70">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={loginInfo.email}
                  onChange={handleChange}
                  placeholder="name@example.com"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f7] px-4 text-sm text-black outline-none transition focus:border-black/25 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-black/70">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={loginInfo.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f7] px-4 text-sm text-black outline-none transition focus:border-black/25 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Signing In..." : "Login"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="mt-6 text-sm text-black/60">
              Don’t have an account?{" "}
              <Link to="/register" className="font-semibold text-black underline decoration-black/25 underline-offset-4">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;