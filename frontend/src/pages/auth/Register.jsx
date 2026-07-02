import React from "react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Lock, Mail, User, UserCog } from "lucide-react";
import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { isEmail } from "../../utils/helpers";
import AuthLayout from "./AuthLayout";

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register, user: currentUser } = useAuth(); // ✅ Get current user
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "MEMBER",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ Check if current user is ADMIN
  const isAdmin = currentUser?.role === "ADMIN";

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (form.name.trim().length < 3) {
      nextErrors.name = "Name must be at least 3 characters.";
    }

    if (!isEmail(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await register({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
        // ✅ Only send role if admin is creating the account
        ...(isAdmin && { role: form.role }),
      });
      toast.success("Account created successfully! 🎉");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ??
          "Registration failed. Please try again.",
      );
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
        <h2 className="text-3xl font-bold tracking-tight">Create account</h2>
        <p className="mt-2 text-sm text-slate-400">
          {isAdmin
            ? "Create a new user account with role assignment."
            : "Join the Mini Jira workspace."}
        </p>

        <div className="mt-8 space-y-4">
          <Field
            icon={User}
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            error={errors.name}
          />
          <Field
            icon={Mail}
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            type="email"
            error={errors.email}
          />
          <PasswordField
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            showPassword={showPassword}
            onToggle={() => setShowPassword((v) => !v)}
            error={errors.password}
          />
          <PasswordField
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm password"
            showPassword={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((v) => !v)}
            error={errors.confirmPassword}
          />

          {/* ✅ Role field - Only show if user is ADMIN */}
          {isAdmin && (
            <label className="block">
              <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-400 focus-within:border-indigo-400">
                <UserCog size={17} />
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full bg-transparent text-white outline-none"
                >
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </span>
              <span className="mt-1 block text-xs text-slate-500">
                Only admins can assign roles during registration.
              </span>
            </label>
          )}

          <button
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {isAdmin ? "Create User" : "Register"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-300 transition hover:text-indigo-200"
          >
            Login
          </Link>
        </p>
      </motion.form>
    </AuthLayout>
  );
}

function Field({ icon: Icon, error, ...props }) {
  return (
    <label className="block">
      <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-400 focus-within:border-indigo-400 transition focus-within:shadow-lg focus-within:shadow-indigo-500/10">
        <Icon size={17} className="flex-shrink-0" />
        <input
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          {...props}
        />
      </span>
      {error && (
        <span className="mt-1 block text-xs text-rose-300 animate-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </label>
  );
}

function PasswordField({ showPassword, onToggle, error, ...props }) {
  return (
    <label className="block">
      <span className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-950/50 px-3 py-2 text-slate-400 focus-within:border-indigo-400 transition focus-within:shadow-lg focus-within:shadow-indigo-500/10">
        <Lock size={17} className="flex-shrink-0" />
        <input
          type={showPassword ? "text" : "password"}
          className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
          {...props}
        />
        <button
          type="button"
          onClick={onToggle}
          className="text-slate-400 transition hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 rounded"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
      {error && (
        <span className="mt-1 block text-xs text-rose-300 animate-in slide-in-from-top-1">
          {error}
        </span>
      )}
    </label>
  );
}
