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
  CardFooter,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, AlertCircle, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthPage() {
  // Always start with login view regardless of URL params
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"startup" | "investor" | "valuer" | "consultant">("startup");
  const { login, register } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
  }>({});

  // Password strength calculation with feedback
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    let feedback = [];

    if (password.length >= 8) {
      strength += 25;
    } else {
      feedback.push("Password should be at least 8 characters");
    }
    if (password.match(/[A-Z]/)) {
      strength += 25;
    } else {
      feedback.push("Include uppercase letters");
    }
    if (password.match(/[0-9]/)) {
      strength += 25;
    } else {
      feedback.push("Include numbers");
    }
    if (password.match(/[^A-Za-z0-9]/)) {
      strength += 25;
    } else {
      feedback.push("Include special characters");
    }

    return { strength, feedback };
  };

  const validateFields = () => {
    const errors: typeof fieldErrors = {};

    if (!username) {
      errors.username = "Username is required";
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    }

    if (!isLogin) {
      if (!email) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = "Please enter a valid email address";
      }
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (!isLogin && password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const { strength: passwordStrength, feedback: passwordFeedback } = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) {
      toast({
        title: "Validation Error",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAuthSuccess(false);

    try {
      if (isLogin) {
        const result = await login({ username, password });
        if (!result.ok) {
          throw new Error(result.message || "Invalid username or password");
        }
      } else {
        const result = await register({ username, password, email, role });
        if (!result.ok) {
          throw new Error(result.message || "Registration failed. Please try again.");
        }
      }
      setAuthSuccess(true);
      toast({
        title: isLogin ? "Login Successful" : "Registration Successful",
        description: isLogin ? "Welcome back!" : "Your account has been created successfully.",
      });

      // Redirect after successful auth
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (error: any) {
      // Show error in toast and specific field if applicable
      const errorMessage = error.message.toLowerCase();
      if (errorMessage.includes("username")) {
        setFieldErrors(prev => ({ ...prev, username: error.message }));
      } else if (errorMessage.includes("password")) {
        setFieldErrors(prev => ({ ...prev, password: error.message }));
      } else if (errorMessage.includes("email")) {
        setFieldErrors(prev => ({ ...prev, email: error.message }));
      }

      toast({
        title: "Authentication Error",
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
      <style>
        {`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
          }
          .shake {
            animation: shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
          }
        `}
      </style>
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "register"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-md"
        >
          <Card className="relative overflow-hidden">
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">
                  {isLogin ? "Welcome back" : "Create account"}
                </CardTitle>
                {authSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-green-500"
                  >
                    <Check className="h-5 w-5" />
                  </motion.div>
                )}
              </div>
              <CardDescription className="text-sm text-muted-foreground">
                {isLogin
                  ? "Enter your credentials to access your account"
                  : "Create your account to get started"}
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
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setFieldErrors(prev => ({ ...prev, username: undefined }));
                      }}
                      className={cn(
                        "pr-8",
                        fieldErrors.username ? "border-destructive" : username.length > 0 ? "border-green-500" : ""
                      )}
                      required
                    />
                    {username.length > 0 && !fieldErrors.username && (
                      <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                    )}
                  </div>
                  {fieldErrors.username && (
                    <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {fieldErrors.username}
                    </p>
                  )}
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setFieldErrors(prev => ({ ...prev, email: undefined }));
                        }}
                        className={cn(
                          "pr-8",
                          fieldErrors.email ? "border-destructive" : email.includes('@') ? "border-green-500" : ""
                        )}
                        required
                      />
                      {email.includes('@') && !fieldErrors.email && (
                        <Check className="absolute right-2 top-2.5 h-4 w-4 text-green-500" />
                      )}
                    </div>
                    {fieldErrors.email && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.email}
                      </p>
                    )}
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
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setFieldErrors(prev => ({ ...prev, password: undefined }));
                      }}
                      className={cn(
                        "mb-1",
                        fieldErrors.password && "border-destructive"
                      )}
                      required
                    />
                    {fieldErrors.password && (
                      <p className="text-sm text-destructive mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {fieldErrors.password}
                      </p>
                    )}
                    {!isLogin && (
                      <>
                        <Progress value={passwordStrength} className="h-1 mt-2" />
                        <div className="mt-2">
                          {passwordStrength < 100 && (
                            <Alert variant="default" className="bg-muted/50">
                              <AlertDescription className="text-xs">
                                Password requirements:
                                <ul className="list-disc list-inside mt-1">
                                  {passwordFeedback.map((feedback, index) => (
                                    <li key={index}>{feedback}</li>
                                  ))}
                                </ul>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="role" className="text-sm font-medium block mb-1">
                      I am a...
                    </label>
                    <select
                      id="role"
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      required
                    >
                      <option value="startup">Startup Founder</option>
                      <option value="investor">Investor</option>
                      <option value="valuer">Valuation Expert</option>
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
                    <>
                      {isLogin ? "Sign In" : "Create Account"}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {isLogin ? "New to StartupValuator?" : "Already have an account?"}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setAuthSuccess(false);
                  setFieldErrors({});
                }}
                className="w-full"
              >
                {isLogin ? "Create an Account" : "Sign In"}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}