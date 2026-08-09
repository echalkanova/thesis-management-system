import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, LogIn, UserPlus } from "lucide-react";
import { ThesisFlowIcon, ThesisFlowWordmark } from "@/components/thesis-flow-logo";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      setLocation("/dashboard");
    } catch {
      toast({
        title: "Грешка при вход",
        description: "Невалиден имейл или парола.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-indigo-50 to-slate-100 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl shadow-indigo-100/50 border border-slate-100 px-8 py-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <ThesisFlowIcon size={96} />
        </div>

        {/* Heading */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            Welcome to <ThesisFlowWordmark className="text-2xl" />
          </h1>
          <p className="text-sm text-slate-400">Sign in to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                data-testid="input-email"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                data-testid="input-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex items-center justify-start">
            <button type="button" className="text-sm text-indigo-500 hover:text-indigo-700 font-medium">
              Forgot password?
            </button>
          </div>

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            data-testid="button-submit-login"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm transition shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            <LogIn className="h-4 w-4" />
            {loading ? "Зареждане..." : "Sign In"}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400">or</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Create account */}
          <Link href="/register" data-testid="link-register">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition"
            >
              <UserPlus className="h-4 w-4 text-slate-500" />
              Create an account
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
