import React from 'react';
import {
  Droplets,
  Sun,
  Activity,
  AlertOctagon,
  Users,
  Briefcase,
  HeartPulse,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

export const SafetyPage: React.FC = () => {
  const guidanceCards = [
    {
      id: 'hydration',
      title: 'Hydration Protocols',
      icon: Droplets,
      color: 'text-[#36C5F0]',
      items: [
        'Drink 250ml of electrolyte fluid or water every 20 minutes during work.',
        'Avoid caffeine, high-sugar beverages, and alcohol which accelerate dehydration.',
        'Pre-hydrate with 500ml water before stepping into peak afternoon heat.'
      ]
    },
    {
      id: 'outdoor-safety',
      title: 'Outdoor Safety & Shade',
      icon: Sun,
      color: 'text-[#F4C95D]',
      items: [
        'Schedule strenuous outdoor labor before 11:00 AM or after 4:30 PM.',
        'Use wide-brimmed hats, breathable UV-reflective apparel, and sunscreen.',
        'Take obligatory 15-minute shade breaks in ventilated cooling zones every hour.'
      ]
    },
    {
      id: 'heat-exhaustion',
      title: 'Heat Exhaustion Care',
      icon: Activity,
      color: 'text-[#7C83FD]',
      items: [
        'Symptoms: Heavy sweating, dizziness, nausea, rapid pulse, weakness.',
        'Immediate Action: Move to cool shaded shelter, loosen tight clothing.',
        'Sip cool water slowly and apply damp towels to forehead and neck.'
      ]
    },
    {
      id: 'heat-stroke',
      title: 'Heat Stroke Warning Signs',
      icon: AlertOctagon,
      color: 'text-[#FF5C77]',
      items: [
        'Symptoms: Body temp >40°C (104°F), confusion, slurred speech, dry hot skin.',
        'CRITICAL EMERGENCY: Call emergency services (+91 108 / +91 112) immediately.',
        'Cool body rapidly using ice packs or cold water immersion while awaiting transport.'
      ]
    },
    {
      id: 'vulnerable-groups',
      title: 'Children & Elderly Care',
      icon: Users,
      color: 'text-[#35D07F]',
      items: [
        'Ensure seniors remain in air-conditioned or well-ventilated indoor spaces.',
        'Never leave infants, children, or pets inside parked vehicles for any duration.',
        'Monitor elderly family members twice daily for confusion or thermoregulation loss.'
      ]
    },
    {
      id: 'outdoor-workers',
      title: 'Outdoor Worker Protocols',
      icon: Briefcase,
      color: 'text-[#36C5F0]',
      items: [
        'Implement buddy-system monitoring to catch early thermal confusion symptoms.',
        'Erect temporary shading structures over active construction & field work sites.',
        'Provide accessible cold drinking water stations within 50 meters of work zones.'
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="pb-4 border-b border-[#23415A]">
        <div className="flex items-center gap-2 text-xs font-bold text-[#36C5F0] mb-1">
          <HeartPulse className="w-4 h-4" />
          <span>NATIONAL DISASTER MANAGEMENT AUTHORITY ADVISORIES</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#F4F8FC] tracking-tight">
          Public Health & Heat Safety Guidance
        </h1>
        <p className="text-sm text-[#9FB2C5] mt-1">
          Actionable protocols and medical countermeasures for severe thermal stress mitigation.
        </p>
      </div>

      {/* Grid of 6 Clean Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guidanceCards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.id} className="sih-card p-6 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 pb-3 border-b border-[#23415A]">
                  <div className={`p-2.5 rounded-xl bg-[#17324A] border border-[#23415A] ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#F4F8FC]">{card.title}</h3>
                </div>

                <ul className="mt-4 space-y-2.5">
                  {card.items.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#9FB2C5] leading-relaxed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#35D07F] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-[#23415A] text-[10px] text-[#9FB2C5] font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-[#36C5F0]" />
                <span>NDMA Heatwave Standard Protocol</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
