import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { Pill, Mail, CheckCircle, ArrowLeft, KeyRound, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { authApi, getErrorMessage } from '../services/api';
import { toast } from 'sonner';

type Step = 'email' | 'otp' | 'reset' | 'done';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]             = useState<Step>('email');
  const [email, setEmail]           = useState('');
  const [otp, setOtp]               = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ── Step 1: Send OTP ──────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success('OTP sent! Check your email (or console in dev mode).');
      setStep('otp');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input handling ────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const updated = [...otp];
    digits.split('').forEach((d, i) => { updated[i] = d; });
    setOtp(updated);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  };

  // ── Step 2: Verify OTP ────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const otpString = otp.join('');
    if (otpString.length < 6) {
      setError('Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOTP(email, otpString);
      setResetToken(data.resetToken);
      toast.success('OTP verified!');
      setStep('reset');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Reset Password ────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(resetToken, newPassword);
      toast.success('Password reset successfully!');
      setStep('done');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicators ───────────────────────────────────
  const steps = [
    { label: 'Email', icon: Mail },
    { label: 'OTP',   icon: ShieldCheck },
    { label: 'Reset', icon: KeyRound },
  ];

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Pill className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-1">Reset Password</h1>
          <p className="text-muted-foreground text-sm">We'll send a one-time code to your email</p>
        </div>

        {/* Step progress (only show for steps 1-3) */}
        {step !== 'done' && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => {
              const currentIndex = step === 'email' ? 0 : step === 'otp' ? 1 : 2;
              const Icon = s.icon;
              const done    = i < currentIndex;
              const active  = i === currentIndex;
              return (
                <React.Fragment key={s.label}>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                    ${done   ? 'bg-primary/20 text-primary'
                    : active ? 'bg-primary text-primary-foreground'
                    :          'bg-muted-foreground/10 text-muted-foreground'}`}>
                    <Icon className="w-3.5 h-3.5" />
                    {s.label}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-px w-6 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        <Card>
          <AnimatePresence mode="wait">

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <motion.div key="email" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Enter your email</CardTitle>
                  <CardDescription>We'll send a 6-digit OTP to this address</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="email">Email address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Sending OTP…' : 'Send OTP'}
                    </Button>
                    <div className="text-center">
                      <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Enter OTP</CardTitle>
                  <CardDescription>
                    We sent a 6-digit code to <span className="font-medium text-foreground">{email}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVerifyOTP} className="space-y-5">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {/* 6-box OTP input */}
                    <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                      {otp.map((digit, i) => (
                        <input
                          key={i}
                          ref={(el) => { otpRefs.current[i] = el; }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(i, e)}
                          className="w-11 h-12 text-center text-xl font-bold border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || otp.join('').length < 6}>
                      {loading ? 'Verifying…' : 'Verify OTP'}
                    </Button>

                    <div className="flex items-center justify-between text-sm">
                      <button
                        type="button"
                        className="text-muted-foreground hover:text-foreground"
                        onClick={() => { setStep('email'); setOtp(['','','','','','']); setError(''); }}
                      >
                        ← Change email
                      </button>
                      <button
                        type="button"
                        className="text-primary hover:underline"
                        disabled={loading}
                        onClick={async () => {
                          setError('');
                          setLoading(true);
                          try {
                            await authApi.forgotPassword(email);
                            toast.success('New OTP sent!');
                            setOtp(['','','','','','']);
                          } catch (err) {
                            setError(getErrorMessage(err));
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── Step 3: New Password ── */}
            {step === 'reset' && (
              <motion.div key="reset" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <CardHeader>
                  <CardTitle>Set new password</CardTitle>
                  <CardDescription>Choose a strong password for your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="newPass">New password</Label>
                      <div className="relative">
                        <Input
                          id="newPass"
                          type={showPass ? 'text' : 'password'}
                          placeholder="Min. 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="pr-10"
                          required
                          autoFocus
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPass(!showPass)}
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPass">Confirm password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPass"
                          type={showConfirm ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowConfirm(!showConfirm)}
                        >
                          {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Resetting…' : 'Reset Password'}
                    </Button>
                  </form>
                </CardContent>
              </motion.div>
            )}

            {/* ── Done ── */}
            {step === 'done' && (
              <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <CardContent className="pt-8 pb-6">
                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-semibold">Password Reset!</h2>
                    <p className="text-muted-foreground text-sm">
                      Your password has been updated. You can now sign in with your new password.
                    </p>
                    <Button className="w-full" onClick={() => navigate('/login')}>
                      Go to Sign In
                    </Button>
                  </div>
                </CardContent>
              </motion.div>
            )}

          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
}
