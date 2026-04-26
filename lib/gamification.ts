export const BADGES = {
    FIRST_LOGIN: {
        id: 'first_login',
        name: 'Explorer',
        description: 'Logged into Arqam Academy for the first time.',
        icon: 'FiGlobe',
        points: 10,
    },
    PERFECT_SCORE: {
        id: 'perfect_score',
        name: 'Perfectionist',
        description: 'Achieved a 100% score on an exam.',
        icon: 'FiTarget',
        points: 50,
    },
    COURSE_COMPLETED: {
        id: 'course_completed',
        name: 'Graduate',
        description: 'Successfully completed a full course.',
        icon: 'FiAward',
        points: 100,
    },
    TRACK_MASTER: {
        id: 'track_master',
        name: 'Track Master',
        description: 'Finished all courses within a specific learning track.',
        icon: 'FiCrown',
        points: 500,
    },
    FAST_LEARNER: {
        id: 'fast_learner',
        name: 'Fast Learner',
        description: 'Completed 3 lessons in a single day.',
        icon: 'FiZap',
        points: 30,
    },
};

// Calculate how many points are required for a specific level
export function calculateRequiredPointsForLevel(level: number): number {
    if (level <= 1) return 0;
    // Use algorithmic scaling for levels
    // L1: 0, L2: 100, L3: 300, L4: 600, L5: 1000...
    return Math.floor(100 * (level * (level - 1)) / 2);
}

// Calculate the level based on total points
export function calculateLevelFromPoints(points: number): number {
    let level = 1;
    while (points >= calculateRequiredPointsForLevel(level + 1)) {
        level++;
    }
    return level;
}

// Get the progress percentage towards the next level
export function getNextLevelProgress(points: number, currentLevel: number): number {
    const currentLevelPoints = calculateRequiredPointsForLevel(currentLevel);
    const nextLevelPoints = calculateRequiredPointsForLevel(currentLevel + 1);

    const pointsInCurrentLevel = points - currentLevelPoints;
    const pointsNeededForNextLevel = nextLevelPoints - currentLevelPoints;

    return Math.min(100, Math.max(0, (pointsInCurrentLevel / pointsNeededForNextLevel) * 100));
}
