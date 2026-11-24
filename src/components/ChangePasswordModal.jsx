import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.changePassword({
        currentPassword,
        newPassword
      });

      setSuccess(res.data?.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2e241f]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#ebdccd] rounded-3xl w-full max-w-md p-6 relative shadow-elevated">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#786c65] hover:text-[#2e241f] p-1.5 rounded-xl hover:bg-[#faf7f2] cursor-pointer transition"
        >
          ✕
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#b85c1f]/10 text-[#b85c1f] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#2e241f]">Change Admin Password</h2>
            <p className="text-xs text-[#786c65]">Update your master login credentials</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#786c65] font-semibold mb-1.5">
              Current Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password..."
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-[#786c65] font-semibold mb-1.5">
              New Password (min 8 characters)
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password..."
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-[#786c65] font-semibold mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password..."
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#ebdccd] rounded-xl text-xs text-[#2e241f] placeholder-[#a89b91] focus:outline-none focus:border-[#b85c1f] focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-[#786c65] hover:text-[#2e241f] text-[11px] flex items-center gap-1.5 cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Hide passwords' : 'Show passwords'}</span>
            </button>
          </div>

          <div className="pt-3 border-t border-[#ebdccd] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#faf7f2] hover:bg-[#ebdccd] text-[#786c65] border border-[#ebdccd] rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#b85c1f] hover:bg-[#a35017] disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-md transition cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
