'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown, Plus, Check } from 'lucide-react';
import { useBranding } from '@/lib/branding/context';
import { useAuth } from '@/lib/auth/context';
import { getUserCompanies, switchCompany } from '@/lib/whitelabel/company-service';
import type { Company } from '@/lib/whitelabel/server';

interface CompanyWithRole extends Company {
  user_role?: string;
}

export default function CompanySwitcher() {
  const router = useRouter();
  const { user } = useAuth();
  const { branding, company: currentCompany } = useBranding();
  const [companies, setCompanies] = useState<CompanyWithRole[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadCompanies = useCallback(async () => {
    if (!user?.id) return;
    const userCompanies = await getUserCompanies(user.id);
    setCompanies(userCompanies);
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadCompanies();
    }
  }, [loadCompanies, user?.id]);

  const handleSwitch = async (companyId: string) => {
    if (!user?.id || companyId === currentCompany?.id) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      await switchCompany(user.id, companyId);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to switch company:', error);
    } finally {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const { colors } = branding;
  if (companies.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-100 w-full"
        style={{ color: colors.text }}
      >
        <Building2 className="w-4 h-4" style={{ color: colors.textMuted }} />
        <span className="flex-1 text-left truncate">
          {currentCompany?.name || 'Select Company'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: colors.textMuted }} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 py-1 bg-white rounded-lg shadow-lg border z-50" style={{ borderColor: `${colors.secondary}20` }}>
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textMuted }}>
              Your Companies
            </div>
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSwitch(company.id)}
                className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${company.primary_color}15` }}>
                  {company.logo_url ? (
                    <Image
                      src={company.logo_url}
                      alt={`${company.name} logo`}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <Building2 className="w-4 h-4" style={{ color: company.primary_color }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: colors.text }}>{company.name}</p>
                  <p className="text-xs capitalize" style={{ color: colors.textMuted }}>{company.user_role}</p>
                </div>
                {company.id === currentCompany?.id && <Check className="w-4 h-4 flex-shrink-0" style={{ color: colors.primary }} />}
              </button>
            ))}
            <div className="border-t mt-1 pt-1" style={{ borderColor: `${colors.secondary}15` }}>
              <button
                onClick={() => router.push('/signup/company')}
                className="flex items-center gap-2 w-full px-3 py-2 text-left hover:bg-slate-50 transition-colors"
              >
                <Plus className="w-4 h-4" style={{ color: colors.primary }} />
                <span className="text-sm font-medium" style={{ color: colors.primary }}>Create New Company</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
