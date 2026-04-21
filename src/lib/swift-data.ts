
/**
 * @fileOverview Relational Global SWIFT/BIC Database for OmniTools AI.
 * Structured to support Institutions, Countries, and Branches as per ISO 9362.
 */

import { countriesWithCities } from './cities';

export interface SwiftRecord {
    id: string;
    bank: string;
    bankCode: string; // First 4
    country: string;
    countryCode: string; // 2 Letters ISO
    locationCode: string; // 2 Chars
    branchCode: string; // 3 Chars
    city: string;
    branch: string;
    address: string;
    swiftCode: string;
    isActive: boolean;
}

export const swiftDatabase: SwiftRecord[] = [
    // --- NEPAL ---
    { id: "np-1", bank: "Nepal Bank Limited", bankCode: "NEPA", country: "Nepal", countryCode: "NP", locationCode: "KA", branchCode: "XXX", city: "Kathmandu", branch: "Head Office", address: "Dharmapath, Kathmandu", swiftCode: "NEPANPKAXXX", isActive: true },
    { id: "np-2", bank: "Nabil Bank Limited", bankCode: "NABL", country: "Nepal", countryCode: "NP", locationCode: "KA", branchCode: "XXX", city: "Kathmandu", branch: "Head Office", address: "Beena Marg, Teendhara, Kathmandu", swiftCode: "NABLNPKAXXX", isActive: true },
    { id: "np-3", bank: "Global IME Bank", bankCode: "GIME", country: "Nepal", countryCode: "NP", locationCode: "KA", branchCode: "XXX", city: "Kathmandu", branch: "Kamaladi Branch", address: "Kamaladi, Kathmandu", swiftCode: "GIMENPKAXXX", isActive: true },
    { id: "np-4", bank: "NIC Asia Bank", bankCode: "NICA", country: "Nepal", countryCode: "NP", locationCode: "KA", branchCode: "XXX", city: "Kathmandu", branch: "Thapathali", address: "Thapathali, Kathmandu", swiftCode: "NICANPKAXXX", isActive: true },
    { id: "np-5", bank: "Global IME Bank", bankCode: "GIME", country: "Nepal", countryCode: "NP", locationCode: "PK", branchCode: "001", city: "Pokhara", branch: "Lakeside Branch", address: "Lakeside, Pokhara", swiftCode: "GIMENPPK001", isActive: true },
    { id: "np-6", bank: "Rastriya Banijya Bank", bankCode: "RABB", country: "Nepal", countryCode: "NP", locationCode: "KA", branchCode: "XXX", city: "Kathmandu", branch: "Central Office", address: "Singha Durbar Plaza, Kathmandu", swiftCode: "RABBNPKAXXX", isActive: true },
    { id: "np-7", bank: "Nepal Bank Limited", bankCode: "NEPA", country: "Nepal", countryCode: "NP", locationCode: "BI", branchCode: "002", city: "Biratnagar", branch: "Biratnagar Branch", address: "Main Road, Biratnagar", swiftCode: "NEPANPBI002", isActive: true },
    { id: "np-8", bank: "Global IME Bank", bankCode: "GIME", country: "Nepal", countryCode: "NP", locationCode: "BU", branchCode: "003", city: "Butwal", branch: "Butwal Branch", address: "Traffic Chowk, Butwal", swiftCode: "GIMENPBU003", isActive: true },
    { id: "np-9", bank: "Nabil Bank Limited", bankCode: "NABL", country: "Nepal", countryCode: "NP", locationCode: "CI", branchCode: "004", city: "Chitwan", branch: "Narayangarh Branch", address: "Sahid Chowk, Narayangarh", swiftCode: "NABLNPCI004", isActive: true },
    
    // --- INDIA ---
    { id: "in-1", bank: "State Bank of India", bankCode: "SBIN", country: "India", countryCode: "IN", locationCode: "BB", branchCode: "XXX", city: "Mumbai", branch: "Main Branch", address: "Madam Cama Road, Nariman Point", swiftCode: "SBININBBXXX", isActive: true },
    { id: "in-2", bank: "HDFC Bank Limited", bankCode: "HDFC", country: "India", countryCode: "IN", locationCode: "BB", branchCode: "XXX", city: "Mumbai", branch: "Sandoz House Branch", address: "Dr. Annie Besant Road, Worli", swiftCode: "HDFCINBBXXX", isActive: true },
    { id: "in-3", bank: "ICICI Bank Limited", bankCode: "ICIC", country: "India", countryCode: "IN", locationCode: "BB", branchCode: "XXX", city: "Mumbai", branch: "Bandra Kurla Complex", address: "Plot No. C-7, G Block", swiftCode: "ICICINBBXXX", isActive: true },
    { id: "in-4", bank: "Punjab National Bank", bankCode: "PUNB", country: "India", countryCode: "IN", locationCode: "DL", branchCode: "XXX", city: "New Delhi", branch: "Head Office", address: "Sector 10, Dwarka", swiftCode: "PUNBINDLXXX", isActive: true },
    { id: "in-5", bank: "Axis Bank Limited", bankCode: "AXIS", country: "India", countryCode: "IN", locationCode: "BB", branchCode: "XXX", city: "Mumbai", branch: "Corporate Office", address: "Wadia International Centre, Worli", swiftCode: "AXISINBBXXX", isActive: true },
    { id: "in-6", bank: "State Bank of India", bankCode: "SBIN", country: "India", countryCode: "IN", locationCode: "CH", branchCode: "001", city: "Chennai", branch: "Chennai Main", address: "Rajaji Salai, Chennai", swiftCode: "SBININCH001", isActive: true },
    { id: "in-7", bank: "HDFC Bank Limited", bankCode: "HDFC", country: "India", countryCode: "IN", locationCode: "KO", branchCode: "002", city: "Kolkata", branch: "Stephen House", address: "Hemanta Basu Sarani", swiftCode: "HDFCIKO002", isActive: true },

    // --- UNITED ARAB EMIRATES ---
    { id: "ae-1", bank: "Emirates NBD", bankCode: "EBIL", country: "United Arab Emirates", countryCode: "AE", locationCode: "AD", branchCode: "XXX", city: "Dubai", branch: "Head Office", address: "Baniyas Road, Deira, Dubai", swiftCode: "EBILAEADXXX", isActive: true },
    { id: "ae-2", bank: "Mashreq Bank", bankCode: "MSHQ", country: "United Arab Emirates", countryCode: "AE", locationCode: "AD", branchCode: "XXX", city: "Dubai", branch: "Head Office", address: "Al Ghurair City, Deira, Dubai", swiftCode: "MSHQAEADXXX", isActive: true },
    { id: "ae-3", bank: "First Abu Dhabi Bank", bankCode: "NBAD", country: "United Arab Emirates", countryCode: "AE", locationCode: "AD", branchCode: "XXX", city: "Abu Dhabi", branch: "FAB Building", address: "Khalifa Business Park, Abu Dhabi", swiftCode: "NBADAEADXXX", isActive: true },
    { id: "ae-4", bank: "Abu Dhabi Commercial Bank", bankCode: "ADCB", country: "United Arab Emirates", countryCode: "AE", locationCode: "AD", branchCode: "XXX", city: "Abu Dhabi", branch: "ADCB Head Office", address: "Sheikh Zayed Street", swiftCode: "ADCBAEADXXX", isActive: true },
    { id: "ae-5", bank: "RAKBANK", bankCode: "RAKB", country: "United Arab Emirates", countryCode: "AE", locationCode: "RK", branchCode: "XXX", city: "Ras Al Khaimah", branch: "RAK Operations", address: "RAK Road", swiftCode: "RAKBAERKXXX", isActive: true },
    { id: "ae-6", bank: "Emirates NBD", bankCode: "EBIL", country: "United Arab Emirates", countryCode: "AE", locationCode: "AJ", branchCode: "001", city: "Ajman", branch: "Ajman City", address: "Sheikh Khalifa Street", swiftCode: "EBILAEAJ001", isActive: true },

    // --- QATAR ---
    { id: "qa-1", bank: "Qatar National Bank", bankCode: "QNBA", country: "Qatar", countryCode: "QA", locationCode: "QA", branchCode: "XXX", city: "Doha", branch: "Head Office", address: "Corniche Road, Doha", swiftCode: "QNBAQAQAXXX", isActive: true },
    { id: "qa-2", bank: "Doha Bank", bankCode: "DOHB", country: "Qatar", countryCode: "QA", locationCode: "QA", branchCode: "XXX", city: "Doha", branch: "Doha Bank Tower", address: "West Bay", swiftCode: "DOHBQAQAXXX", isActive: true },

    // --- SAUDI ARABIA ---
    { id: "sa-1", bank: "Al Rajhi Bank", bankCode: "RAJB", country: "Saudi Arabia", countryCode: "SA", locationCode: "RI", branchCode: "XXX", city: "Riyadh", branch: "Riyadh HQ", address: "Olaya Street", swiftCode: "RAJBSARIXXX", isActive: true },
    { id: "sa-2", bank: "Saudi National Bank (SNB)", bankCode: "NCBK", country: "Saudi Arabia", countryCode: "SA", locationCode: "JE", branchCode: "XXX", city: "Jeddah", branch: "King Abdulaziz Road", address: "Jeddah HQ", swiftCode: "NCBKSAJEXXX", isActive: true },

    // --- UNITED STATES ---
    { id: "us-1", bank: "JPMorgan Chase Bank", bankCode: "CHAS", country: "United States", countryCode: "US", locationCode: "33", branchCode: "XXX", city: "New York", branch: "Head Office", address: "270 Park Avenue, New York, NY", swiftCode: "CHASUS33XXX", isActive: true },
    { id: "us-2", bank: "Bank of America", bankCode: "BOFA", country: "United States", countryCode: "US", locationCode: "3N", branchCode: "XXX", city: "Charlotte", branch: "Global HQ", address: "100 North Tryon Street, Charlotte, NC", swiftCode: "BOFAUS3NXXX", isActive: true },
    { id: "us-3", bank: "Wells Fargo Bank", bankCode: "PNBP", country: "United States", countryCode: "US", locationCode: "33", branchCode: "XXX", city: "San Francisco", branch: "Main Office", address: "420 Montgomery Street", swiftCode: "PNBPUS33XXX", isActive: true },

    // --- UNITED KINGDOM ---
    { id: "gb-1", bank: "HSBC Bank PLC", bankCode: "HBUK", country: "United Kingdom", countryCode: "GB", locationCode: "44", branchCode: "XXX", city: "London", branch: "Global HQ", address: "8 Canada Square, London", swiftCode: "HBUKGB44XXX", isActive: true },
    { id: "gb-2", bank: "Barclays Bank PLC", bankCode: "BARC", country: "United Kingdom", countryCode: "GB", locationCode: "22", branchCode: "XXX", city: "London", branch: "Head Office", address: "1 Churchill Place, London", swiftCode: "BARCGB22XXX", isActive: true },

    // --- CANADA ---
    { id: "ca-1", bank: "Royal Bank of Canada", bankCode: "ROYC", country: "Canada", countryCode: "CA", locationCode: "T2", branchCode: "XXX", city: "Toronto", branch: "Head Office", address: "200 Bay Street", swiftCode: "ROYCCAT2XXX", isActive: true },
    { id: "ca-2", bank: "Toronto-Dominion Bank (TD)", bankCode: "TDOM", country: "Canada", countryCode: "CA", locationCode: "T2", branchCode: "XXX", city: "Toronto", branch: "TD Centre", address: "66 Wellington St West", swiftCode: "TDOMCAT2XXX", isActive: true },

    // --- AUSTRALIA ---
    { id: "au-1", bank: "Commonwealth Bank", bankCode: "CTBA", country: "Australia", countryCode: "AU", locationCode: "2S", branchCode: "XXX", city: "Sydney", branch: "Main Branch", address: "11 Harbour Street", swiftCode: "CTBAAU2SXXX", isActive: true },
    { id: "au-2", bank: "Westpac Banking Corp", bankCode: "WPAC", country: "Australia", countryCode: "AU", locationCode: "2S", branchCode: "XXX", city: "Sydney", branch: "Westpac Place", address: "275 Kent Street", swiftCode: "WPACAU2SXXX", isActive: true },

    // --- JAPAN ---
    { id: "jp-1", bank: "MUFG Bank Limited", bankCode: "BOTK", country: "Japan", countryCode: "JP", locationCode: "JT", branchCode: "XXX", city: "Tokyo", branch: "Central Branch", address: "2-7-1 Marunouchi", swiftCode: "BOTKJPJTXXX", isActive: true },
    { id: "jp-2", bank: "Mizuho Bank", bankCode: "MHCB", country: "Japan", countryCode: "JP", locationCode: "JT", branchCode: "XXX", city: "Tokyo", branch: "Head Office", address: "1-5-5 Otemachi", swiftCode: "MHCBJPJTXXX", isActive: true },

    // --- GERMANY ---
    { id: "de-1", bank: "Deutsche Bank AG", bankCode: "DEUT", country: "Germany", countryCode: "DE", locationCode: "FF", branchCode: "XXX", city: "Frankfurt", branch: "Global HQ", address: "Taunusanlage 12", swiftCode: "DEUTDEFFXXX", isActive: true },
    { id: "de-2", bank: "Commerzbank AG", bankCode: "COBA", country: "Germany", countryCode: "DE", locationCode: "FF", branchCode: "XXX", city: "Frankfurt", branch: "Head Office", address: "Kaiserplatz", swiftCode: "COBADEFFXXX", isActive: true },
];

export const getCountries = () => {
    const countries = Array.from(new Set(swiftDatabase.map(r => r.country))).sort();
    return countries.map(c => ({
        name: c,
        code: swiftDatabase.find(r => r.country === c)?.countryCode || ""
    }));
};

export const getBanksByCountry = (country: string) => {
    return Array.from(new Set(swiftDatabase.filter(r => r.country === country).map(r => r.bank))).sort();
};

export const getAllCitiesByCountry = (countryName: string) => {
    const countryData = countriesWithCities.find(c => c.country === countryName);
    return countryData ? countryData.cities.sort() : [];
};

export const getBranchesByCity = (country: string, bank: string, city: string) => {
    let branches = swiftDatabase.filter(r => r.country === country && r.bank === bank && r.city.toLowerCase() === city.toLowerCase());
    
    // If no specific branch in city, fallback to Head Office (XXX) for that bank in the country
    if (branches.length === 0) {
        branches = swiftDatabase.filter(r => r.country === country && r.bank === bank && r.branchCode === 'XXX');
    }
    
    return branches;
};

export const findByBic = (code: string): SwiftRecord | null => {
    const clean = code.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return swiftDatabase.find(r => r.swiftCode === clean) || null;
};
