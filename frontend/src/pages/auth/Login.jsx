import React from "react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { isEmail } from "../../utils/helpers";
import AuthLayout from "./AuthLayout";

// ✅ ONLY ONE export default - right here
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await login({ email: form.email, password: form.password });
      toast.success("Logged in successfully");
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-slate-950/30 backdrop-blur-xl"
      >
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="mt-2 text-sm text-slate-400">
          Login to continue your sprint work.
        </p>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-medium text-slate-300">Email</span>
            <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-400 focus-within:border-indigo-400">
              <Mail size={17} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="ramesh@example.com"
                className="w-full bg-transparent text-white outline-none"
              />
            </span>
            {errors.email ? (
              <span className="mt-1 block text-xs text-rose-300">
                {errors.email}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-300">Password</span>
            <span className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-400 focus-within:border-indigo-400">
              <Lock size={17} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-transparent text-white outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="text-slate-400 transition hover:text-white"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
            {errors.password ? (
              <span className="mt-1 block text-xs text-rose-300">
                {errors.password}
              </span>
            ) : null}
          </label>

          <label className="flex items-center justify-between gap-3 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded border-white/10 accent-indigo-500"
              />
              Remember me
            </span>
            <span className="text-indigo-300">Forgot password?</span>
          </label>

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            Login
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Need an account?{" "}
          <Link to="/register" className="font-semibold text-indigo-300">
            Register
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}

