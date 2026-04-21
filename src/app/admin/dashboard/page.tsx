'use client';

import React, { useState } from 'react';
import DummyTicketManagement from "@/components/dashboard/DummyTicketManagement";
import NewsManagement from "@/components/dashboard/NewsManagement";
import SettingsManagement from "@/components/dashboard/SettingsManagement";
import Overview from "@/components/dashboard/Overview";
import { 
    Ticket, Megaphone, ShieldCheck, 
    LayoutDashboard, Cpu, Wallet, ChevronRight, 
    Zap, Bell, Database, Server, ArrowLeft
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from 'next/link';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard, desc: "Global Metrics" },
    { id: "ai", label: "AI Engine", icon: Cpu, desc: "Neural Logic Controls" },
    { id: "payments", label: "Finance Hub", icon: Wallet, desc: "Payment Nodes" },
    { id: "tickets", label: "Bookings", icon: Ticket, desc: "Reservation Terminal" },
    { id: "news", label: "Ticker", icon: Megaphone, desc: "System Broadcasts" },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <Overview onNavigate={setActiveTab} />;
      case "ai": return <SettingsManagement mode="ai" />;
      case "payments": return <SettingsManagement mode="payment" />;
      case "tickets": return <DummyTicketManagement />;
      case "news": return <NewsManagement />;
      default: return <Overview onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)] gap-8 animate-in fade-in duration-700">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="lg:w-72 flex-shrink-0">
        <div className="sticky top-24 space-y-6">
            <Card className="glass-card border-border bg-card/40 p-2 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-border mb-2 bg-muted/30 rounded-t-[2.3rem]">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-foreground italic">Master Node</h2>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.3em]">OmniTools OS V4.5</p>
                        </div>
                    </div>
                </div>
                
                <nav className="p-2 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                "w-full flex items-center justify-between p-4 rounded-2xl transition-all group",
                                activeTab === item.id 
                                    ? "bg-primary text-primary-foreground shadow-[0_10px_25px_rgba(34,211,238,0.25)] scale-[1.02]" 
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={cn("h-5 w-5", activeTab === item.id ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                                <div className="text-left">
                                    <p className="text-xs font-black uppercase tracking-wider">{item.label}</p>
                                    <p className={cn("text-[8px] font-bold uppercase tracking-tight", activeTab === item.id ? "text-primary-foreground/60" : "text-muted-foreground/60")}>{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight className={cn("h-4 w-4 transition-transform", activeTab === item.id ? "rotate-90" : "opacity-0 group-hover:opacity-100")} />
                        </button>
                    ))}
                    
                    <Separator className="my-2 bg-border" />
                    <Link href="/" className="block">
                        <Button variant="ghost" className="w-full justify-start p-4 h-14 rounded-2xl gap-4 text-muted-foreground hover:text-primary hover:bg-primary/5 group">
                            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                            <div className="text-left">
                                <p className="text-xs font-black uppercase tracking-wider">Main Site</p>
                                <p className="text-[8px] font-bold uppercase tracking-tight opacity-60">Return to Homepage</p>
                            </div>
                        </Button>
                    </Link>
                </nav>
            </Card>

            {/* SYSTEM STATUS CARD */}
            <Card className="glass-card border-emerald-500/20 bg-emerald-500/5 p-6 rounded-[2rem]">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" /> SYSTEM ONLINE
                    </span>
                    <Badge variant="outline" className="text-[8px] border-emerald-500/20 text-emerald-600 px-2">REALTIME</Badge>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                            <Zap className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Latency</p>
                            <p className="text-sm font-black text-foreground">12ms <span className="text-emerald-500 text-[8px] uppercase tracking-tighter ml-1">Optimal</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Server className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">CPU Load</p>
                            <p className="text-sm font-black text-foreground">24% <span className="text-cyan-500 text-[8px] uppercase tracking-tighter ml-1">Stable</span></p>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 min-w-0">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 border-b border-border pb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-[0.03] pointer-events-none">
                <Database className="w-64 h-64 text-foreground" />
            </div>
            
            <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-[8px] font-black uppercase">Active Module</Badge>
                    <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-[0.2em]">Secure Session: Authorized</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black font-headline text-glow-primary uppercase italic leading-none">
                    {menuItems.find(m => m.id === activeTab)?.label}
                </h1>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.4em] mt-2">
                    Node Synchronization Status: 100% Complete
                </p>
            </div>

            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-2xl border border-border relative z-10 backdrop-blur-xl">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 py-1.5 px-4 uppercase font-black text-[9px] tracking-widest rounded-xl">
                    {new Date().toLocaleDateString('ne-NP')}
                </Badge>
                <Button variant="ghost" size="icon" className="h-11 w-11 text-muted-foreground hover:text-foreground rounded-xl bg-background/50 transition-all hover:bg-primary/10 hover:text-primary">
                    <Bell className="h-5 w-5" />
                </Button>
            </div>
        </div>

        <main className="animate-in slide-in-from-right-4 duration-500 ease-out">
            {renderContent()}
        </main>
      </div>
    </div>
  );
}
