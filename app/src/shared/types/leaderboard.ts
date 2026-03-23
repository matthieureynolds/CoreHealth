export interface UserScore {
  userId: string;
  username: string;
  avatar?: string;
  dailyActivityScore: number;
  recoveryScore: number;
  labResultsScore: number;
  overallScore: number;
  rank: number;
  improvement: number; // Percentage change from previous period
}

export interface FriendGroup {
  id: string;
  name: string;
  members: UserScore[];
  createdDate: string;
  isPrivate: boolean;
}

export interface LeaderboardData {
  friends: UserScore[];
  global: UserScore[];
  userRank: {
    friends: number;
    global: number;
    totalFriends: number;
    totalGlobal: number;
  };
  period: 'monthly' | 'overall';
  lastUpdated: string;
}

export interface LeaderboardSettings {
  showRankingToFriends: boolean;
  showRankingGlobally: boolean;
  includeInMonthly: boolean;
  includeInOverall: boolean;
  ageFilter?: {
    min: number;
    max: number;
  };
  locationFilter?: string;
}

export interface ScoreBreakdown {
  dailyActivity: {
    steps: number;
    workouts: number;
    activeMinutes: number;
    goalCompletion: number;
    score: number;
  };
  recovery: {
    sleepQuality: number;
    sleepDuration: number;
    restDays: number;
    stressManagement: number;
    score: number;
  };
  labResults: {
    bloodPressure: number;
    cholesterol: number;
    bloodSugar: number;
    otherMarkers: number;
    score: number;
  };
  overall: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedDate: string;
  category: 'daily' | 'weekly' | 'monthly' | 'overall';
  points: number;
}
