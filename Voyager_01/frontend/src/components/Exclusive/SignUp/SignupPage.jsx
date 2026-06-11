import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAppContext } from "../../../context/AppContext";
import { toast } from "react-toastify";
import NProgress from "nprogress";
import { FiArrowRight, FiMail, FiPhone, FiShield, FiUser } from "react-icons/fi";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, speed: 500 });

const SignupPage = () => {
  const { setUser } = useAppContext();
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "User",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const { name, email, password, phone } = signupInfo;
    if (!name || !email || !password || !phone) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      NProgress.start();

      await axios.post(
        "https://voyeger2026-backend.onrender.com/api/users/register",
        signupInfo,
        {
          headers: { "Content-Type": "application/json" },
          timeout: 5000,
        },
      );

      toast.success("Signup successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      let errorMessage = "Signup failed. Please try again.";

      if (error.response) {
        errorMessage =
          error.response.data?.message || `Server error (${error.response.status})`;
      } else if (error.code === "ECONNABORTED") {
        errorMessage = "Request timed out. Try again.";
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
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.95),_transparent_36%),radial-gradient(circle_at_bottom_left,_rgba(15,23,42,0.12),_transparent_44%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-black/10 bg-white/75 shadow-[0_30px_90px_rgba(15,23,42,0.15)] backdrop-blur-md lg:grid-cols-[0.95fr_1.05fr]">
          <div className="order-2 p-6 sm:p-10 lg:order-1 lg:p-12">
            <div className="mb-8 lg:max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-black/45">Voyager</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Create account</h2>
              <p className="mt-3 text-sm leading-6 text-black/60">
                Build your profile and start using the current Voyager theme across bookings, maps, and trips.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-black/70">
                  Register as
                </label>
                <select
                  name="role"
                  id="role"
                  value={signupInfo.role}
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
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-black/70">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={signupInfo.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f7] px-4 text-sm text-black outline-none transition focus:border-black/25 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-black/70">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={signupInfo.email}
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
                  value={signupInfo.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  required
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-black/10 bg-[#f7f7f7] px-4 text-sm text-black outline-none transition focus:border-black/25 focus:ring-4 focus:ring-black/5 disabled:cursor-not-allowed disabled:opacity-70"
                />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-black/70">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={signupInfo.phone}
                  onChange={handleChange}
                  placeholder="+91 00000 00000"
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
                {loading ? "Signing Up..." : "Sign up"}
                {!loading && <FiArrowRight />}
              </button>
            </form>

            <p className="mt-6 text-sm text-black/60">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-black underline decoration-black/25 underline-offset-4">
                Log in
              </Link>
            </p>
          </div>

          <div className="order-1 hidden flex-col justify-between bg-[linear-gradient(160deg,_#0f172a,_#111827_55%,_#1f2937)] p-10 text-white lg:flex">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
                <FiShield /> Join Voyager
              </div>
              <h1 className="mt-8 max-w-md text-5xl font-semibold leading-tight tracking-tight">
                Build your travel profile in one step.
              </h1>
              <p className="mt-4 max-w-md text-sm leading-6 text-white/70">
                Create an account to access bookings, profile controls, and destination tools with the same UI language.
              </p>
            </div>

            <div className="grid gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <FiUser className="text-cyan-300" />
                User, owner, and vendor roles supported.
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-cyan-300" />
                Strong validation before hitting the API.
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-cyan-300" />
                Phone number included in the account profile.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;