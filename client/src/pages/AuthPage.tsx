import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  const [searchParams] = new URLSearchParams(window.location.search);
  const defaultMode = searchParams.get('mode') === 'signup' ? false : true;
  const [isLogin, setIsLogin] = useState(defaultMode);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"startup" | "investor" | "valuer" | "consultant">("startup");
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthSuccess(false);

    try {
      if (isLogin) {
        const result = await login({ username, password });
        if (!result.ok) {
          throw new Error(result.message);
        }
      } else {
        const result = await register({ username, password, email, role });
        if (!result.ok) {
          throw new Error(result.message);
        }
      }
      // Show success animation
      setAuthSuccess(true);
      toast({
        title: isLogin ? "Login Successful" : "Registration Successful",
        description: isLogin ? "Welcome back!" : "Your account has been created.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Shake animation on error
      const form = document.querySelector('form');
      form?.classList.add('shake');
      setTimeout(() => form?.classList.remove('shake'), 500);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .shake {
          animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isLogin ? "Login" : "Register"}
                {authSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                )}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Welcome back! Please login to continue."
                  : "Create an account to get started."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="text-sm font-medium block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className={cn(
                        "pr-8",
                        username.length > 0 && "border-green-500"
                      )}
                      required
                    />
                    {username.length > 0 && (
                      <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="email" className="text-sm font-medium block mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={cn(
                          "pr-8",
                          email.includes('@') && "border-green-500"
                        )}
                        required
                      />
                      {email.includes('@') && (
                        <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="password" className="text-sm font-medium block mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mb-1"
                      required
                    />
                    {!isLogin && (
                      <>
                        <Progress value={passwordStrength} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {passwordStrength <= 25 && "Weak"}
                          {passwordStrength > 25 && passwordStrength <= 50 && "Fair"}
                          {passwordStrength > 50 && passwordStrength <= 75 && "Good"}
                          {passwordStrength > 75 && "Strong"}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="role" className="text-sm font-medium block mb-1">
                      Role
                    </label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      required
                    >
                      <option value="startup">Startup</option>
                      <option value="investor">Investor</option>
                      <option value="valuer">Valuer</option>
                      <option value="consultant">Consultant</option>
                    </select>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 className="h-4 w-4" />
                    </motion.div>
                  ) : authSuccess ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {isLogin ? "Logged In" : "Registered"}
                    </>
                  ) : (
                    isLogin ? "Login" : "Register"
                  )}
                </Button>

                <p className="text-center text-sm">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setAuthSuccess(false);
                    }}
                    className="text-primary hover:underline"
                  >
                    {isLogin ? "Register" : "Login"}
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}