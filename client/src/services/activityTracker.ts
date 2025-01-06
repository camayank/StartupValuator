interface ActivityMetadata {
  stepsCompleted?: number;
  [key: string]: any;
}

export class ActivityTracker {
  static async trackActivity(userId: number, activityType: string, metadata: ActivityMetadata = {}) {
    try {
      await fetch('/api/activities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          activityType,
          metadata,
        }),
        credentials: 'include',
      });
    } catch (error) {
      console.error('Failed to track activity:', error);
    }
  }
}
