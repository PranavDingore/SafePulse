
import { useState } from "react";
import { ShieldCheck, Mail, LockKeyhole, LoaderCircle } from "lucide-react";
import api from "./api/axios";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token) {
        throw new Error("Login token nahi mila.");
      }

      localStorage.setItem("safepulse_token", token);
      onLogin(user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Login failed. Backend check karo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#080d18] px-4 py-10 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-7 shadow-2xl sm:p-9">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="rounded-2xl bg-cyan-400 p-4 text-slate-950">
            <ShieldCheck size={34} />
          </div>
          <h1 className="mt-5 text-3xl font-bold">SafePulse</h1>
          <p className="mt-2 text-sm text-slate-400">
            Sign in to your vehicle safety dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Email address
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4">
              <Mail size={18} className="text-slate-500" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-300">
              Password
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-4">
              <LockKeyhole size={18} className="text-slate-500" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-slate-600"
              />
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 py-3.5 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
          >
            {loading && <LoaderCircle size={18} className="animate-spin" />}
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs leading-5 text-slate-500">
          Secure access · SafePulse IoT Vehicle Safety System
        </p>
      </div>
    </main>
  );
}
