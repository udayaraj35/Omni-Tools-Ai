
export interface Airport {
    name: string;
    code: string;
    city: string;
    country: string;
}

export const airports: Airport[] = [
  // Nepal
  { name: "Tribhuvan International Airport", code: "KTM", city: "Kathmandu", country: "Nepal" },
  { name: "Gautam Buddha Airport", code: "BWA", city: "Bhairahawa", country: "Nepal" },
  { name: "Pokhara International Airport", code: "PKR", city: "Pokhara", country: "Nepal" },

  // UAE
  { name: "Dubai International Airport", code: "DXB", city: "Dubai", country: "United Arab Emirates" },
  { name: "Abu Dhabi International Airport", code: "AUH", city: "Abu Dhabi", country: "United Arab Emirates" },
  { name: "Sharjah International Airport", code: "SHJ", city: "Sharjah", country: "United Arab Emirates" },

  // Qatar
  { name: "Hamad International Airport", code: "DOH", city: "Doha", country: "Qatar" },

  // Saudi Arabia
  { name: "King Khalid International Airport", code: "RUH", city: "Riyadh", country: "Saudi Arabia" },
  { name: "King Abdulaziz International Airport", code: "JED", city: "Jeddah", country: "Saudi Arabia" },
  { name: "King Fahd International Airport", code: "DMM", city: "Dammam", country: "Saudi Arabia" },
  
  // Malaysia
  { name: "Kuala Lumpur International Airport", code: "KUL", city: "Kuala Lumpur", country: "Malaysia" },
  
  // Romania
  { name: "Henri Coandă International Airport", code: "OTP", city: "Bucharest", country: "Romania" },

  // Poland
  { name: "Warsaw Chopin Airport", code: "WAW", city: "Warsaw", country: "Poland" },
  
  // Malta
  { name: "Malta International Airport", code: "MLA", city: "Valletta", country: "Malta" },

  // Croatia
  { name: "Zagreb Airport (Franjo Tuđman Airport)", code: "ZAG", city: "Zagreb", country: "Croatia" },
  
  // India
  { name: "Indira Gandhi International Airport", code: "DEL", city: "Delhi", country: "India" },
  { name: "Chhatrapati Shivaji Maharaj International Airport", code: "BOM", city: "Mumbai", country: "India" },
  { name: "Kempegowda International Airport", code: "BLR", city: "Bangalore", country: "India" },
  { name: "Netaji Subhas Chandra Bose International Airport", code: "CCU", city: "Kolkata", country: "India" },
  { name: "Chennai International Airport", code: "MAA", city: "Chennai", country: "India" },

  // USA
  { name: "John F. Kennedy International Airport", code: "JFK", city: "New York", country: "United States" },
  { name: "Los Angeles International Airport", code: "LAX", city: "Los Angeles", country: "United States" },
  { name: "O'Hare International Airport", code: "ORD", city: "Chicago", country: "United States" },

  // UK
  { name: "Heathrow Airport", code: "LHR", city: "London", country: "United Kingdom" },
  { name: "Gatwick Airport", code: "LGW", city: "London", country: "United Kingdom" },
  { name: "Manchester Airport", code: "MAN", city: "Manchester", country: "United Kingdom" },

  // Japan
  { name: "Narita International Airport", code: "NRT", city: "Tokyo", country: "Japan" },
  { name: "Haneda Airport", code: "HND", city: "Tokyo", country: "Japan" },
  { name: "Kansai International Airport", code: "KIX", city: "Osaka", country: "Japan" },

  // Germany
  { name: "Frankfurt Airport", code: "FRA", city: "Frankfurt", country: "Germany" },
  { name: "Munich Airport", code: "MUC", city: "Munich", country: "Germany" },
  { name: "Berlin Brandenburg Airport", code: "BER", city: "Berlin", country: "Germany" },
];
