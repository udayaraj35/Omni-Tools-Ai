
'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { listUsersAction, blockUserAction, unblockUserAction } from '@/app/actions/adminActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, User, ShieldOff, MoreHorizontal, ChevronLeft, ChevronRight, Search, Mail, ShieldAlert, UserCog, ShieldCheck, UserCheck } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const UserManagement = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [pageTokens, setPageTokens] = useState<(string | undefined)[]>([undefined]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const fetchUsers = useCallback(async (pageIndex: number) => {
        setIsLoading(true);
        try {
            const token = pageTokens[pageIndex];
            const result = await listUsersAction(15, token);

            if (result.success && Array.isArray(result.users)) {
                setUsers(result.users);
                if (result.nextPageToken && pageIndex === pageTokens.length - 1) {
                    setPageTokens(prev => [...prev, result.nextPageToken]);
                }
            } else {
                toast({ variant: "destructive", title: "Sync Error", description: result.error || 'Identity cluster unresponsive.' });
                setUsers([]);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Access Denied", description: error.message });
            setUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, [pageTokens, toast]);

    useEffect(() => {
        fetchUsers(currentPageIndex);
    }, [currentPageIndex, fetchUsers]);

    const handleBlockToggle = useCallback(async (uid: string, currentStatus: boolean) => {
        const action = currentStatus ? "unblock" : "block";
        const confirmed = window.confirm(`SECURITY OVERRIDE: Are you sure you want to ${action} this identity?`);
        
        if (confirmed) {
            setIsLoading(true);
            try {
                const result = currentStatus 
                    ? await unblockUserAction(uid) 
                    : await blockUserAction(uid);

                if (result.success) {
                    toast({ 
                        title: currentStatus ? "Identity Restored" : "Identity Neutralized", 
                        description: currentStatus ? "User access has been re-authorized." : "User access has been revoked." 
                    });
                    setUsers(currentUsers => currentUsers.map(u => u.uid === uid ? { ...u, disabled: !currentStatus } : u));
                } else {
                    throw new Error(result.error);
                }
            } catch (error: any) {
                toast({ variant: "destructive", title: "Security Operation Failed", description: error.message });
            } finally {
                setIsLoading(false);
            }
        }
    }, [toast]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) return users;
        const lower = searchTerm.toLowerCase();
        return users.filter(u => 
            u.displayName?.toLowerCase().includes(lower) || 
            u.email?.toLowerCase().includes(lower) ||
            u.uid.toLowerCase().includes(lower)
        );
    }, [users, searchTerm]);

    return (
        <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
            <CardHeader className="p-8 border-b border-white/5 bg-white/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-black uppercase tracking-widest italic flex items-center gap-3">
                            <UserCog className="h-6 w-6 text-primary" /> Identity Registry
                        </CardTitle>
                        <CardDescription className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Manage system-wide user credentials and permissions.</CardDescription>
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <Input 
                            placeholder="Filter by Email, Name or UID..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 h-12 bg-black/40 border-white/10 rounded-xl text-xs font-bold"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="border-0 overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5 hover:bg-transparent">
                                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Identity</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Access Key</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Reg. Epoch</TableHead>
                                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Control</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading && users.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-64"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20" /></TableCell></TableRow>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <TableRow key={user.uid} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 overflow-hidden">
                                                    <User className="h-5 w-5 text-zinc-500" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-sm text-white group-hover:text-primary transition-colors">{user.displayName || 'ANONYMOUS'}</div>
                                                    <div className="text-[10px] font-bold text-zinc-500 flex items-center gap-1"><Mail className="h-2.5 w-2.5" /> {user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-mono text-[9px] text-zinc-500 tracking-tight">{user.uid}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.disabled ? 'destructive' : 'default'} className={cn(
                                                "text-[8px] font-black uppercase tracking-widest px-3 py-0.5",
                                                user.disabled ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                            )}>
                                                {user.disabled ? 'Blacklisted' : 'Authorized'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-[10px] font-bold text-zinc-400">
                                            {new Date(user.creationTime).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/5"><MoreHorizontal className="h-5 w-5" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="glass-card border-white/10 w-56">
                                                    {user.disabled ? (
                                                        <DropdownMenuItem onClick={() => handleBlockToggle(user.uid, true)} className="text-emerald-400 focus:bg-emerald-500/10 focus:text-emerald-400 font-bold py-3 cursor-pointer">
                                                            <UserCheck className="mr-3 h-4 w-4"/> Restore Access
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleBlockToggle(user.uid, false)} className="text-red-500 focus:bg-red-500/10 focus:text-red-500 font-bold py-3 cursor-pointer">
                                                            <ShieldOff className="mr-3 h-4 w-4"/> Revoke Authorization
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                 <TableRow><TableCell colSpan={5} className="text-center h-64 text-zinc-500 uppercase font-black tracking-widest text-xs">No identities mapped in local cluster.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="p-8 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Showing Cluster {currentPageIndex + 1} • Total Entities: {users.length}
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} disabled={currentPageIndex === 0} className="h-10 px-6 rounded-xl border-white/5 font-black uppercase text-[10px] tracking-widest">
                        <ChevronLeft className="h-4 w-4 mr-2"/> Back
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPageIndex(p => p + 1)} disabled={!isLoading && users.length < 15} className="h-10 px-6 rounded-xl border-white/5 font-black uppercase text-[10px] tracking-widest">
                        Next <ChevronRight className="h-4 w-4 ml-2"/>
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
export default UserManagement;
