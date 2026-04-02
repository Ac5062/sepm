import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { Pill, Lock, Mail, User, Phone, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { getErrorMessage } from '../services/api';

// ── Validators ──────────────────────────────────────────────────────────────
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

const isValidPhone = (phone: string) =>
  /^(\+91[\-\s]?)?[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));

const isValidName = (name: string) =>
  name.trim().length >= 2 && /^[a-zA-Z\s'-]+$/.test(name.trim());

// ── Password strength ────────────────────────────────────────────────────────
function getPasswordStrength(password: string): {
  level: 'empty' | 'weak' | 'medium' | 'strong';
  label: string;
  color: string;
  width: string;
} {
  if (!password) return { level: 'empty', label: '', color: '', width: '0%' };

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const longEnough = password.length >= 8;

  const score = [hasUpper, hasLower, hasNumber, hasSpecial, longEnough].filter(Boolean).length;

  if (password.length < 6)
    return { level: 'weak', label: 'Too short', color: 'bg-destructive', width: '25%' };
  if (score <= 2)
    return { level: 'weak', label: 'Weak', color: 'bg-destructive', width: '33%' };
  if (score <= 3)
    return { level: 'medium', label: 'Medium', color: 'bg-accent', width: '66%' };
  return { level: 'strong', label: 'Strong', color: 'bg-secondary', width: '100%' };
}

export function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const passwordStrength = getPasswordStrength(formData.password);

  // ── Real-time per-field validation ──────────────────────────────────────────
  const validateField = (id: string, value: string): string => {
    switch (id) {
      case 'name':
        if (!value.trim()) return 'Full name is required';
        if (!isValidName(value)) return 'Name must be at least 2 letters (no numbers)';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required';
        if (!isValidEmail(value)) return 'Enter a valid email address';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!isValidPhone(value)) return 'Enter a valid 10-digit Indian mobile number';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    // Clear submit-level error on any change
    setSubmitError('');

    // Re-validate this field (and confirm password if password changes)
    const error = validateField(id, value);
    setFieldErrors(prev => ({ ...prev, [id]: error }));

    if (id === 'password' && formData.confirmPassword) {
      const confirmErr = value !== formData.confirmPassword ? 'Passwords do not match' : '';
      setFieldErrors(prev => ({ ...prev, confirmPassword: confirmErr }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    setFieldErrors(prev => ({ ...prev, [id]: error }));
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validate all fields at once before submitting
    const errors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) errors[key] = err;
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      await register(
        formData.email.trim(),
        formData.password,
        formData.name.trim(),
        formData.phone.trim()
      );
      navigate('/dashboard');
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const inputClass = (field: string) =>
    `pl-10 ${fieldErrors[field] ? 'border-destructive focus-visible:ring-destructive' : ''}`;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
            <Pill className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join us to find affordable medicines</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your account to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>

              {/* Submit-level error */}
              {submitError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('name')}
                    autoComplete="name"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('email')}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={inputClass('phone')}
                    autoComplete="tel"
                  />
                </div>
                {fieldErrors.phone ? (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.phone}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">Indian mobile number (10 digits)</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {/* Password strength bar */}
                {formData.password && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: passwordStrength.width }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    <p className={`text-xs font-medium ${
                      passwordStrength.level === 'strong' ? 'text-secondary' :
                      passwordStrength.level === 'medium' ? 'text-accent' : 'text-destructive'
                    }`}>
                      Password strength: {passwordStrength.label}
                    </p>
                  </div>
                )}

                {fieldErrors.password && (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`pl-10 pr-10 ${fieldErrors.confirmPassword ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword ? (
                  <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> {fieldErrors.confirmPassword}
                  </p>
                ) : (
                  formData.confirmPassword && formData.confirmPassword === formData.password && (
                    <p className="text-xs text-secondary flex items-center gap-1 mt-1">
                      <CheckCircle className="h-3 w-3" /> Passwords match
                    </p>
                  )
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Already have an account? </span>
                <Link to="/login" className="text-primary hover:underline">Sign in</Link>
              </div>

            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
