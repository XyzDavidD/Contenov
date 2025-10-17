"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ComingSoonGate() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated (stored in sessionStorage)
  useEffect(() => {
    const isAuth = sessionStorage.getItem("contenov_authenticated");
    if (isAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === "contenov2025") {
      setIsAuthenticated(true);
      sessionStorage.setItem("contenov_authenticated", "true");
    } else {
      setError("Incorrect password. Please try again.");
    }
    
    setIsLoading(false);
  };

  // If authenticated, don&apos;t show the gate
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center px-8 py-6">
          <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-secondary mb-2">
            Coming Soon
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Contenov is currently in early access
          </p>
        </CardHeader>
        
        <CardContent className="px-8 pb-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                Early Access Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-secondary"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-primary hover:opacity-90 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Access Demo"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have the password?{" "}
              <a 
                href="mailto:displayourvision@gmail.com" 
                className="text-primary hover:underline"
              >
                Contact us
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
