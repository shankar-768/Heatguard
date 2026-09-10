import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserCategory } from '../types';
import { LocationSearchInput } from '../components/common/LocationSearchInput';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ShieldCheck,
  Save,
  CheckCircle2,
  HeartPulse,
  Plus,
  Trash2
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || 'Sri Krishna Sai',
    email: user?.email || 'krishna.sai@heatguard.ai',
    phone: user?.phone || '+91 98480 22338',
    location: user?.location || 'Vijayawada',
    userCategory: (user?.userCategory || 'Outdoor Worker') as UserCategory
  });

  const [contacts, setContacts] = useState(
    user?.emergencyContacts || [
      { name: 'Dr. R. V. Sharma (Physician)', phone: '+91 866 244 5500', relation: 'Physician' },
      { name: 'Ananya Sai (Family)', phone: '+91 98481 99002', relation: 'Family' }
    ]
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUser({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      userCategory: formData.userCategory,
      emergencyContacts: contacts
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleAddContact = () => {
    setContacts([...contacts, { name: '', phone: '', relation: 'Family' }]);
  };

  const handleRemoveContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const userCategories: UserCategory[] = [
    'General Public',
    'Student',
    'Outdoor Worker',
    'Farmer',
    'Elderly',
    'Delivery Agent',
    'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-orange-400 mb-1">
          <User className="w-4 h-4 text-orange-400" />
          <span>Account & Health Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          User Profile & Risk Parameters
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Manage your personal identifiers, geographic station, and emergency contacts.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card Header with Avatar */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-amber-600 flex items-center justify-center text-slate-950 font-black text-3xl shadow-xl shadow-orange-950/40">
            {formData.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-white">{formData.name}</h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="text-orange-400 font-bold">{formData.userCategory}</span>
              <span>•</span>
              <span>{formData.location}, AP</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Active Early Warning Receiver</span>
            </div>
          </div>
        </div>

        {/* Core Personal Information */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-5">
          <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
            Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Mobile Number (SMS Alerts)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">Primary Location</label>
              <LocationSearchInput
                currentValue={formData.location}
                onSelectLocation={(loc) => setFormData({ ...formData, location: loc.displayName || loc.name })}
                placeholder="Search city, town or location..."
                showGpsOption
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">User Vulnerability Group</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <select
                  value={formData.userCategory}
                  onChange={(e) => setFormData({ ...formData, userCategory: e.target.value as UserCategory })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-hidden focus:border-orange-500 font-semibold"
                >
                  {userCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contacts Section */}
        <div className="glass-panel rounded-3xl p-6 sm:p-8 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-red-400" />
                Emergency SOS Contacts
              </h3>
              <p className="text-xs text-slate-400">
                Contacts alerted in case of an extreme thermal stress or heat stroke SOS event
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddContact}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-orange-400 border border-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Contact</span>
            </button>
          </div>

          <div className="space-y-3">
            {contacts.map((c, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    placeholder="Contact name"
                    value={c.name}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[i].name = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-4">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={c.phone}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[i].phone = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Relation"
                    value={c.relation}
                    onChange={(e) => {
                      const updated = [...contacts];
                      updated[i].relation = e.target.value;
                      setContacts(updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-1 text-right">
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(i)}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved Successfully!
            </span>
          )}
          <button
            type="submit"
            className="px-7 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-sm shadow-xl shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
