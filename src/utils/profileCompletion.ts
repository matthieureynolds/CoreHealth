import { User, UserProfile } from '../types';

export function calculateProfileCompletion(user?: Partial<User> | null, profile?: Partial<UserProfile> | null): number {
  const checks: Array<boolean> = [
    !!user?.firstName,
    !!user?.surname,
    !!user?.photoURL,
    typeof profile?.age === 'number' && (profile?.age as number) > 0,
    !!profile?.gender,
    typeof profile?.height === 'number' && (profile?.height as number) > 0,
    typeof profile?.weight === 'number' && (profile?.weight as number) > 0,
    (profile?.medicalHistory?.length || 0) > 0,
    (profile?.medications?.length || 0) > 0,
    (profile?.allergies?.length || 0) > 0,
    (profile?.vaccinations?.length || 0) > 0,
  ];

  const completed = checks.filter(Boolean).length;
  const total = checks.length;
  const percentage = Math.round((completed / total) * 100);
  return Math.max(0, Math.min(100, percentage));
}


