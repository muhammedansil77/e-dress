'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../features/auth/auth-context';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Store, Eye, EyeOff, ShieldCheck, KeyRound, Sparkles, AlertCircle } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await login(values.email, values.password);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err.message || 'Invalid email or password. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemoCredentials = () => {
    setValue('email', 'admin@apparels.com', { shouldValidate: true });
    setValue('password', 'Admin@123456', { shouldValidate: true });
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-100 p-4 relative overflow-hidden text-coffee-900">
      {/* Subtle Warm Luxury Ambience */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cream-300/40 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="relative w-full max-w-md rounded-3xl bg-cream-50 border border-cream-400 p-8 shadow-xl shadow-coffee-900/5 z-10">
        {/* Brand Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-coffee-700 text-gold-500 flex items-center justify-center shadow-md shadow-coffee-700/20 mb-3 border border-gold-500/30">
            <Store className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-coffee-900">HAUTE COUTURE</h2>
          <p className="text-xs text-coffee-600 mt-1 font-medium">
            Luxury Apparel & Catalog Management Console
          </p>
        </div>

        {/* Demo Credentials Quick Fill Box */}
        <div className="mb-6 p-3.5 rounded-2xl bg-cream-200 border border-cream-400 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-gold-600 shrink-0" />
            <div className="text-[11px]">
              <p className="font-semibold text-coffee-900">Demo Super Admin</p>
              <p className="text-coffee-600 font-mono text-[10px]">admin@apparels.com</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemoCredentials}
            className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-coffee-700 text-cream-50 hover:bg-coffee-800 transition-colors shadow-sm"
          >
            Auto Fill
          </button>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-coffee-800 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@apparels.com"
              {...register('email')}
              className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3.5 py-2.5 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
            />
            {errors.email && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-coffee-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password')}
                className="w-full rounded-xl border border-cream-400 bg-cream-100 px-3.5 py-2.5 pr-10 text-xs text-coffee-900 placeholder:text-coffee-600/50 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-coffee-600 hover:text-coffee-900"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-rose-600 mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2 font-bold shadow-md shadow-coffee-700/20"
          >
            Sign In to Dashboard
          </Button>
        </form>

        {/* Security badge */}
        <div className="mt-6 pt-4 border-t border-cream-400/60 flex items-center justify-center gap-2 text-[11px] text-coffee-600">
          <ShieldCheck className="w-3.5 h-3.5 text-gold-600" />
          <span>Encrypted Dual-Token JWT • RBAC Protected</span>
        </div>
      </div>
    </div>
  );
}
