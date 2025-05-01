import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle } from "lucide-react";
const loginSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address"
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters"
  })
});
type LoginFormValues = z.infer<typeof loginSchema>;
const Login = () => {
  const {
    login,
    isAuthenticated,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  const handleSubmit = async (values: LoginFormValues) => {
    setLoginError(null);
    try {
      await login(values.email, values.password);
    } catch (error: any) {
      setLoginError(error.message || "Failed to login");
    }
  };
  const handleSignUp = async (values: LoginFormValues) => {
    setLoginError(null);
    try {
      setSignUpLoading(true);
      const {
        data,
        error
      } = await supabase.auth.signUp({
        email: values.email,
        password: values.password
      });
      if (error) {
        throw error;
      }
      if (data.user) {
        toast.success("Account created successfully! Please check your email to confirm your account.");
        setIsSignUp(false);
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      setLoginError(error.message || "Failed to create account");
      toast.error(error.message || "Failed to create account");
    } finally {
      setSignUpLoading(false);
    }
  };
  const handleDemoLogin = () => {
    form.setValue('email', 'demo@example.com');
    form.setValue('password', 'password123');
  };
  return <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">SMC LAMINATES</h1>
        <p className="text-muted-foreground">INVENTORY MANAGEMENT SYSTEM</p>
      </div>

      <Card className="w-full max-w-md border-border/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">{isSignUp ? "Create Account" : "Login"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up to get started" : "Enter your credentials to access your account"}
          </CardDescription>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(isSignUp ? handleSignUp : handleSubmit)}>
            <CardContent className="space-y-4">
              {loginError && <div className="bg-destructive/15 p-3 rounded-md flex items-start text-destructive">
                  <AlertCircle className="h-4 w-4 mr-2 mt-0.5" />
                  <span className="text-sm">{loginError}</span>
                </div>}
              
              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} autoFocus disabled={isLoading || signUpLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="password" render={({
              field
            }) => <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} disabled={isLoading || signUpLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <div className="text-xs text-muted-foreground">
                <p>
              </p>
                <p className="font-medium cursor-pointer hover:text-primary transition-colors mt-1" onClick={handleDemoLogin}>
              </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" type="submit" disabled={isLoading || signUpLoading}>
                {isLoading || signUpLoading ? <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full" />
                    {isSignUp ? "Creating account..." : "Logging in..."}
                  </div> : isSignUp ? "Sign Up" : "Log In"}
              </Button>

              <Button variant="link" type="button" onClick={() => setIsSignUp(!isSignUp)} disabled={isLoading || signUpLoading} className="text-muted-foreground hover:text-primary">
                {isSignUp ? "Already have an account? Log in" : "Don't have an account? Sign up"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>;
};
export default Login;