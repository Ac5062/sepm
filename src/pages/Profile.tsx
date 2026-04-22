import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../app/components/ui/button';
import { Input } from '../app/components/ui/input';
import { Label } from '../app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../app/components/ui/card';
import { Alert, AlertDescription } from '../app/components/ui/alert';
import { Separator } from '../app/components/ui/separator';
import { Badge } from '../app/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  KeyRound,
  ArrowLeft,
  Eye,
  EyeOff,
  Save,
  LogOut,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { authApi, getErrorMessage } from '../services/api';
import { toast } from 'sonner';

export function Profile() {
  const navigate  = useNavigate();
  const { user, logout, updateUser } = useAuth();

  // ── Profile form ─────────────────────────────────────
  const [name, setName]   = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError]     = useState('');

  // ── Password form ─────────────────────────────────────
  const [currentPass, setCurrentPass]   = useState('');
  const [newPass, setNewPass]           = useState('');
  const [confirmPass, setConfirmPass]   = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass]         = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading]   = useState(false);
  const [passError, setPassError]       = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  // ── Update profile ────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');

    const updates: { name?: string; phone?: string } = {};
    if (name.trim() !== user.name)   updates.name  = name.trim();
    if (phone.trim() !== user.phone) updates.phone = phone.trim();

    if (Object.keys(updates).length === 0) {
      toast.info('No changes to save.');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await authApi.updateProfile(updates);
      updateUser(res.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      setProfileError(getErrorMessage(err));
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change password ───────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPass.length < 6) {
      setPassError('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await authApi.changePassword(currentPass, newPass);
      toast.success('Password changed! Please log in again.');
      logout();
      navigate('/login');
    } catch (err) {
      setPassError(getErrorMessage(err));
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Top nav */}
      <header className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Account summary */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-semibold truncate">{user.name}</h2>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? (
                        <><ShieldCheck className="w-3 h-3 mr-1" />Admin</>
                      ) : 'User'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm truncate">{user.email}</p>
                  <p className="text-muted-foreground text-sm">{user.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Edit profile */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Edit Profile
              </CardTitle>
              <CardDescription>Update your display name and phone number</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                {profileError && (
                  <Alert variant="destructive">
                    <AlertDescription>{profileError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="pl-10"
                      minLength={2}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-display">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email-display"
                      value={user.email}
                      className="pl-10 opacity-60"
                      disabled
                      title="Email cannot be changed"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Email address cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit Indian mobile"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button type="submit" disabled={profileLoading} className="w-full sm:w-auto">
                  <Save className="w-4 h-4 mr-2" />
                  {profileLoading ? 'Saving…' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Change password */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-4 h-4" />
                Change Password
              </CardTitle>
              <CardDescription>You'll be signed out after a successful password change</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passError && (
                  <Alert variant="destructive">
                    <AlertDescription>{passError}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPass">Current password</Label>
                  <div className="relative">
                    <Input
                      id="currentPass"
                      type={showCurrentPass ? 'text' : 'password'}
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      placeholder="Your current password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="newPass">New password</Label>
                  <div className="relative">
                    <Input
                      id="newPass"
                      type={showNewPass ? 'text' : 'password'}
                      value={newPass}
                      onChange={(e) => setNewPass(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPass">Confirm new password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPass"
                      type={showConfirmPass ? 'text' : 'password'}
                      value={confirmPass}
                      onChange={(e) => setConfirmPass(e.target.value)}
                      placeholder="Repeat new password"
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" variant="destructive" disabled={passLoading} className="w-full sm:w-auto">
                  <KeyRound className="w-4 h-4 mr-2" />
                  {passLoading ? 'Changing…' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

      </main>
    </div>
  );
}
