import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SocialShare } from "@/components/ui/social-share";
import { useToast } from "@/hooks/use-toast";
import { Copy, Gift, Users, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";
import analytics from "@/lib/analytics";

export function ReferralSystem() {
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string>("");
  const [referralStats, setReferralStats] = useState({
    referrals: 0,
    creditsEarned: 0,
    rank: "Bronze"
  });

  useEffect(() => {
    const code = localStorage.getItem('referralCode');
    if (!code) {
      const newCode = generateReferralCode();
      localStorage.setItem('referralCode', newCode);
      setReferralCode(newCode);
    } else {
      setReferralCode(code);
    }

    const stats = localStorage.getItem('referralStats');
    if (stats) {
      setReferralStats(JSON.parse(stats));
    }
  }, []);

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'VAL-';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const getReferralUrl = () => {
    return `${window.location.origin}/?ref=${referralCode}`;
  };

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(getReferralUrl());
      toast({
        title: "Referral Link Copied!",
        description: "Share this link with friends to earn rewards",
      });
      analytics.event('referral_link_copied', { referral_code: referralCode });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const benefits = [
    { icon: Gift, text: "Earn 100 credits per referral", color: "text-purple-600" },
    { icon: Users, text: "Your friend gets 50 bonus credits", color: "text-blue-600" },
    { icon: Trophy, text: "Unlock premium features", color: "text-yellow-600" },
    { icon: Star, text: "Climb the leaderboard", color: "text-green-600" },
  ];

  return (
    <div className="container py-8 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Share & Earn Rewards
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Invite friends and unlock premium features together
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code or link with friends to earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                value={referralCode} 
                readOnly 
                className="font-mono text-lg"
              />
              <Button onClick={copyReferralLink} variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input 
                value={getReferralUrl()} 
                readOnly 
                className="text-sm"
              />
              <Button onClick={copyReferralLink}>
                Copy Link
              </Button>
            </div>

            <div className="pt-4">
              <p className="text-sm text-muted-foreground mb-3">Share on social media:</p>
              <SocialShare 
                title="Get Your Startup Valued for FREE with ValuationPro!"
                description={`Use my referral code ${referralCode} to get bonus credits and start your free valuation today! 🚀`}
                url={getReferralUrl()}
                size="lg"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {referralStats.referrals}
              </div>
              <div className="text-sm text-muted-foreground">
                Successful Referrals
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {referralStats.creditsEarned}
              </div>
              <div className="text-sm text-muted-foreground">
                Credits Earned
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {referralStats.rank}
              </div>
              <div className="text-sm text-muted-foreground">
                Current Rank
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Referral Benefits</CardTitle>
            <CardDescription>
              Here's what you and your friends get
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <benefit.icon className={`h-5 w-5 ${benefit.color} mt-0.5`} />
                  <span className="text-sm">{benefit.text}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg border">
          <h3 className="text-lg font-semibold mb-2">How It Works</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>1. Share your referral link or code with friends</li>
            <li>2. They sign up and complete their first valuation</li>
            <li>3. Both of you receive bonus credits automatically</li>
            <li>4. Unlock premium features as you earn more</li>
          </ol>
        </div>
      </motion.div>
    </div>
  );
}
