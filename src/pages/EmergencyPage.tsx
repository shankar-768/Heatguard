import React, { useState } from 'react';
import {
  PhoneCall,
  Hospital,
  ShieldAlert,
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const EmergencyPage: React.FC<{ onNavigateToSafety?: () => void }> = ({ onNavigateToSafety }) => {
  const { user, updateUser } = useAuth();
  const [contacts, setContacts] = useState(
    user?.emergencyContacts || [
      { name: 'Dr. R. V. Sharma (Physician)', phone: '+91 866 244 5500', relation: 'Physician' },
      { name: 'Ananya Sai (Family)', phone: '+91 98481 99002', relation: 'Family' }
    ]
  );

  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: 'Family' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.phone) return;
    const updated = [...contacts, newContact];
    setContacts(updated);
    await updateUser({ emergencyContacts: updated });
    setNewContact({ name: '', phone: '', relation: 'Family' });
    setShowAddForm(false);
  };

  const handleRemoveContact = async (idx: number) => {
    const updated = contacts.filter((_, i) => i !== idx);
    setContacts(updated);
    await updateUser({ emergencyContacts: updated });
  };

  const nearbyHospitals = [
    { name: 'Government General Hospital (GGH)', distance: '1.2 km', phone: '+91 866 257 4331', status: '24x7 Heat Ward Open' },
    { name: 'Ramesh Hospitals Emergency Node', distance: '2.8 km', phone: '+91 866 247 9999', status: 'ICU & Hydration Ready' },
    { name: 'Manipal Super Speciality Center', distance: '4.1 km', phone: '+91 866 249 5555', status: 'Emergency Active' }
  ];

  const coolingCenters = [
    { name: 'Municipal Civic Center AC Shelter', location: 'Benz Circle', capacity: '150 People', status: 'Open Now' },
    { name: 'District Public Library Cooling Hub', location: 'Governorpet', capacity: '80 People', status: 'Open Now' },
    { name: 'RTC Central Terminal Air Shelter', location: 'Pandit Nehru Bus Station', capacity: '300 People', status: 'Open 24h' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#23415A]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#FF5C77] mb-1">
          <ShieldAlert className="w-4 h-4" />
          <span>NATIONAL EMERGENCY HEATWAVE DISASTER DISPATCH</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F4F8FC] tracking-tight">
          Emergency Help & Cooling Infrastructure
        </h1>
        <p className="text-sm text-[#9FB2C5] mt-1">
          Instant emergency hotlines, medical facility routing, and municipal cooling shelter access.
        </p>
      </div>

      {/* Hotline Action Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="tel:108"
          className="sih-card p-5 flex items-center justify-between border-[#FF5C77]/40 hover:border-[#FF5C77] transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5C77]/15 text-[#FF5C77]">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#9FB2C5] uppercase block">National Ambulance</span>
              <span className="text-xl font-black text-[#F4F8FC] font-mono">108</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#FF5C77]/20 text-[#FF5C77]">Call</span>
        </a>

        <a
          href="tel:112"
          className="sih-card p-5 flex items-center justify-between border-[#36C5F0]/40 hover:border-[#36C5F0] transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#36C5F0]/15 text-[#36C5F0]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#9FB2C5] uppercase block">National Emergency SOS</span>
              <span className="text-xl font-black text-[#F4F8FC] font-mono">112</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#36C5F0]/20 text-[#36C5F0]">Call</span>
        </a>

        <a
          href="tel:1078"
          className="sih-card p-5 flex items-center justify-between border-[#F4C95D]/40 hover:border-[#F4C95D] transition"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F4C95D]/15 text-[#F4C95D]">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#9FB2C5] uppercase block">Disaster Management</span>
              <span className="text-xl font-black text-[#F4F8FC] font-mono">1078</span>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F4C95D]/20 text-[#F4C95D]">Call</span>
        </a>
      </div>

      {/* Grid: Emergency Contacts & Nearby Hospitals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Personal Contacts (5 cols) */}
        <div className="lg:col-span-5 sih-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#23415A]">
            <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider">
              PERSONAL EMERGENCY CONTACTS
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="text-xs font-bold text-[#36C5F0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddContact} className="p-3 rounded-xl bg-[#17324A] border border-[#23415A] space-y-2">
              <input
                type="text"
                placeholder="Contact Name"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0D1B2A] border border-[#23415A] text-xs text-[#F4F8FC]"
              />
              <input
                type="tel"
                placeholder="Mobile Number"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0D1B2A] border border-[#23415A] text-xs text-[#F4F8FC]"
              />
              <button
                type="submit"
                className="w-full py-1.5 rounded-lg bg-[#36C5F0] text-[#07111F] font-bold text-xs"
              >
                Save Contact
              </button>
            </form>
          )}

          <div className="space-y-2">
            {contacts.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#17324A] border border-[#23415A] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#F4F8FC]">{c.name}</p>
                  <p className="text-[11px] font-mono text-[#36C5F0]">{c.phone}</p>
                </div>
                <button
                  onClick={() => handleRemoveContact(idx)}
                  className="text-[#9FB2C5] hover:text-[#FF5C77]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Nearby Hospitals (7 cols) */}
        <div className="lg:col-span-7 sih-card p-6 space-y-4">
          <div className="pb-3 border-b border-[#23415A]">
            <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
              <Hospital className="w-4 h-4 text-[#35D07F]" />
              NEARBY HEAT EMERGENCY WARDS & HOSPITALS
            </h3>
          </div>

          <div className="space-y-3">
            {nearbyHospitals.map((h, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-[#17324A] border border-[#23415A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-[#F4F8FC]">{h.name}</h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#35D07F]/20 text-[#35D07F] border border-[#35D07F]/30 font-bold">
                      {h.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#9FB2C5] mt-0.5 font-mono">Distance: {h.distance} • Hotline: {h.phone}</p>
                </div>

                <a
                  href={`tel:${h.phone}`}
                  className="px-3.5 py-1.5 rounded-xl bg-[#35D07F] hover:bg-[#2cb86d] text-[#07111F] text-xs font-bold flex items-center gap-1 self-start sm:self-center cursor-pointer"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Hospital</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cooling Centers & Safe Locations */}
      <div className="sih-card p-6 space-y-4">
        <div className="pb-3 border-b border-[#23415A]">
          <h3 className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-[#36C5F0]" />
            MUNICIPAL COOLING SHELTERS & SAFE LOCATIONS
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {coolingCenters.map((cc, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#17324A] border border-[#23415A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#36C5F0]/20 text-[#36C5F0]">
                  {cc.status}
                </span>
                <span className="text-[10px] text-[#9FB2C5] font-mono">Cap: {cc.capacity}</span>
              </div>
              <h4 className="text-xs font-bold text-[#F4F8FC]">{cc.name}</h4>
              <p className="text-[11px] text-[#9FB2C5] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#36C5F0]" /> {cc.location}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
