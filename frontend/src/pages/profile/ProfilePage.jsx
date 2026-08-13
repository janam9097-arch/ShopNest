import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, Heart, Key, Edit, ChevronRight } from 'lucide-react';
import authService from '../../services/authService';
import { getProfile } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Edit Profile Form State
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  // Change Password Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await authService.updateProfile({
        first_name: firstName,
        last_name: lastName,
        phone: phone
      });
      toast.success('Profile updated successfully!');
      dispatch(getProfile());
      setActiveTab('dashboard');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_new_password: confirmPassword
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password. Double check old password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-2xl font-bold font-display text-surface-900">My Account</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-surface-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-2xl font-bold">
            {user?.first_name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-surface-900">{user?.full_name || `${user?.first_name} ${user?.last_name}`}</h2>
            <p className="text-sm text-surface-500">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('edit_profile')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'edit_profile'
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'border-surface-200 hover:bg-surface-50 text-surface-700'
            }`}
          >
            <Edit className="w-3.5 h-3.5" /> Edit Profile
          </button>
          <button
            onClick={() => setActiveTab('change_password')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'change_password'
                ? 'bg-primary-50 border-primary-200 text-primary-700'
                : 'border-surface-200 hover:bg-surface-50 text-surface-700'
            }`}
          >
            <Key className="w-3.5 h-3.5" /> Change Password
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Package, label: 'My Orders', desc: 'View order history and tracking', to: '/orders', color: 'bg-blue-50 text-blue-600' },
            { icon: Heart, label: 'Wishlist', desc: 'Saved items collection', to: '/wishlist', color: 'bg-red-50 text-red-600' },
            { icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', to: '/checkout', color: 'bg-green-50 text-green-600' },
            { icon: User, label: 'Personal Information', desc: 'Update details', onClick: () => setActiveTab('edit_profile'), color: 'bg-purple-50 text-purple-600' },
          ].map((item, i) => (
            item.to ? (
              <Link
                key={i}
                to={item.to}
                className="flex items-center justify-between p-5 bg-white border border-surface-200 rounded-2xl hover:shadow-md hover:border-surface-300 transition-all group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-900">{item.label}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-surface-600 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <button
                key={i}
                onClick={item.onClick}
                className="flex items-center justify-between p-5 bg-white border border-surface-200 rounded-2xl hover:shadow-md hover:border-surface-300 transition-all text-left w-full group"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-900">{item.label}</h3>
                    <p className="text-xs text-surface-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-surface-400 group-hover:text-surface-600 transition-transform group-hover:translate-x-1" />
              </button>
            )
          ))}
        </div>
      )}

      {activeTab === 'edit_profile' && (
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-surface-900">Update Profile Details</h3>
            <button onClick={() => setActiveTab('dashboard')} className="text-sm font-semibold text-primary-600">Back to Dashboard</button>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">First Name</label>
                <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="John" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">Last Name</label>
                <input required value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="Doe" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">Phone Number</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="+91 98765 43210" />
            </div>
            <button type="submit" disabled={isUpdating} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50">
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'change_password' && (
        <div className="bg-white border border-surface-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-surface-900">Change Password</h3>
            <button onClick={() => setActiveTab('dashboard')} className="text-sm font-semibold text-primary-600">Back to Dashboard</button>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">Current Password</label>
              <input required type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">New Password</label>
              <input required type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase mb-1.5">Confirm New Password</label>
              <input required type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3.5 py-2 border border-surface-200 rounded-xl text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={isChangingPassword} className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-sm transition-colors cursor-pointer disabled:opacity-50">
              {isChangingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
