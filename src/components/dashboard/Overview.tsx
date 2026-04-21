'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, limit, orderBy } from 'firebase/firestore';
import { 
    Activity, Zap, DollarSign, Wallet, CheckCircle2, Clock, ShieldCheck
} from 'lucide-react';
import { 
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
    Tooltip, CartesianGrid 
} from 'recharts';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

const dummyChartData = [
  { name: 'Sun', income: 400, requests: 240 },
  { name: 'Mon', income: 600, requests: 398 },
  { name: 'Tue', income: 800, requests: 480 },
  { name: 'Wed', income: 1200, requests: 600 },
  { name: 'Thu', income: 1100, requests: 550 },
  { name: 'Fri', income: 1500, requests: 800 },
  { name: 'Sat', income: 1800, requests: 950 },
];

interface OverviewProps {
    onNavigate: (tab: string) => void;
}

export default function Overview({ onNavigate }: OverviewProps) {
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => query(collection(firestore, 'dummyBookings'), orderBy('createdAt', 'desc'), limit(100)), [firestore]);
    const { data: allBookings } = useCollection(bookingsQuery);

    const pendingCount = allBookings?.filter(b => b.status === 'pending').length || 0;
    const confirmedToday = allBookings?.filter(b => b.status === 'confirmed' && new Date(b.createdAt).toDateString() === new Date().toDateString()).length || 0;
    const totalRev = allBookings?.filter(b => b.status === 'confirmed').reduce((acc, curr) => acc + (curr.totalPriceInAED || 0), 0) || 0;

    const stats = [
        { 
            label: 'Total Revenue', 
            val: `${totalRev.toLocaleString()} AED`, 
            icon: DollarSign, 
            color: 'text-emerald-500', 
            bg: 'bg-emerald-500/10', 
            trend: 'Confirmed',
            tab: 'payments'
        },
        { 
            label: 'Pending Requests', 
            val: pendingCount, 
            icon: Clock, 
            color: 'text-primary', 
            bg: 'bg-primary/10', 
            trend: 'In Queue',
            tab: 'tickets'
        },
        { 
            label: 'Confirmed Today', 
            val: confirmedToday, 
            icon: CheckCircle2, 
            color: 'text-cyan-500', 
            bg: 'bg-cyan-500/10', 
            trend: 'Dispatched',
            tab: 'tickets'
        },
        { 
            label: 'System Status', 
            val: 'Active', 
            icon: Zap, 
            color: 'text-amber-500', 
            bg: 'bg-amber-500/10', 
            trend: 'Global Node',
            tab: 'ai'
        },
    ];

    return (
        <div className="space-y-8 pb-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card 
                        key={i} 
                        className="glass-card border-border bg-card/40 hover:bg-card/60 transition-all cursor-pointer group rounded-[2.5rem] shadow-xl"
                        onClick={() => onNavigate(stat.tab)}
                    >
                        <CardContent className="p-7 text-left">
                            <div className="flex justify-between items-start">
                                <div className={cn("p-3.5 rounded-2xl transition-all group-hover:scale-110 duration-500 shadow-md", stat.bg, stat.color)}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <Badge variant="outline" className="border-border bg-background text-[9px] font-black tracking-widest uppercase py-1 px-3">
                                    {stat.trend}
                                </Badge>
                            </div>
                            <div className="mt-6 space-y-1">
                                <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">{stat.label}</h3>
                                <p className="text-4xl font-black text-foreground tracking-tighter italic leading-none">{stat.val}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <Card className="lg:col-span-8 glass-card border-border bg-card/40 rounded-[3rem] overflow-hidden shadow-2xl">
                    <CardHeader className="p-8 border-b border-border bg-muted/20">
                        <CardTitle className="text-xl font-black uppercase italic tracking-widest flex items-center gap-3 text-foreground">
                            <Activity className="h-6 w-6 text-primary" /> Revenue Flow Cluster
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Financial throughput analysis for current cycle.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="h-[380px] w-full mt-4 -ml-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dummyChartData}>
                                    <defs>
                                        <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.3)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: '900'}} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10, fontWeight: '900'}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', borderRadius: '1.5rem', color: 'hsl(var(--foreground))' }} />
                                    <Area type="monotone" dataKey="income" stroke="hsl(var(--primary))" strokeWidth={5} fillOpacity={1} fill="url(#colorInc)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <div className="lg:col-span-4 space-y-8">
                    <Card className="glass-card border-border bg-card/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <CardHeader className="p-7 border-b border-border bg-muted/20">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                                <Clock className="h-4 w-4 text-primary" /> Pending Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-7 space-y-7">
                            {allBookings?.filter(b => b.status === 'pending').slice(0, 5).map((b, i) => (
                                <div key={i} className="flex items-center justify-between group transition-all hover:translate-x-1">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 rounded-xl bg-background border border-border group-hover:bg-muted group-hover:text-primary">
                                            <Wallet className="h-4 w-4 text-cyan-500" />
                                        </div>
                                        <div className="text-left">
                                            <span className="text-[10px] font-black text-foreground uppercase block">{b.passengers[0]?.firstName || 'N/A'}</span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase">{b.pnr}</span>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="text-[8px] font-black uppercase border-primary/20 text-primary">{b.totalPriceInAED} AED</Badge>
                                </div>
                            ))}
                            {pendingCount === 0 && <p className="text-[10px] font-bold text-muted-foreground uppercase text-center py-10">All packets cleared.</p>}
                        </CardContent>
                    </Card>

                    <Card className="glass-card border-border bg-muted/20 rounded-[2.5rem] p-8 text-center space-y-5 shadow-2xl">
                        <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center mx-auto border border-primary/20">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xl font-black uppercase tracking-tighter italic text-foreground">Security Protocol</h4>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.4em]">Node Integrity: 100%</p>
                        </div>
                        <Separator className="bg-border" />
                        <p className="text-[11px] text-muted-foreground leading-relaxed font-bold italic">
                            "System monitoring active. All transactions encrypted via TLS 1.3."
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
