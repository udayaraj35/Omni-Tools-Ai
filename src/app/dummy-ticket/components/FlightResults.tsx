'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plane, ChevronsDown, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { type Currency } from '../page';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

const dummyAirlines = [
    // Nepal (International & Domestic)
    { name: 'Nepal Airlines', color: '#CC1F26' },
    { name: 'Himalaya Airlines', color: '#0054A6' },
    { name: 'Buddha Air', color: '#0054A6' },
    { name: 'Yeti Airlines', color: '#00A651' },
    { name: 'Shree Airlines', color: '#ED1C24' },
    { name: 'Saurya Airlines', color: '#FF6600' },
    { name: 'Tara Air', color: '#00A651' },
    { name: 'Summit Air', color: '#003366' },
    
    // India
    { name: 'Air India', color: '#ED1C24' },
    { name: 'IndiGo', color: '#003399' },
    { name: 'Vistara', color: '#5B1D41' },
    { name: 'SpiceJet', color: '#FF0000' },
    { name: 'Akasa Air', color: '#FF6B01' },
    { name: 'Air India Express', color: '#ED1C24' },
    { name: 'Alliance Air', color: '#003366' },

    // South Asia
    { name: 'Biman Bangladesh', color: '#006C35' },
    { name: 'SriLankan Airlines', color: '#003366' },
    { name: 'Druk Air', color: '#FDB913' },
    { name: 'Bhutan Airlines', color: '#CC1F26' },

    // Middle East
    { name: 'Emirates', color: '#D71921' },
    { name: 'flydubai', color: '#003399' },
    { name: 'Qatar Airways', color: '#8A1538' },
    { name: 'Etihad Airways', color: '#C39B6D' },
    { name: 'Oman Air', color: '#997D4D' },
    { name: 'Kuwait Airways', color: '#003399' },
    { name: 'Saudi Arabian Airlines', color: '#006C35' },
    { name: 'Gulf Air', color: '#997D4D' },
    { name: 'Jazeera Airways', color: '#003399' },
    { name: 'Air Arabia', color: '#E31E24' },
    { name: 'flynas', color: '#006C35' },
    { name: 'SalamAir', color: '#00A651' },

    // Asia & Pacific
    { name: 'Singapore Airlines', color: '#FDB913' },
    { name: 'Cathay Pacific', color: '#006564' },
    { name: 'Thai Airways', color: '#532877' },
    { name: 'Malaysia Airlines', color: '#003399' },
    { name: 'Japan Airlines', color: '#E81932' },
    { name: 'ANA All Nippon', color: '#003399' },
    { name: 'Korean Air', color: '#003399' },
    { name: 'China Southern', color: '#003399' },
    { name: 'China Eastern', color: '#003399' },
    { name: 'Air China', color: '#E81932' },
    { name: 'Vietnam Airlines', color: '#997D4D' },
    { name: 'Philippine Airlines', color: '#003399' },
    { name: 'AirAsia', color: '#ED1C24' },
    { name: 'Batik Air', color: '#8A1538' },

    // Europe
    { name: 'Air France', color: '#002395' },
    { name: 'Lufthansa', color: '#002E50' },
    { name: 'KLM', color: '#00A1E4' },
    { name: 'British Airways', color: '#00247D' },
    { name: 'Turkish Airlines', color: '#E81932' },
    { name: 'Swiss International', color: '#E51B24' },
    { name: 'LOT Polish Airlines', color: '#003399' },
    { name: 'Austrian Airlines', color: '#E81932' },
    { name: 'Finnair', color: '#002F6C' },
    { name: 'Iberia', color: '#D71921' },
    { name: 'Ryanair', color: '#073590' },
    { name: 'EasyJet', color: '#FF6600' },
    { name: 'Wizz Air', color: '#C20F81' },

    // Americas
    { name: 'Delta Air Lines', color: '#E01933' },
    { name: 'United Airlines', color: '#005DAA' },
    { name: 'American Airlines', color: '#0078D2' },
    { name: 'Air Canada', color: '#CC1F26' },
];

const generateDummyFlights = (departureDate: Date, fromCode: string, toCode: string) => {
    const results = [];
    const flightDate = format(departureDate, 'dd LLL yyyy');

    for (let i = 0; i < dummyAirlines.length; i++) {
        const airline = dummyAirlines[i];
        
        const hour = 5 + Math.floor(Math.random() * 17);
        const minute = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55][Math.floor(Math.random() * 12)];
        const departureTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        
        const durationHours = 1 + Math.floor(Math.random() * 12);
        const durationMinutes = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
        
        const arrivalHour = (hour + durationHours) % 24;
        const arrivalTime = `${String(arrivalHour).padStart(2, '0')}:${String(durationMinutes).padStart(2, '0')}`;
        
        const stops = Math.random() > 0.7 ? '1 Stop' : 'Non-stop';
        const flightNumber = `${airline.name.substring(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 8900)}`;

        results.push({
            airline: airline.name,
            color: airline.color,
            from: fromCode.toUpperCase(),
            to: toCode.toUpperCase(),
            departureTime,
            arrivalTime,
            duration: `${durationHours}h ${durationMinutes}m`,
            stops: stops,
            date: flightDate,
            flightNumber: flightNumber,
        });
    }
    return results.sort((a,b) => a.airline.localeCompare(b.airline));
};


const CONVERSION_RATES = {
    AED: 1,
    NPR: 36.5,
    USD: 0.27,
    EUR: 0.25,
    USDT: 0.27,
};

export function FlightResults({ onSelectFlight, currency, onCurrencyChange, totalPriceInAED, fromAirportCode, toAirportCode, departureDate }: { onSelectFlight: (flight: any) => void; currency: Currency; onCurrencyChange: (currency: Currency) => void; totalPriceInAED: number; fromAirportCode: string; toAirportCode: string; departureDate: Date }) {
    const [flights, setFlights] = useState<any[]>([]);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    useEffect(() => {
        if (departureDate && fromAirportCode && toAirportCode) {
            setFlights(generateDummyFlights(departureDate, fromAirportCode, toAirportCode));
        }
    }, [departureDate, fromAirportCode, toAirportCode]);

    const handleTimeChange = (index: number, field: 'departureTime' | 'arrivalTime', value: string) => {
        const updatedFlights = [...flights];
        updatedFlights[index] = { ...updatedFlights[index], [field]: value };
        setFlights(updatedFlights);
    };

    const filteredFlights = useMemo(() => {
        if (!searchTerm.trim()) return flights;
        const lowerSearch = searchTerm.toLowerCase();
        return flights.filter(f => f.airline.toLowerCase().includes(lowerSearch));
    }, [flights, searchTerm]);

    const displayedFlights = showAll || searchTerm.trim() !== '' ? filteredFlights : filteredFlights.slice(0, 5);
    const priceInSelectedCurrency = totalPriceInAED * CONVERSION_RATES[currency];

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end mb-6">
                <div className="relative">
                    <Label htmlFor="search-airline">Search Airline / एयरलाइन्स खोज्नुहोस्</Label>
                    <div className="relative mt-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="search-airline"
                            placeholder="e.g. Nepal Airlines, Emirates..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-12"
                        />
                    </div>
                </div>
                <div className="max-w-xs md:ml-auto w-full">
                    <Label htmlFor="currency">Payment Currency</Label>
                    <Select value={currency} onValueChange={(value) => onCurrencyChange(value as Currency)}>
                        <SelectTrigger id="currency" className="h-12 mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="AED">AED (Dirham)</SelectItem>
                            <SelectItem value="NPR">NPR (Nepalese Rupee)</SelectItem>
                            <SelectItem value="USD">USD (US Dollar)</SelectItem>
                            <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            <SelectItem value="USDT">USDT (Tether)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {displayedFlights.length > 0 ? (
                displayedFlights.map((flight, index) => (
                    <Card key={index} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl overflow-hidden border">
                        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-5 items-center gap-4">
                            <div className="flex items-center gap-4 col-span-1 md:col-span-2">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0" style={{ backgroundColor: flight.color }}>
                                    {flight.airline.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-base" style={{ color: flight.color }}>{flight.airline}</p>
                                    <p className="text-sm text-muted-foreground">{flight.date}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-center gap-2 text-center col-span-1 md:col-span-2">
                                 <div className="text-right">
                                    <Input
                                        type="time"
                                        value={flight.departureTime}
                                        onChange={(e) => handleTimeChange(index, 'departureTime', e.target.value)}
                                        className="font-bold text-lg bg-transparent border p-1 text-right w-32"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">{flight.from}</p>
                                </div>
                                <div className="flex-grow flex items-center gap-2 text-muted-foreground">
                                    <Separator className="flex-1 hidden sm:block" />
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs whitespace-nowrap">{flight.duration}</span>
                                        <Plane className="h-4 w-4 transform -rotate-45" />
                                        <span className="text-xs font-medium text-foreground">{flight.stops}</span>
                                    </div>
                                    <Separator className="flex-1 hidden sm:block"/>
                                </div>
                                <div className="text-left">
                                    <Input
                                        type="time"
                                        value={flight.arrivalTime}
                                        onChange={(e) => handleTimeChange(index, 'arrivalTime', e.target.value)}
                                        className="font-bold text-lg bg-transparent border p-1 w-32"
                                    />
                                    <p className="text-sm text-muted-foreground mt-1">{flight.to}</p>
                                </div>
                            </div>

                            <div className="text-center md:text-right space-y-2 col-span-1">
                                 <p className="text-xl font-bold text-primary">{currency} {priceInSelectedCurrency.toFixed(2)}</p>
                                <Button onClick={() => onSelectFlight(flight)} className="w-full md:w-auto h-11 text-base btn-accent">Select Flight</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-xl border-2 border-dashed">
                    <p className="text-lg font-semibold">No flights found matching "{searchTerm}"</p>
                    <p className="text-sm">Try searching for a different airline or check the spelling.</p>
                </div>
            )}

            {!showAll && searchTerm.trim() === '' && filteredFlights.length > 5 && (
                <div className="text-center">
                    <Button
                        variant="outline"
                        onClick={() => setShowAll(true)}
                        className="mt-4"
                    >
                        <ChevronsDown className="mr-2 h-4 w-4" />
                        Show More ({filteredFlights.length - 5} remaining)
                    </Button>
                </div>
            )}
        </div>
    );
}