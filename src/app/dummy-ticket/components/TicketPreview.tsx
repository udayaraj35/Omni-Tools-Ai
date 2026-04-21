'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { PlaneTakeoff, Luggage, Globe, Calendar, User, ShieldCheck, BadgeCheck, ArrowRight, Loader2, Mail, Phone, Clock, Building2, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { Airport } from '@/lib/airports';
import QRCode from 'qrcode';
import { Separator } from '@/components/ui/separator';

interface TicketPreviewProps {
    bookingData: any;
    onQrClick?: () => void;
}

const TicketPreview = React.forwardRef(({ bookingData, onQrClick }: TicketPreviewProps, ref: any) => {
    const [qrUrl, setQrUrl] = useState<string | null>(null);

    useEffect(() => {
        if (bookingData?.pnr) {
            // Generate a QR code containing the PNR and main flight info
            const qrData = `PNR: ${bookingData.pnr}\nFlight: ${bookingData.flightDetails?.airline} ${bookingData.flightDetails?.flightNumber}\nRoute: ${bookingData.fromAirport?.code} to ${bookingData.toAirport?.code}\nDate: ${bookingData.departureDate}\nPassenger: ${bookingData.passengers[0]?.firstName} ${bookingData.passengers[0]?.lastName}\nAgency: ${bookingData.agencyName || 'OmniTools AI'}`;
            
            QRCode.toDataURL(qrData, {
                margin: 1,
                width: 200,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            })
            .then(url => setQrUrl(url))
            .catch(err => console.error(err));
        }
    }, [bookingData]);

    if (!bookingData) return null;
    
    const { pnr, passengers, flightDetails, returnFlightDetails, tripType, terminal, createdAt, issuedBy, contactEmail, contactPhone, agencyName, agencyAddress } = bookingData;
    const fromAirport: Airport = bookingData.fromAirport;
    const toAirport: Airport = bookingData.toAirport;
    const departureDate: string | Date = bookingData.departureDate;
    const returnDate: string | Date = bookingData.returnDate;
    
    const airline = flightDetails?.airline || "Omni Air";
    const airlineColor = flightDetails?.color || "#003366";
    const flightNumber = flightDetails?.flightNumber || `${airline.substring(0, 2).toUpperCase()}${Math.floor(100 + Math.random() * 8900)}`;
    const departureDateFormatted = departureDate ? format(new Date(departureDate), 'EEEE, dd LLL yyyy') : 'N/A';
    const issueDateFormatted = createdAt ? format(new Date(createdAt), 'dd LLL yyyy, HH:mm') : format(new Date(), 'dd LLL yyyy, HH:mm');

    const renderItinerary = (fDetails: any, from: any, to: any, dateText: string, label: string) => {
        const aColor = fDetails?.color || airlineColor;
        return (
            <section>
                <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">{label} Itinerary Details</h3>
                </div>
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                    <div className="bg-gray-50 px-6 py-3 flex justify-between items-center border-b border-gray-100">
                        <p className="font-black text-gray-800 text-sm uppercase tracking-tight">{dateText}</p>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest">ECONOMY</span>
                    </div>
                    <div className="p-8 grid grid-cols-3 items-center gap-4">
                        <div className="text-left">
                            <p className="text-4xl font-black text-gray-900 mb-1">{fDetails?.departureTime || 'N/A'}</p>
                            <p className="text-xl font-black leading-none opacity-60" style={{ color: aColor }}>{from?.code}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 truncate max-w-[120px]">{from?.city}</p>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-[10px] font-black text-blue-500 mb-1 italic">{fDetails?.duration || 'N/A'}</p>
                            <div className="relative flex items-center justify-center">
                                <div className="absolute w-full border-t border-dashed border-gray-300"></div>
                                <div className="bg-white px-3 z-10">
                                    <PlaneTakeoff className="h-6 w-6" style={{ color: aColor }} />
                                </div>
                            </div>
                            <p className="text-[9px] font-black text-gray-800 mt-2 uppercase tracking-[0.2em]">{fDetails?.stops || 'NON-STOP'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-gray-900 mb-1">{fDetails?.arrivalTime || 'N/A'}</p>
                            <p className="text-xl font-black leading-none opacity-60" style={{ color: aColor }}>{to?.code}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 truncate max-w-[120px]">{to?.city}</p>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-5 border-t border-gray-100 grid grid-cols-4 gap-4 text-center">
                        <div><p className="text-gray-400 font-bold uppercase text-[8px] mb-1">Flight No</p><p className="font-black text-sm text-gray-800">{fDetails?.flightNumber || flightNumber}</p></div>
                        <div><p className="text-gray-400 font-bold uppercase text-[8px] mb-1">Status</p><p className="font-black text-sm text-green-600">RESERVED</p></div>
                        <div><p className="text-gray-400 font-bold uppercase text-[8px] mb-1">Terminal</p><p className="font-black text-sm text-gray-800">{terminal || 'MAIN'}</p></div>
                        <div><p className="text-gray-400 font-bold uppercase text-[8px] mb-1">Baggage</p><p className="font-black text-sm text-gray-800 flex items-center justify-center gap-1.5">23 KG <Luggage className="h-3 w-3 text-blue-500"/></p></div>
                    </div>
                </div>
            </section>
        );
    };

    return (
        <div ref={ref} className="bg-white text-gray-900 font-sans shadow-2xl w-[850px] mx-auto rounded-xl border border-gray-200 overflow-hidden relative">
            {/* Top Premium Bar */}
            <div className="h-2 w-full" style={{ backgroundColor: airlineColor }}></div>
            
            {/* Header */}
            <header className="flex justify-between items-center p-8 bg-gradient-to-b from-gray-50 to-white border-b-2 border-gray-100">
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-lg" style={{ backgroundColor: airlineColor }}>
                        {airline.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-4xl tracking-tighter uppercase mb-1" style={{ color: airlineColor }}>{airline}</span>
                        <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                            <BadgeCheck className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Verified Electronic Ticket</span>
                        </div>
                    </div>
                </div>
                <div className="text-right bg-blue-50 p-4 rounded-xl border border-blue-100 min-w-[180px]">
                    <p className="text-[10px] text-blue-600 font-black uppercase tracking-wider mb-1">Booking Reference (PNR)</p>
                    <p className="text-4xl font-mono font-black text-blue-700 tracking-widest">{pnr}</p>
                </div>
            </header>

            <div className="p-8 grid grid-cols-12 gap-8">
                <div className="col-span-8 space-y-8">
                    {/* Status and Issuance */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-gray-400 uppercase">Status</span>
                                <span className="text-green-700 font-black text-lg tracking-tight leading-none">CONFIRMED</span>
                            </div>
                        </div>
                        <div className="text-right flex flex-col justify-center">
                            {agencyName && (
                                <div className="mb-1">
                                    <p className="text-gray-900 font-black text-xs uppercase leading-tight">{agencyName}</p>
                                    {agencyAddress && <p className="text-gray-500 text-[8px] leading-tight mt-0.5">{agencyAddress}</p>}
                                </div>
                            )}
                            <div className="flex items-center justify-end gap-2 border-t border-gray-200 mt-1 pt-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">ISSUED:</span>
                                <span className="text-[9px] font-black text-gray-700 flex items-center gap-1 whitespace-nowrap"><Clock className="h-2 w-2" /> {issueDateFormatted}</span>
                            </div>
                        </div>
                    </div>

                    {/* Passenger Information */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Passenger Manifest</h3>
                        </div>
                        <div className="space-y-3">
                            {passengers.map((p: any, index: number) => (
                                <div key={index} className="bg-white border border-gray-200 p-4 rounded-xl flex justify-between items-center hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center font-bold text-gray-500">{index + 1}</div>
                                        <div>
                                            <p className="font-black text-gray-900 text-lg uppercase leading-none mb-1">{p.title}. {p.firstName} {p.lastName}</p>
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 font-medium">
                                                <span className="flex items-center gap-1"><Globe className="h-3 w-3" /> {p.nationality}</span>
                                                <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> {p.passportNumber}</span>
                                                {p.bloodGroup && <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold text-[10px] border border-red-100">BLOOD: {p.bloodGroup}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-1">E-Ticket Number</p>
                                        <p className="font-mono text-sm font-black text-blue-600 tracking-tighter">{p.eTicketNumber || 'PENDING'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Contact Details */}
                    {(contactEmail || contactPhone) && (
                        <section>
                            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Contact Information</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {contactEmail && (
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <Mail className="h-4 w-4 text-blue-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Email</span>
                                            <span className="text-xs font-bold text-gray-700 truncate max-w-[180px]">{contactEmail}</span>
                                        </div>
                                    </div>
                                )}
                                {contactPhone && (
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <Phone className="h-4 w-4 text-blue-500" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-bold text-gray-400 uppercase">Phone</span>
                                            <span className="text-xs font-bold text-gray-700">{contactPhone}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>
                    )}
                    
                    {/* Itinerary Details */}
                    {renderItinerary(flightDetails, fromAirport, toAirport, departureDateFormatted, tripType === 'return' ? 'Outbound' : 'Flight')}
                    
                    {tripType === 'return' && returnFlightDetails && (
                        renderItinerary(returnFlightDetails, toAirport, fromAirport, returnDate ? format(new Date(returnDate), 'EEEE, dd LLL yyyy') : 'N/A', 'Return')
                    )}
                </div>

                {/* Vertical Boarding Pass Side */}
                <div className="col-span-4 flex flex-col items-center bg-gray-50 border-l-2 border-dashed border-gray-200 p-8">
                    <div className="text-center w-full mb-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Digital Boarding Pass</p>
                        <div 
                            className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-6 cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
                            onClick={onQrClick}
                        >
                            {qrUrl ? (
                                <div className="relative w-full aspect-square flex items-center justify-center">
                                    <Image src={qrUrl} alt="Ticket QR" width={180} height={180} className="object-contain" />
                                </div>
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-xl">
                                    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
                                </div>
                            )}
                            <div className="mt-4 pt-4 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-[9px] text-primary font-black uppercase flex items-center justify-center gap-2">
                                    <BadgeCheck className="h-3 w-3" /> View Data Details
                                </p>
                            </div>
                        </div>
                        <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">PNR</span>
                                <span className="text-blue-600 font-black">{pnr}</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">Class</span>
                                <span className="text-gray-800">ECONOMY (Y)</span>
                            </div>
                            <div className="flex justify-between text-[10px] font-bold">
                                <span className="text-gray-400 uppercase">Seat</span>
                                <span className="text-gray-800">ALLOCATED</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-auto w-full text-center py-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="font-black text-2xl text-gray-900">{fromAirport?.code}</span>
                            <ArrowRight className="h-4 w-4 text-blue-500" />
                            <span className="font-black text-2xl text-gray-900">{toAirport?.code}</span>
                        </div>
                        <p className="text-xs font-black text-blue-600 tracking-widest">{flightNumber}</p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-100 p-6 text-center border-t border-gray-200">
                <div className="max-w-xl mx-auto space-y-2">
                    <p className="text-[9px] text-red-600 font-bold uppercase leading-tight tracking-wide">
                        THIS IS A VERIFIABLE FLIGHT RESERVATION FOR VISA PURPOSES ONLY. IT HOLDS NO CASH VALUE AND CANNOT BE USED FOR BOARDING.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest shrink-0 px-2">Official Verification Info</p>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                    <p className="text-[9px] text-gray-500 font-medium">
                        VERIFY PNR: VISIT THE <span className="text-gray-800 font-bold">{airline.toUpperCase()}</span> OFFICIAL WEBSITE AND ENTER PNR <span className="text-blue-600 font-black">{pnr}</span>.
                    </p>
                    <p className="text-[8px] text-gray-400 uppercase mt-2">Issued by: {issuedBy || 'OmniTools AI'}</p>
                </div>
            </footer>
            
            {/* Security Background Pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.01] z-0 overflow-hidden select-none">
                {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="whitespace-nowrap font-black text-4xl -rotate-12 mb-12">
                        OMNITOOLS AI VERIFIED RESERVATION OMNITOOLS AI VERIFIED RESERVATION
                    </div>
                ))}
            </div>
        </div>
    )
});

TicketPreview.displayName = 'TicketPreview';

export { TicketPreview };