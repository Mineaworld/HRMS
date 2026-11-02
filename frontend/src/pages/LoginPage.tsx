import React, { useState } from 'react';
import {
  Buildings,
  User,
  Lock,
  Eye,
  EyeSlash,
  ShieldCheck,
  CheckCircle,
  WarningCircle,
  CircleNotch,
  Key,
  ArrowLeft,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { useHrmsStore } from '../store/useHrmsStore';
import { UserRole, UserAccount } from '../types';
import { ROLE_PERSONAS, getRoleBadge } from '../utils/rbac';
import { authApi } from '../api';

interface PresetAccount {
  userName: string;
  role: UserRole;
  passwordHint: string;
  badgeLabel: string;
}

const PRESET_ACCOUNTS: PresetAccount[] = [
  {
    userName: 'prasenjit.mondal',
    role: 'ROLE_ADMIN',
    passwordHint: 'Admin@1234',
    badgeLabel: 'ADMIN',
  },
  {
    userName: 'sarah.jenkins',
    role: 'ROLE_HR',
    passwordHint: 'Hr@1234',
    badgeLabel: 'HR MANAGER',
  },
  {
    userName: 'sophea.chan',
    role: 'ROLE_EMPLOYEE',
    passwordHint: 'Staff@1234',
    badgeLabel: 'STAFF MEMBER',
  },
];

export const LoginPage: React.FC = () => {
  const { login } = useHrmsStore();

  const [mode, setMode] = useState<'login' | 'otp' | 'reset'>('login');
  const [userName, setUserName] = useState('prasenjit.mondal');
  const [password, setPassword] = useState('Admin@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [detectedOtp, setDetectedOtp] = useState<string | null>(null);

  // Reset Password State
  const [newPassword, setNewPassword] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handlePresetSelect = (preset: PresetAccount, autoSubmit = false) => {
    setUserName(preset.userName);
    setPassword(preset.passwordHint);
    setErrorMessage(null);
    setStatusMessage(null);

    if (autoSubmit) {
      performLogin(preset.userName, preset.passwordHint, preset.role);
    }
  };

  const resolveUserByRoleOrUsername = (uName: string): UserAccount => {
    const matchedPreset = PRESET_ACCOUNTS.find((p) => p.userName === uName);
    const role: UserRole = matchedPreset?.role || (uName.includes('admin') ? 'ROLE_ADMIN' : uName.includes('hr') ? 'ROLE_HR' : 'ROLE_EMPLOYEE');
    const persona = ROLE_PERSONAS[role];

    return {
      accountId: role === 'ROLE_ADMIN' ? 101 : role === 'ROLE_HR' ? 102 : 103,
      userName: uName,
      fullName: persona.fullName,
      email: persona.email,
      role,
      employeeId: persona.employeeId,
      avatarUrl: persona.avatarUrl,
    };
  };

  const performLogin = async (usr: string, pwd: string, fallbackRole?: UserRole) => {
    if (!usr.trim() || !pwd.trim()) {
      setErrorMessage('Please enter both your username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      // 1. Attempt call to auth_service microservice via API Gateway (:8080/api/auth/login)
      const res = await authApi.login({ userName: usr, password: pwd });

      if (res && res.success) {
        // Check if first-login OTP is triggered by AuthServiceImpl
        if (typeof res.message === 'string' && res.message.includes('OTP')) {
          // Extract OTP if printed in development response: "New OTP generated. OTP = 123456"
          const match = res.message.match(/OTP\s*=\s*(\d+)/i);
          if (match && match[1]) {
            setDetectedOtp(match[1]);
          }
          setStatusMessage(res.message);
          setMode('otp');
          setIsLoading(false);
          return;
        }

        // Standard Login Successful
        const user = resolveUserByRoleOrUsername(usr);
        if (fallbackRole) {
          user.role = fallbackRole;
        }
        login(user, res.token || 'jwt-bearer-auth-service-token');
        return;
      } else {
        setErrorMessage(res?.message || 'Invalid username or password.');
      }
    } catch (err: any) {
      // 2. Fallback to resilient client mock simulation if microservice is offline or in prototype demo
      console.info('Live auth microservice offline on :8080. Authenticating in enterprise prototype mode.', err);

      // Validate mock credentials
      const matched = PRESET_ACCOUNTS.find((p) => p.userName.toLowerCase() === usr.toLowerCase());
      if (!matched && !usr.includes('.')) {
        setErrorMessage('Username does not exist. Use a preset persona or format (e.g. name.surname).');
        setIsLoading(false);
        return;
      }

      // Successful simulated login
      const user = resolveUserByRoleOrUsername(usr);
      if (fallbackRole) {
        user.role = fallbackRole;
      }
      setTimeout(() => {
        login(user, 'mock-jwt-token-gateway-8080');
      }, 400);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.verifyOtp({ userName, otpCode: otpCode.trim() });
      if (res && res.success) {
        const user = resolveUserByRoleOrUsername(userName);
        login(user, 'jwt-bearer-otp-verified-token');
      } else {
        setErrorMessage(res?.message || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      // Fallback for prototype mode
      const user = resolveUserByRoleOrUsername(userName);
      login(user, 'mock-jwt-otp-verified-token');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !newPassword.trim()) {
      setErrorMessage('Please enter your username and a new password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authApi.resetPassword({ userName, newPassword });
      if (res && res.success) {
        setStatusMessage('Password reset successfully! Please sign in with your new password.');
        setPassword(newPassword);
        setMode('login');
      } else {
        setErrorMessage(res?.message || 'Could not reset password for this account.');
      }
    } catch (err) {
      setStatusMessage('Password reset simulated for prototype. Please sign in now.');
      setPassword(newPassword);
      setMode('login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center p-4 bg-[#eaf1f7] relative overflow-hidden select-none">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-blue-200/40 via-sky-100/20 to-transparent blur-3xl pointer-events-none" />

      {/* Main Login Container */}
      <div className="relative w-full max-w-md z-10 space-y-5">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg shadow-slate-900/20">
            <Buildings weight="duotone" className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">BigBoss</h1>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-0.5">
              Workforce Operations Cloud
            </p>
          </div>
        </div>

        {/* Card Box */}
        <div className="bg-white/90 backdrop-blur-xl border border-white/80 shadow-[0_20px_50px_rgba(15,23,42,0.06)] rounded-3xl p-7 sm:p-8 space-y-5">
          {/* Status / Alert Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/80 text-xs text-rose-700 flex items-start gap-2.5 animate-fadeIn">
              <WarningCircle weight="fill" className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-xs text-blue-700 flex items-start gap-2.5 animate-fadeIn">
              <CheckCircle weight="fill" className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{statusMessage}</div>
            </div>
          )}

          {/* MODE 1: CREDENTIALS LOGIN */}
          {mode === 'login' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                performLogin(userName, password);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username or Corporate ID
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User weight="duotone" className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. prasenjit.mondal"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setStatusMessage(null);
                      setMode('reset');
                    }}
                    className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock weight="duotone" className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeSlash weight="regular" className="w-4 h-4" />
                    ) : (
                      <Eye weight="regular" className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
                  />
                  <span>Remember this browser</span>
                </label>
                <span className="text-[11px] text-slate-400 font-mono">Gateway :8080</span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-slate-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to BigBoss</span>
                    <ArrowRight weight="bold" className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 2: TWO-FACTOR / FIRST-LOGIN OTP */}
          {mode === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-blue-50 text-blue-600 mb-1">
                  <ShieldCheck weight="duotone" className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
                <p className="text-xs text-slate-500">
                  Enter the verification code generated for{' '}
                  <span className="font-mono font-semibold text-slate-800">@{userName}</span>
                </p>
              </div>

              {detectedOtp && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkle weight="duotone" className="w-4 h-4 text-amber-600" />
                    <span>Server OTP code:</span>
                    <strong className="font-mono text-slate-900 text-sm">{detectedOtp}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpCode(detectedOtp)}
                    className="text-[11px] font-semibold text-amber-700 hover:text-amber-900 underline"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                  6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-full text-center tracking-[0.5em] text-lg font-mono py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-bold"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                      <span>Verifying Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Verification</span>
                      <CheckCircle weight="bold" className="w-4 h-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE 3: RESET PASSWORD */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex p-3 rounded-full bg-slate-100 text-slate-800 mb-1">
                  <Key weight="duotone" className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
                <p className="text-xs text-slate-500">
                  Update your security credentials via the auth microservice
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Confirm Username
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. prasenjit.mondal"
                  required
                  className="w-full px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new strong password"
                  required
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <CircleNotch weight="bold" className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft weight="bold" className="w-3.5 h-3.5" />
                  <span>Cancel and Return</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Personas Bar */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                1-Click Demo Personas
              </span>
              <span className="text-[10px] text-blue-600 font-mono font-medium">RBAC Preset</span>
            </div>

            <div className="space-y-2">
              {PRESET_ACCOUNTS.map((preset) => {
                const persona = ROLE_PERSONAS[preset.role];
                const badge = getRoleBadge(preset.role);
                const isSelected = userName === preset.userName;

                return (
                  <div
                    key={preset.userName}
                    onClick={() => handlePresetSelect(preset, false)}
                    className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-200 shadow-xs'
                        : 'bg-slate-50/60 border-slate-100 hover:bg-slate-100/70 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={persona.avatarUrl}
                        alt={persona.fullName}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 flex-shrink-0"
                      />
                      <div className="min-w-0 text-left">
                        <div className="text-xs font-semibold text-slate-900 truncate">
                          {persona.fullName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">
                          {preset.userName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${badge.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
                        <span>{preset.badgeLabel}</span>
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePresetSelect(preset, true);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-slate-700 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all shadow-xs"
                      >
                        Sign In
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Security & Microservices Architecture Note */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck weight="bold" className="w-4 h-4 text-emerald-600" />
          <span>Spring Security • JWT Claims • Spring Cloud Gateway (:8080)</span>
        </div>
      </div>
    </div>
  );
};
