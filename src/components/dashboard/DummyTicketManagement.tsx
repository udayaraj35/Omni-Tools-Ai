'use client';
import React, { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit as firestoreLimit } from 'firebase/firestore';
import { confirmDummyBookingAction } from '@/app/actions/adminActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, Clock, Mail, Search, Plane, ArrowRight, User, Hash, Globe, DollarSign, CreditCard, Send, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const DummyTicketManagement = () => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isConfirming, setIsConfirming] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);
    const [txid, setTxid] = useState('');

    const bookingsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'dummyBookings'), orderBy('createdAt', 'desc'), firestoreLimit(100));
    }, [firestore]);

    const { data: bookings, isLoading } = useCollection(bookingsQuery);

    const filteredBookings = useMemo(() => {
        if (!bookings) return [];
        if (!searchTerm.trim()) return bookings;
        const lowerSearch = searchTerm.toLowerCase();
        return bookings.filter(b => 
            b.pnr.toLowerCase().includes(lowerSearch) || 
            b.contactEmail.toLowerCase().includes(lowerSearch) ||
            b.passengers[0]?.firstName.toLowerCase().includes(lowerSearch) ||
            b.passengers[0]?.lastName.toLowerCase().includes(lowerSearch)
        );
    }, [bookings, searchTerm]);

    const handleConfirm = async () => {
        if (!confirmingId) return;
        setIsConfirming(confirmingId);
        toast({ title: "Processing Confirmation", description: "Generating secure PDF and logging transaction." });
        
        try {
            const result = await confirmDummyBookingAction(confirmingId, txid);
            if (result.success) {
                toast({ title: "Authorized", description: "Ticket dispatched with TXID: " + (txid || 'N/A') });
                setConfirmingId(null);
                setTxid('');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Confirmation Failure", description: error.message });
        } finally {
            setIsConfirming(null);
        }
    };

    return (
        <>
        <Card className="glass-card border-border bg-card/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-border bg-muted/20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1 text-left">
                        <CardTitle className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-foreground">
                            <Plane className="h-6 w-6 text-primary" /> Reservation Terminal
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Monitor and authorize verifiable flight bookings.</CardDescription>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search PNR, Email, Passenger..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-12 h-12 bg-background border-border rounded-xl text-xs font-bold"
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border hover:bg-transparent">
                                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">PNR / Ref</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manifest Identity</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sector / Airline</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Security Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Timestamp</TableHead>
                                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authorization</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={7} className="text-center h-64"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary opacity-20"/></TableCell></TableRow>
                            ) : filteredBookings.length > 0 ? (
                                filteredBookings.map((b) => (
                                    <TableRow key={b.id} className="border-border hover:bg-muted/30 transition-colors group">
                                        <TableCell className="px-8 py-5 text-left">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-xl font-black text-primary tracking-widest group-hover:scale-105 transition-transform origin-left">{b.pnr}</span>
                                                {b.transactionId && b.transactionId !== "N/A" && (
                                                    <span className="text-[7px] font-black text-emerald-600 uppercase mt-1">TXID: {b.transactionId}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center border border-border">
                                                    <User className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm text-foreground uppercase">{b.passengers[0]?.firstName} {b.passengers[0]?.lastName}</div>
                                                    <div className="text-[9px] font-bold text-muted-foreground flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {b.contactEmail}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-black text-foreground/80">
                                                    {b.fromAirport.code} <ArrowRight className="h-3 w-3 text-primary" /> {b.toAirport.code}
                                                </div>
                                                <div className="text-[9px] font-bold text-muted-foreground flex items-center gap-1 uppercase">
                                                    <Globe className="h-2.5 w-2.5" /> {b.flightDetails?.airline}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                                                    <DollarSign className="h-3 w-3 text-emerald-600" /> {b.totalPriceInAED} AED
                                                </div>
                                                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter flex items-center gap-1">
                                                    <CreditCard className="h-2 w-2" /> Gateway: {b.currency}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-left">
                                            <Badge variant={b.status === 'confirmed' ? 'default' : 'secondary'} className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-3 py-0.5",
                                                b.status === 'pending' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                                b.status === 'confirmed' && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                            )}>
                                                {b.status === 'pending' ? <Clock className="mr-1.5 h-2.5 w-2.5" /> : <CheckCircle className="mr-1.5 h-2.5 w-2.5" />}
                                                {b.status === 'pending' ? 'Unverified' : 'Secured'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold text-muted-foreground text-left">
                                            {new Date(b.createdAt).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            {b.status === 'pending' ? (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => setConfirmingId(b.id)} 
                                                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-xl h-10 px-5 shadow-lg"
                                                >
                                                    Authorize
                                                </Button>
                                            ) : (
                                                <Badge variant="outline" className="border-border text-muted-foreground font-black uppercase text-[8px] tracking-widest py-1.5 px-4">DISPATCHED</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={7} className="text-center h-64 text-muted-foreground uppercase font-black tracking-widest text-xs">No active data packets in the reservation stream.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="p-6 border-t border-border bg-muted/10">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" /> Secure Administrative Access Protocol 
                </p>
            </CardFooter>
        </Card>

        {/* Confirmation Dialog */}
        <Dialog open={!!confirmingId} onOpenChange={(open) => !open && setConfirmingId(null)}>
            <DialogContent className="glass-card border-border bg-background text-foreground rounded-[2.5rem] p-8 max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-primary flex items-center gap-3">
                        <ShieldCheck className="h-6 w-6" /> Final Authorization
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-xs font-bold uppercase mt-2">
                        Verify manual payment and log transaction details.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 py-6 text-left">
                    <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Manual Transaction Number (TXID)</Label>
                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                value={txid}
                                onChange={(e) => setTxid(e.target.value)}
                                placeholder="Enter eSewa / Bank Ref ID..."
                                className="h-14 bg-muted border-border rounded-xl pl-12 text-sm font-bold focus:border-primary"
                            />
                        </div>
                        <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">Logging this ID is mandatory for security audits.</p>
                    </div>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3">
                    <Button variant="ghost" onClick={() => setConfirmingId(null)} className="flex-1 h-12 rounded-xl font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isConfirming || !txid.trim()}
                        className="flex-1 h-12 gradient-button-gold rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl group"
                    >
                        {isConfirming ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />}
                        Confirm & Dispatch
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        </>
    );
};

export default DummyTicketManagement;
