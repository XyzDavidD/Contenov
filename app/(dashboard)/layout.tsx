"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  Download, 
  HelpCircle, 
  Menu, 
  ChevronDown,
  User,
  Settings,
  CreditCard,
  LogOut,
  Loader2
} from "lucide-react";
import Logo from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/hooks/use-auth";
import { useCredits } from "@/lib/hooks/use-credits";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Find Blogs", href: "/find", icon: Search },
  { name: "My Exports", href: "/exports", icon: Download },
];

const resources = [
  { name: "Help Center", href: "/resources", icon: HelpCircle },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { credits, planType, loading: loadingCredits } = useCredits();
  const supabase = createClientComponentClient();
  
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (user?.user_metadata?.name) {
      return user.user_metadata.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  if (authLoading || loadingCredits) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F7F7]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF1B6B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b border-[#E3E8EF]">
        <div className="flex h-full items-center justify-between px-6">
          {/* Left: Menu + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              className="h-8 w-8"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Logo />
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-10 pr-4 h-9"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ⌘K
              </div>
            </div>
          </div>

          {/* Right: Credits + Profile */}
          <div className="flex items-center gap-4">
            {/* Credits */}
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg",
              credits !== null && credits < 5 ? "bg-red-100" : "bg-gradient-primary/10"
            )}>
              <div className="w-4 h-4 rounded-full bg-gradient-primary flex items-center justify-center">
                <span className="text-xs text-white font-bold">C</span>
              </div>
              <span className="text-sm font-medium text-secondary">
                {credits !== null ? `${credits} credits` : 'Loading...'}
              </span>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-8 px-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-gradient-primary text-white text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <div className="text-sm font-medium text-secondary">
                      {user?.user_metadata?.name || 'User'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.email}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <User className="mr-2 h-4 w-4" />
                    Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed top-16 bottom-0 left-0 z-40 bg-white border-r border-[#E3E8EF] transition-all duration-300",
          sidebarExpanded ? "w-60" : "w-16"
        )}>
          <div className="flex h-full flex-col">
            {/* Main Navigation */}
            <nav className="flex-1 p-4 pt-6">
              {/* Main Section */}
              <div className="mb-6">
                <div className={cn(
                  "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                  sidebarExpanded ? "px-3" : "text-center text-[10px]"
                )}>
                  {sidebarExpanded ? "Main" : "M"}
                </div>
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                          isActive
                            ? "bg-gradient-primary/10 text-primary border-l-3 border-gradient-primary"
                            : "text-muted-foreground hover:bg-gray-100 hover:text-secondary",
                          !sidebarExpanded && "justify-center"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarExpanded && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Separator className="my-4" />

              {/* Resources Section */}
              <div>
                <div className={cn(
                  "text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2",
                  sidebarExpanded ? "px-3" : "text-center text-[10px]"
                )}>
                  {sidebarExpanded ? "Resources" : "R"}
                </div>
                <div className="space-y-1">
                  {resources.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group",
                          isActive
                            ? "bg-gradient-primary/10 text-primary border-l-3 border-gradient-primary"
                            : "text-muted-foreground hover:bg-gray-100 hover:text-secondary",
                          !sidebarExpanded && "justify-center"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {sidebarExpanded && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </nav>

            {/* Logout Button at Bottom */}
            <div className="p-4 border-t border-[#E3E8EF]">
              <Button
                variant="ghost"
                onClick={() => {
                  // Mock logout - redirect to login page
                  window.location.href = '/login';
                }}
                className={cn(
                  "w-full justify-start gap-3 text-sm font-medium transition-colors hover:bg-red-50 hover:text-red-600",
                  !sidebarExpanded && "justify-center px-2"
                )}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
                {sidebarExpanded && <span>Logout</span>}
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className={cn(
          "flex-1 transition-all duration-300 pt-16",
          sidebarExpanded ? "ml-60" : "ml-16"
        )}>
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

