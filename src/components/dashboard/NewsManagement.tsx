'use client';
import React, { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { saveNewsItemAction, deleteNewsItemAction } from '@/app/actions/adminActions';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Megaphone, Plus, Trash2, Edit, Save, X, Sparkles, AlertTriangle, Info, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const NewsManagement = () => {
    const { toast } = useToast();
    const firestore = useFirestore();
    const [isSaving, setIsSaving] = useState(false);
    const [editItem, setEditItem] = useState<any | null>(null);

    const newsQuery = useMemoFirebase(() => {
        return query(collection(firestore, 'newsItems'), orderBy('priority', 'desc'));
    }, [firestore]);

    const { data: newsItems, isLoading } = useCollection(newsQuery);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editItem?.text) return;
        
        setIsSaving(true);
        try {
            const result = await saveNewsItemAction({
                ...editItem,
                status: editItem.status || 'active',
                priority: Number(editItem.priority) || 0,
                type: editItem.type || 'news'
            });
            if (result.success) {
                toast({ title: "Deployment Success", description: "Announcement broadcasted to system ticker." });
                setEditItem(null);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deployment Failed", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("CRITICAL: Permanent deletion of broadcast message?")) return;
        try {
            await deleteNewsItemAction(id);
            toast({ title: "Terminated", description: "News item removed from ticker." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        }
    };

    const getBadgeStyle = (type: string) => {
        switch(type) {
            case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'update': return 'bg-primary/10 text-primary border-primary/20';
            case 'ad': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-zinc-800 text-zinc-400 border-white/5';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-6">
                <div className="space-y-1">
                    <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
                        <Megaphone className="h-6 w-6 text-primary" /> Broadcast Engine
                    </h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Deploy announcements across the ticker architecture.</p>
                </div>
                <Button onClick={() => setEditItem({ text: '', priority: 0, status: 'active', type: 'news' })} className="gradient-button-gold rounded-xl h-12 px-8 font-black uppercase text-[10px] tracking-widest">
                    <Plus className="mr-2 h-4 w-4" /> New Broadcast
                </Button>
            </div>

            {editItem && (
                <Card className="glass-card border-primary/30 bg-primary/5 rounded-[2.5rem] overflow-hidden animate-in zoom-in-95 duration-300">
                    <CardHeader className="p-8 border-b border-primary/10">
                        <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 text-primary">
                            <Sparkles className="h-5 w-5" /> {editItem.id ? 'Modify Existing Broadcast' : 'Initial System Broadcast'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSave} className="space-y-8">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Broadcast Content (Supports Emoji)</Label>
                                <Textarea 
                                    value={editItem.text} 
                                    onChange={e => setEditItem({...editItem, text: e.target.value})} 
                                    placeholder="e.g. 📄 NEW: Europass CV V2.5 is now live! Update your profile now. ✨" 
                                    required 
                                    className="bg-black/40 border-white/10 rounded-2xl min-h-[100px] text-lg font-medium p-6 focus:ring-primary"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Category Node</Label>
                                    <Select value={editItem.type} onValueChange={v => setEditItem({...editItem, type: v})}>
                                        <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl"><SelectValue/></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="news">General News</SelectItem>
                                            <SelectItem value="update">Feature Update</SelectItem>
                                            <SelectItem value="ad">Promotional Ad</SelectItem>
                                            <SelectItem value="urgent">Urgent Alert</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Priority Weight (Rank)</Label>
                                    <Input type="number" value={editItem.priority} onChange={e => setEditItem({...editItem, priority: e.target.value})} className="h-12 bg-black/40 border-white/10 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-zinc-500">Deployment Status</Label>
                                    <Select value={editItem.status} onValueChange={v => setEditItem({...editItem, status: v})}>
                                        <SelectTrigger className="h-12 bg-black/40 border-white/10 rounded-xl"><SelectValue/></SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="active">Active (On Ticker)</SelectItem>
                                            <SelectItem value="inactive">Inactive (Paused)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <Button type="button" variant="ghost" onClick={() => setEditItem(null)} className="h-12 px-8 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5">Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="h-12 px-10 rounded-xl bg-primary text-black font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl">
                                    {isSaving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="mr-3 h-4 w-4"/>} 
                                    Commit Broadcast
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card className="glass-card border-white/5 bg-zinc-900/40 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-950/50">
                            <TableRow className="border-white/5">
                                <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Status</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Content Summary</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</TableHead>
                                <TableHead className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Rank</TableHead>
                                <TableHead className="text-right px-8 text-[10px] font-black uppercase tracking-widest text-zinc-500">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-64"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary opacity-20"/></TableCell></TableRow>
                            ) : newsItems?.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center h-64 text-zinc-500 uppercase font-black tracking-widest text-xs">No active broadcasts in ticker node.</TableCell></TableRow>
                            ) : (
                                newsItems?.map((item) => (
                                    <TableRow key={item.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                        <TableCell className="px-8">
                                            <Badge variant={item.status === 'active' ? 'default' : 'secondary'} className={cn(
                                                "text-[8px] font-black uppercase px-3 py-0.5 tracking-widest",
                                                item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''
                                            )}>{item.status}</Badge>
                                        </TableCell>
                                        <TableCell className="font-bold text-sm text-white/90 max-w-md truncate">{item.text}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={cn("text-[8px] font-black uppercase tracking-widest px-3 py-0.5", getBadgeStyle(item.type))}>
                                                {item.type === 'urgent' && <AlertTriangle className="h-2.5 w-2.5 mr-1.5" />}
                                                {item.type === 'update' && <Sparkles className="h-2.5 w-2.5 mr-1.5" />}
                                                {item.type === 'ad' && <Tag className="h-2.5 w-2.5 mr-1.5" />}
                                                {item.type === 'news' && <Info className="h-2.5 w-2.5 mr-1.5" />}
                                                {item.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center font-black text-primary">{item.priority}</TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-primary/10 hover:text-primary" onClick={() => setEditItem(item)}><Edit className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="ghost" className="h-9 w-9 hover:bg-red-500/10 hover:text-red-500" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default NewsManagement;
