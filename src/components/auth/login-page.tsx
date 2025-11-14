"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheck,
  FiShield,
  FiUsers,
  FiBriefcase,
  FiUser,
} from "react-icons/fi"
import { toast } from "sonner"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { login, forgotPassword, verifyResetCode, resetPassword } from "@/store/slices/authSlice"

type CurrentUser = {
  id: string
  email: string
  role: "admin" | "manager" | "employee" | "guest"
}

type AuthStep = "login" | "forgot-email" | "verify-code" | "reset-password" | "success"
type UserRole = "admin" | "manager" | "employee" | "guest"

export default function LoginPage({ onLoginSuccess }: { onLoginSuccess: (user: CurrentUser) => void }) {
  const loginFormRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.add("dark")
    return () => {
      // Don't remove dark class on unmount - let the app handle theme
    }
  }, [])

  const dispatch = useAppDispatch()
  const { isLoading, error: authError } = useAppSelector((state) => state.auth)

  const [step, setStep] = useState<AuthStep>("login")
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      setEmail(rememberedEmail)
      setRememberMe(true)
    }
  }, [])

  useEffect(() => {
    if (selectedRole && loginFormRef.current) {
      // Only auto-scroll on mobile/tablet devices
      if (window.innerWidth < 1024) {
        setTimeout(() => {
          loginFormRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          })
        }, 100)
      }
    }
  }, [selectedRole])

  const handleLogin = async () => {
    if (!selectedRole) {
      setError("Please select a role first.")
      return
    }

    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")

    try {
      const result = await dispatch(
        login({
          email: email.trim(),
          password: password,
          selectedRole: selectedRole,
        }),
      ).unwrap()

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email.trim())
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      toast.success(`Welcome back!`)
      onLoginSuccess(result.user)
    } catch (err: any) {
      setError(err || "Invalid credentials. Please check your email, password, and selected role.")
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address.")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setError("")

    try {
      const result = await dispatch(forgotPassword(email)).unwrap()
      toast.success(`Verification code sent to ${email}`)

      // For demo purposes, show the code
      if (result.code) {
        toast.info(`Demo code: ${result.code}`)
      }

      setStep("verify-code")
    } catch (err: any) {
      setError(err || "Failed to send verification code")
    }
  }

  const handleVerifyCode = async () => {
    setError("")

    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit code.")
      return
    }

    try {
      await dispatch(verifyResetCode({ email, code: verificationCode })).unwrap()
      toast.success("Code verified successfully!")
      setStep("reset-password")
    } catch (err: any) {
      setError(err || "Invalid verification code")
    }
  }

  const handleResetPassword = async () => {
    setError("")

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      setError("Password must contain uppercase, lowercase, and numbers.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      await dispatch(resetPassword({ email, code: verificationCode, newPassword })).unwrap()
      toast.success("Password reset successful!")
      setStep("success")
    } catch (err: any) {
      setError(err || "Failed to reset password")
    }
  }

  const resetToLogin = () => {
    setStep("login")
    setSelectedRole(null)
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    setEmail(rememberedEmail || "")
    setPassword("")
    setVerificationCode("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setShowPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setRememberMe(!!rememberedEmail)
  }

  const roles = [
    {
      id: "admin" as UserRole,
      name: "Admin",
      description: "Full system access",
      icon: FiShield,
      color: "from-amber-500 to-orange-600",
      bgGlow: "shadow-amber-500/20",
    },
    {
      id: "manager" as UserRole,
      name: "Manager",
      description: "Team management",
      icon: FiBriefcase,
      color: "from-blue-500 to-cyan-600",
      bgGlow: "shadow-blue-500/20",
    },
    {
      id: "employee" as UserRole,
      name: "Employee",
      description: "Lead management",
      icon: FiUser,
      color: "from-green-500 to-emerald-600",
      bgGlow: "shadow-green-500/20",
    },
    {
      id: "guest" as UserRole,
      name: "Guest",
      description: "View-only access",
      icon: FiUsers,
      color: "from-gray-500 to-slate-600",
      bgGlow: "shadow-gray-500/20",
    },
  ]

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-950 via-gray-900 to-amber-950 relative overflow-x-hidden">
      {/* ... existing background gradients ... */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-amber-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-orange-600/8 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl"></div>
      </div>

      {step === "login" && (
        <>
          <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-5 lg:gap-6 items-start relative z-10 flex-1 py-4">
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 lg:p-7 shadow-2xl flex flex-col justify-center min-h-[600px]">
              <div className="text-center lg:text-left mb-6 lg:mb-7">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 mb-3 shadow-lg relative">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="relative z-10"
                  >
                    <path
                      d="M28 6L10 14V28C10 38 28 44 28 44C28 44 46 38 46 28V14L28 6Z"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="white"
                      fillOpacity="0.15"
                    />
                    <circle cx="28" cy="24" r="6" fill="white" />
                    <path
                      d="M18 36C18 36 21 32 28 32C35 32 38 36 38 36"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-1.5 tracking-tight">CRM Portal</h1>
                <p className="text-gray-300 text-sm">Select your role to continue</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {roles.map((role) => {
                  const Icon = role.icon
                  return (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`group p-3.5 rounded-xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                        selectedRole === role.id
                          ? "border-amber-500 bg-gradient-to-br from-amber-500/15 to-orange-600/15"
                          : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                      ></div>

                      <div className="relative z-10">
                        <div
                          className={`w-11 h-11 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform duration-300`}
                        >
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-base font-semibold text-white mb-0.5">{role.name}</h3>
                        <p className="text-xs text-gray-300">{role.description}</p>
                      </div>

                      {selectedRole === role.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                          <FiCheck className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedRole === "guest" && (
                <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/30 backdrop-blur-sm">
                  <p className="text-xs text-blue-200">
                    <strong className="text-blue-100">Guest Access:</strong> View-only mode. You can see data but cannot
                    create, update, or delete records.
                  </p>
                </div>
              )}
            </div>

            <div
              ref={loginFormRef}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 lg:p-7 shadow-2xl flex flex-col justify-center min-h-[600px]"
            >
              <div className="mb-4">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Sign In</h2>
                <p className="text-gray-300 text-sm">Enter your credentials to access your account</p>
              </div>

              <div className="space-y-3.5">
                {(error || authError) && (
                  <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                    <AlertDescription className="!text-white text-sm font-medium">
                      {error || authError}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-gray-200 text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-lg backdrop-blur-sm"
                      disabled={isLoading}
                      autoComplete="email"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-200 text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-lg backdrop-blur-sm"
                      disabled={isLoading}
                      autoComplete="current-password"
                      onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-0.5">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      disabled={isLoading}
                      className="border-white/20 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                    />
                    <Label htmlFor="remember" className="text-xs font-normal cursor-pointer text-gray-300">
                      Remember me
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    className="text-xs px-0 h-auto text-amber-400 hover:text-amber-300 font-medium"
                    onClick={() => setStep("forgot-email")}
                    disabled={isLoading}
                  >
                    Forgot password?
                  </Button>
                </div>

                <Button
                  type="button"
                  onClick={handleLogin}
                  className="w-full h-10 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold rounded-lg transition-all duration-300"
                  disabled={isLoading || !selectedRole}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <span>Signing in...</span>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                <div className="pt-3 mt-3 border-t border-white/10">
                  <p className="text-xs text-center text-gray-400">Need an account? Contact your administrator</p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full text-center text-xs text-gray-400 relative z-10 mt-8 pb-4">
            <p>© 2025 CRM Portal. All rights reserved.</p>
            <p className="mt-1">Secure authentication with role-based access control</p>
          </div>
        </>
      )}

      {step === "forgot-email" && (
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-4 text-gray-300 hover:text-white hover:bg-white/10"
              onClick={resetToLogin}
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
              <p className="text-gray-300">Enter your email to receive a verification code</p>
            </div>
            <div className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                  <AlertDescription className="!text-white font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-200 text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleForgotPassword}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all duration-300"
              >
                {isLoading ? "Sending..." : "Send Verification Code"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "verify-code" && (
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit -ml-2 mb-4 text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => setStep("forgot-email")}
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Verify Code</h2>
              <p className="text-gray-300">Enter the 6-digit code sent to {email}</p>
            </div>
            <div className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                  <AlertDescription className="!text-white font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-200 text-sm font-medium">
                  Verification Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="text-center text-2xl tracking-widest font-mono h-14 bg-white/5 border-white/10 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleVerifyCode()}
                  disabled={isLoading}
                />
              </div>

              <Button
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all duration-300"
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 bg-white/5 border-white/10 text-gray-200 hover:bg-white/10 hover:text-white rounded-xl backdrop-blur-sm"
                onClick={handleForgotPassword}
                disabled={isLoading}
              >
                Resend Code
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "reset-password" && (
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
              <p className="text-gray-300">Enter your new password</p>
            </div>
            <div className="space-y-5">
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 backdrop-blur-sm">
                  <AlertDescription className="!text-white font-medium">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-gray-200 text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showNewPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-400">Must be 8+ characters with uppercase, lowercase, and numbers</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-gray-200 text-sm font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-12 pr-12 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 rounded-xl backdrop-blur-sm"
                    onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showConfirmPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                onClick={handleResetPassword}
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all duration-300"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="w-full max-w-md relative z-10">
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                <FiCheck className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white">Password Reset Successful!</h2>
                <p className="text-gray-300">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
              <Button
                onClick={resetToLogin}
                className="w-full h-12 bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:via-orange-700 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-600/30 hover:shadow-amber-600/50 transition-all duration-300"
              >
                Back to Sign In
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
