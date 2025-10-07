declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const analytics = {
  pageView: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: url,
      });
    }
  },

  event: (action: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, params);
    }
  },

  trackShare: (platform: string, url?: string) => {
    analytics.event('share', {
      method: platform,
      content_type: 'platform_share',
      item_id: url || window.location.href,
    });
  },

  trackValuationStart: () => {
    analytics.event('valuation_start', {
      category: 'engagement',
      label: 'Valuation Calculator Started',
    });
  },

  trackValuationComplete: (industry?: string, value?: number) => {
    analytics.event('valuation_complete', {
      category: 'conversion',
      label: 'Valuation Completed',
      industry: industry,
      value: value,
    });
  },

  trackReferral: (referralCode: string) => {
    analytics.event('referral_used', {
      category: 'growth',
      label: 'Referral Code Used',
      referral_code: referralCode,
    });
  },

  trackSignup: (method: string) => {
    analytics.event('sign_up', {
      method: method,
    });
  },

  trackDownload: (reportType: string) => {
    analytics.event('download', {
      category: 'engagement',
      label: 'Report Downloaded',
      report_type: reportType,
    });
  },

  trackCTA: (ctaName: string, location: string) => {
    analytics.event('cta_click', {
      category: 'engagement',
      label: ctaName,
      location: location,
    });
  },
};

export default analytics;
