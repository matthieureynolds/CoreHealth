import { UserScore, ScoreBreakdown, LeaderboardData, LeaderboardSettings } from '../types/leaderboard';
import { UserProfile } from '../types';

export class LeaderboardService {
  private static instance: LeaderboardService;
  private mockData: UserScore[] = [];
  private friendGroups: any[] = [];

  static getInstance(): LeaderboardService {
    if (!LeaderboardService.instance) {
      LeaderboardService.instance = new LeaderboardService();
    }
    return LeaderboardService.instance;
  }

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock data for demonstration
    this.mockData = [
      {
        userId: '1',
        username: 'HealthMaster_23',
        dailyActivityScore: 95,
        recoveryScore: 88,
        labResultsScore: 92,
        overallScore: 92,
        rank: 1,
        improvement: 12
      },
      {
        userId: '2',
        username: 'FitLife_45',
        dailyActivityScore: 89,
        recoveryScore: 94,
        labResultsScore: 87,
        overallScore: 90,
        rank: 2,
        improvement: 8
      },
      {
        userId: '3',
        username: 'WellnessGuru',
        dailyActivityScore: 87,
        recoveryScore: 91,
        labResultsScore: 89,
        overallScore: 89,
        rank: 3,
        improvement: 15
      },
      {
        userId: '4',
        username: 'ActiveAmy',
        dailyActivityScore: 92,
        recoveryScore: 85,
        labResultsScore: 88,
        overallScore: 88,
        rank: 4,
        improvement: 5
      },
      {
        userId: '5',
        username: 'HealthyHabits',
        dailyActivityScore: 85,
        recoveryScore: 89,
        labResultsScore: 91,
        overallScore: 88,
        rank: 5,
        improvement: 20
      }
    ];

    // Mock friend groups
    this.friendGroups = [
      {
        id: '1',
        name: 'Workout Buddies',
        members: this.mockData.slice(0, 3)
      },
      {
        id: '2',
        name: 'Family',
        members: this.mockData.slice(1, 4)
      }
    ];
  }

  calculateUserScore(profile: UserProfile, healthData: any): ScoreBreakdown {
    // Calculate Daily Activity Score (0-100)
    const steps = healthData?.steps || 0;
    const workouts = healthData?.workouts || 0;
    const activeMinutes = healthData?.activeMinutes || 0;
    const goalCompletion = Math.min((steps / 10000) * 100, 100);

    const dailyActivityScore = Math.round(
      (Math.min(steps / 10000, 1) * 40) +
      (Math.min(workouts / 5, 1) * 30) +
      (Math.min(activeMinutes / 60, 1) * 20) +
      (goalCompletion / 100 * 10)
    );

    // Calculate Recovery Score (0-100)
    const sleepQuality = healthData?.sleepQuality || 70;
    const sleepDuration = healthData?.sleepDuration || 7;
    const restDays = healthData?.restDays || 1;
    const stressManagement = healthData?.stressLevel || 50;

    const recoveryScore = Math.round(
      (sleepQuality / 100 * 30) +
      (Math.min(sleepDuration / 8, 1) * 25) +
      (Math.min(restDays / 2, 1) * 20) +
      ((100 - stressManagement) / 100 * 25)
    );

    // Calculate Lab Results Score (0-100)
    const bloodPressure = healthData?.bloodPressure || 120;
    const cholesterol = healthData?.cholesterol || 200;
    const bloodSugar = healthData?.bloodSugar || 100;

    const labResultsScore = Math.round(
      (Math.max(0, 140 - bloodPressure) / 40 * 40) +
      (Math.max(0, 240 - cholesterol) / 40 * 30) +
      (Math.max(0, 120 - bloodSugar) / 20 * 30)
    );

    // Calculate Overall Score
    const overallScore = Math.round(
      (dailyActivityScore * 0.4) +
      (recoveryScore * 0.35) +
      (labResultsScore * 0.25)
    );

    return {
      dailyActivity: {
        steps,
        workouts,
        activeMinutes,
        goalCompletion,
        score: dailyActivityScore
      },
      recovery: {
        sleepQuality,
        sleepDuration,
        restDays,
        stressManagement,
        score: recoveryScore
      },
      labResults: {
        bloodPressure,
        cholesterol,
        bloodSugar,
        otherMarkers: 0,
        score: labResultsScore
      },
      overall: overallScore
    };
  }

  async getLeaderboardData(
    period: 'monthly' | 'overall',
    settings: LeaderboardSettings
  ): Promise<LeaderboardData> {
    // In a real app, this would fetch from your backend
    // For now, return mock data
    
    const friends = this.friendGroups[0]?.members || [];
    const global = this.mockData;
    
    // Calculate user's rank
    const userRank = {
      friends: Math.floor(Math.random() * friends.length) + 1,
      global: Math.floor(Math.random() * 1000) + 1,
      totalFriends: friends.length,
      totalGlobal: global.length
    };

    return {
      friends: friends.slice(0, 10),
      global: global.slice(0, 10),
      userRank,
      period,
      lastUpdated: new Date().toISOString()
    };
  }

  async getUserScoreBreakdown(profile: UserProfile, healthData: any): Promise<ScoreBreakdown> {
    return this.calculateUserScore(profile, healthData);
  }

  async getFriendGroups(): Promise<any[]> {
    return this.friendGroups;
  }

  async updateLeaderboardSettings(settings: LeaderboardSettings): Promise<void> {
    // In a real app, save to backend
    console.log('Leaderboard settings updated:', settings);
  }
}

export const leaderboardService = LeaderboardService.getInstance();
