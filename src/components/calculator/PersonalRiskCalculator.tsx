import React, { useState } from 'react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import { PersonalRiskInput, PersonalRiskResult, UserCategory } from '../../types';
import { heatRiskService } from '../../services/heatRiskService';
import { RiskBadge } from '../common/RiskBadge';
import {
  Calculator,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const PersonalRiskCalculator: React.FC = () => {
  const { currentLocation } = useLocation();
  const { user } = useAuth();

  const [input, setInput] = useState<PersonalRiskInput>({
    ageGroup: '18-40',
    activityLevel: 'Heavy',
    exposure: 'Direct Sun',
    duration: '1-2 hours',
    userCategory: user?.userCategory || 'Outdoor Worker',
    hasMedicalConditions: false
  });

  const [result, setResult] = useState<PersonalRiskResult | null>(() =>
    heatRiskService.calculatePersonalRisk(
      {
        ageGroup: '18-40',
        activityLevel: 'Heavy',
        exposure: 'Direct Sun',
        duration: '1-2 hours',
        userCategory: user?.userCategory || 'Outdoor Worker',
        hasMedicalConditions: false
      },
      currentLocation.thermalStressScore
    )
  );

  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const res = heatRiskService.calculatePersonalRisk(input, currentLocation.thermalStressScore);
      setResult(res);
      setIsCalculating(false);
    }, 250);
  };

  const userCategories: UserCategory[] = [
    'Outdoor Worker',
    'Farmer',
    'Delivery Agent',
    'Student',
    'Elderly',
    'General Public',
    'Other'
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form (7 Columns) */}
        <div className="lg:col-span-7 warm-card rounded-2xl p-5 sm:p-6 border border-stone-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Your Vulnerability Profile</h3>
                <p className="text-xs text-stone-400">Station baseline: {currentLocation.name} ({currentLocation.thermalStressScore}/100)</p>
              </div>
            </div>
          </div>

          <div className="space-y-3.5">
            {/* Age Group */}
            <div>
              <label className="text-xs font-bold text-stone-300 mb-1.5 block">
                1. Age Group
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Under 18', '18-40', '41-60', '60+'] as const).map((age) => (
                  <button
                    key={age}
                    type="button"
                    onClick={() => setInput({ ...input, ageGroup: age })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      input.ageGroup === age
                        ? 'bg-[#E05822] text-white border-orange-500'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {age}
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level */}
            <div>
              <label className="text-xs font-bold text-stone-300 mb-1.5 block">
                2. Physical Exertion Level
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['Resting', 'Light', 'Moderate', 'Heavy'] as const).map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setInput({ ...input, activityLevel: act })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      input.activityLevel === act
                        ? 'bg-[#E05822] text-white border-orange-500'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            {/* Sun Exposure */}
            <div>
              <label className="text-xs font-bold text-stone-300 mb-1.5 block">
                3. Environmental Exposure
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Indoor', 'Outdoor Shaded', 'Direct Sun'] as const).map((exp) => (
                  <button
                    key={exp}
                    type="button"
                    onClick={() => setInput({ ...input, exposure: exp })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      input.exposure === exp
                        ? 'bg-[#E05822] text-white border-orange-500'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Exposure Duration */}
            <div>
              <label className="text-xs font-bold text-stone-300 mb-1.5 block">
                4. Continuous Outdoor Duration
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {(['<30 min', '30-60 min', '1-2 hours', '2+ hours'] as const).map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setInput({ ...input, duration: dur })}
                    className={`py-2 px-2.5 rounded-lg text-xs font-bold transition cursor-pointer border ${
                      input.duration === dur
                        ? 'bg-[#E05822] text-white border-orange-500'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    {dur}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Dropdown & Health Checkbox */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-bold text-stone-300 mb-1 block">
                  5. Primary Occupation
                </label>
                <select
                  value={input.userCategory}
                  onChange={(e) => setInput({ ...input, userCategory: e.target.value as UserCategory })}
                  className="w-full bg-stone-900 border border-stone-700 text-stone-200 text-xs rounded-lg px-3 py-2 focus:outline-hidden focus:border-orange-500 font-semibold"
                >
                  {userCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer hover:bg-stone-800 transition">
                  <input
                    type="checkbox"
                    checked={input.hasMedicalConditions}
                    onChange={(e) => setInput({ ...input, hasMedicalConditions: e.target.checked })}
                    className="w-3.5 h-3.5 rounded text-orange-500 bg-stone-950 border-stone-700"
                  />
                  <span className="text-xs font-semibold text-stone-200">
                    Pre-existing health condition
                  </span>
                </label>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full py-2.5 rounded-xl bg-[#E05822] hover:bg-[#D04D18] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                {isCalculating ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>{isCalculating ? 'Calculating...' : 'Recalculate My Heat Strain'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Output Assessment Card (5 Columns) */}
        <div className="lg:col-span-5 warm-card rounded-2xl p-5 sm:p-6 border border-stone-800 space-y-4 flex flex-col justify-between">
          {result ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  Personal Assessment
                </span>
                <RiskBadge level={result.riskLevel} size="md" />
              </div>

              {/* Large Score Card */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-stone-400 font-semibold block">Personal Risk Score</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-4xl font-black font-mono text-white">
                      {result.score}
                    </span>
                    <span className="text-stone-400 font-bold text-xs">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-stone-300 block">Vulnerability</span>
                  <span className="text-xs text-orange-400 font-bold block mt-0.5">
                    {result.vulnerabilityIndex}% relative index
                  </span>
                </div>
              </div>

              {/* Contributing Factors */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Key Contributing Factors
                </h4>
                {result.keyContributingFactors.map((f, i) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-900 border border-stone-800">
                    <span className="text-stone-300 font-medium">{f.factor}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      f.impact === 'Severe'
                        ? 'bg-red-500/20 text-red-300'
                        : f.impact === 'High'
                        ? 'bg-orange-500/20 text-orange-300'
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {f.impact}
                    </span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-1.5 pt-1">
                <h4 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Prescribed Actions
                </h4>
                <ul className="space-y-1 text-xs text-stone-300">
                  {result.tailoredActions.map((act, i) => (
                    <li key={i} className="flex items-start gap-1.5 p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
                      <span className="w-4 h-4 rounded bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-stone-400 text-xs">
              Select parameters to calculate your risk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
