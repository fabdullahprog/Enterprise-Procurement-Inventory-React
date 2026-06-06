// src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoginFormValues, FormErrors } from '../../types';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState<LoginFormValues>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [apiError, setApiError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname ?? '/dashboard';
  const wasInactive = (location.state as { reason?: string })?.reason === 'inactivity';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (apiError) setApiError('');
  };

  const validate = (): FormErrors => {
    const errs: FormErrors = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setApiError(error.response?.data?.message ?? 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans antialiased">
      {/* Left Column: Form Container */}
      <div className="w-full lg:w-[48%] xl:w-[40%] flex flex-col justify-between px-8 sm:px-16 lg:px-24 py-12 bg-white">

        {/* Top Header/Branding */}
        <div className="flex items-center gap-2.5">
          <svg className="w-8 h-8 text-zinc-900" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="currentColor" fillOpacity="0.08" />
            <path d="M12 15h16M12 20h16M12 25h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            <circle cx="28" cy="25" r="4" fill="currentColor" />
          </svg>
          <span className="text-xl font-bold tracking-tight text-zinc-900">SuperShop ERP</span>
        </div>

        {/* Center: Form Block */}
        <div className="my-auto py-8 w-full max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-zinc-900 text-3xl font-bold tracking-tight">Sign into your account</h1>
            <p className="text-zinc-500 text-sm mt-2">Welcome back! Please enter your details.</p>
          </div>

          {wasInactive && !apiError && (
            <div className="mb-6 p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-zinc-600 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>You were logged out due to inactivity. Please sign in again.</span>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 rounded-lg bg-zinc-50 border border-zinc-200 text-sm text-red-600 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="email" className="text-sm font-medium text-zinc-700 mb-1.5 block">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="name@company.com"
                className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
              />
              {errors.email && <span className="mt-1.5 block text-xs text-red-500">{errors.email}</span>}
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-zinc-700 mb-1.5 block">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm placeholder-gray-400 focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 transition-colors ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
              />
              {errors.password && <span className="mt-1.5 block text-xs text-red-500">{errors.password}</span>}
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-zinc-600 cursor-pointer select-none">
                {/* <input
                  type="checkbox"
                  name="remember"
                  className="w-4 h-4 rounded border-gray-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer accent-zinc-900"
                /> */}
                {/* <span>Remember for 30 days</span> */}
              </label>
              <a
                href="#forgot"
                className="font-semibold text-zinc-900 hover:underline transition duration-150 ease-in-out"
                onClick={(e) => e.preventDefault()}
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <div className="text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-zinc-900 hover:underline transition duration-150 ease-in-out">
            Sign up
          </Link>
        </div>
      </div>

      {/* Right Column: High-Contrast Minimalist Showcase */}
      <div className="relative hidden lg:flex flex-col justify-end p-16 lg:w-[52%] xl:w-[60%] overflow-hidden h-screen bg-zinc-950">
        <img
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80"
          alt="Modern Corporate Space"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-zinc-900/40 mix-blend-multiply" />

        {/* Glassmorphism Div at Bottom */}
        <div className="relative z-10 max-w-lg backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl text-white">
          <p className="text-lg font-medium leading-relaxed">
            "Streamline your retail operations with enterprise-grade precision."
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-semibold">SE</div>
            <div>
              <p className="text-sm font-semibold">SuperShop Enterprise</p>
              <p className="text-xs text-white/70">Unified Retail Platform</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;