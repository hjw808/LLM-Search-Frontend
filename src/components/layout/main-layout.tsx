"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import {
  FileText,
  Play,
  Sparkles,
  Zap,
  Menu,
  X,
  Package,
} from "lucide-react";
import { PageTransition } from "./page-transition";

const navigation = [
  { name: "Run Test", href: "/test", icon: Play },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Deep Dive", href: "/deep-dive", icon: Sparkles },
  { name: "Products", href: "/products", icon: Package },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  // Scroll to top on route change
  useEffect(() => {
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [pathname]);

  // Reset transition state when pathname changes
  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        setPendingPath(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, isTransitioning]);

  // Coordinated navigation handler
  const handleNavigation = useCallback((href: string, e: React.MouseEvent) => {
    e.preventDefault();

    // Don't navigate if already on this page
    if (pathname === href) return;

    // Close sidebar on mobile
    setIsSidebarOpen(false);

    // Set pending state immediately for visual feedback
    setPendingPath(href);

    // Start content fade-out immediately
    setIsTransitioning(true);

    // Navigate after a brief delay to allow fade-out to start
    setTimeout(() => {
      router.push(href);
    }, 50);
  }, [pathname, router]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed lg:relative inset-y-0 left-0 z-50 w-72 backdrop-blur-xl bg-white/5 border-r border-white/10 transform transition-transform duration-300 ease-in-out",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-sm opacity-75"></div>
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">AI Visibility</h1>
              <p className="text-xs text-slate-400 font-medium">Testing Platform</p>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isPending = pendingPath === item.href;
              const shouldHighlight = isActive || (isPending && isTransitioning);
              const isPressed = isPending && !isActive;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={cn(
                      "group flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-100 ease-out",
                      shouldHighlight
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5",
                      isPressed && "scale-[0.98]"
                    )}
                  >
                    <div className={cn(
                      "p-2 rounded-lg transition-all duration-100 ease-out",
                      shouldHighlight
                        ? "bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50"
                        : "bg-white/5 group-hover:bg-white/10"
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Bottom decoration */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="relative h-32 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-xl"></div>
            <div className="relative p-4 flex items-center justify-center h-full">
              <div className="text-center">
                <Zap className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-medium">Powered by AI</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="backdrop-blur-xl bg-white/5 border-b border-white/10 px-4 md:px-8 py-4 md:py-6 relative z-50">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-white hover:bg-white/5 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex-1 min-w-0">
              <h2 className={cn(
                "text-lg md:text-2xl font-bold text-white truncate transition-opacity duration-100 ease-in-out",
                isTransitioning && "opacity-50"
              )}>
                {navigation.find((item) => item.href === pathname)?.name || "AI Visibility Testing"}
              </h2>
              <p className={cn(
                "text-xs md:text-sm text-slate-400 mt-1 truncate transition-opacity duration-100 ease-in-out",
                isTransitioning && "opacity-50"
              )}>
                Analyze your business visibility across AI platforms
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <PageTransition isTransitioning={isTransitioning}>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

      {/* Gradient overlay effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}