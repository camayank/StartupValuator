import { useEffect } from 'react';
import analytics from '@/lib/analytics';

export function useReferralTracking() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      const myCode = localStorage.getItem('referralCode');
      const alreadyReferred = localStorage.getItem('referredBy');
      
      if (!alreadyReferred && refCode !== myCode) {
        localStorage.setItem('referredBy', refCode);
        analytics.trackReferral(refCode);
        
        const referrerStats = localStorage.getItem(`referrer_${refCode}_stats`);
        if (referrerStats) {
          const stats = JSON.parse(referrerStats);
          stats.referrals += 1;
          stats.creditsEarned += 100;
          if (stats.referrals >= 10) stats.rank = "Silver";
          if (stats.referrals >= 50) stats.rank = "Gold";
          if (stats.referrals >= 100) stats.rank = "Platinum";
          localStorage.setItem(`referrer_${refCode}_stats`, JSON.stringify(stats));
        } else {
          localStorage.setItem(`referrer_${refCode}_stats`, JSON.stringify({
            referrals: 1,
            creditsEarned: 100,
            rank: "Bronze"
          }));
        }
      }
    }
  }, []);
}
