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

  
}
