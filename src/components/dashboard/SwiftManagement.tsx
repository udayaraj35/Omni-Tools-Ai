
'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Landmark, Search, Plus, Trash2, Edit, FileDown, FileUp, Globe, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { swiftDatabase, type SwiftRecord } from '@/lib/swift-data';
import { useToast } from '@/hooks/use-toast';

const SwiftManagement = () => {
    const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [isImporting, setIsImporting] = useState(false);

    const filteredData = useMemo(() => {
        if (!searchTerm.trim()) return swiftDatabase;
        const lower = searchTerm.toLowerCase();
        return swiftDatabase.filter(r => 
            r.bank.toLowerCase().includes(lower) || 
            r.swiftCode.toLowerCase().includes(lower) ||
            r.city.toLowerCase().includes(lower)
        );
    }, [searchTerm]);

    const handleImportCSV = () => {
        setIsImporting(true);
        toast({ title: "Module Initializing", description: "CSV Importer is coming soon in the next update." });
        setTimeout(() => setIsImporting(false), 1500);
    };

    return (
        <Card className="glass-card">
            <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <CardTitle className="text-2xl font-bold flex items-center gap-2">
                            <Landmark className="text-primary" /> SWIFT/BIC Registry
                        </CardTitle>
                        <CardDescription>Manage global bank identifier codes and branch data.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search Bank, SWIFT, City..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={handleImportCSV} disabled={isImporting}>
                            {isImporting ? <Loader2 className="animate-spin" /> : <FileUp className="h-4 w-4" />}
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Plus className="h-4 w-4 mr-2" /> Add Bank
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead>SWIFT Code</TableHead>
                                <TableHead>Institution</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-mono font-bold text-primary">{r.swiftCode}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{r.bank}</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">{r.branch}</div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs font-bold flex items-center gap-1"><MapPin className="h-3 w-3" /> {r.city}</div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Globe className="h-3 w-3"/> {r.country}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={r.isActive ? "default" : "secondary"} className={r.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : ""}>
                                                {r.isActive ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8"><Edit className="h-4 w-4"/></Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-500/10"><Trash2 className="h-4 w-4"/></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={5} className="text-center h-32 text-muted-foreground">No records found matching your search.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/30 py-4 flex justify-between items-center">
                <p className="text-xs text-muted-foreground">Total Records: {filteredData.length}</p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase font-black tracking-widest"><FileDown className="mr-2 h-3 w-3" /> Export CSV</Button>
                </div>
            </CardFooter>
        </Card>
    );
};

export default SwiftManagement;
