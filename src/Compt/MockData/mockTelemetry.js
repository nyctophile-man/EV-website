// Mock Telemetry and Vehicle Database

export const initialVehicles = [
  {
    id: 101,
    model: "Tesla Model S (EV Car)",
    type: "Car",
    battery: 88,
    range: 390,
    pricePerKm: 18,
    eta: 3,
    seats: 4,
    driverName: "Amit Sharma",
    driverPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.9,
    driverPhone: "+91 98765 43210",
    vehicleNumber: "DL 3C AB 9812",
    speed: 42,
    lat: 28.6139, // India Gate center
    lon: 77.2090,
    temperature: 32,
    isAvailable: true,
  },
  {
    id: 102,
    model: "Kia EV6 (EV SUV)",
    type: "SUV",
    battery: 74,
    range: 310,
    pricePerKm: 24,
    eta: 5,
    seats: 6,
    driverName: "Vikram Singh",
    driverPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.7,
    driverPhone: "+91 99999 88888",
    vehicleNumber: "DL 1C AC 1109",
    speed: 55,
    lat: 28.6250, // Connaught Place
    lon: 77.2200,
    temperature: 34,
    isAvailable: true,
  },
  {
    id: 103,
    model: "Ather 450X (EV Scooter)",
    type: "Scooter",
    battery: 92,
    range: 110,
    pricePerKm: 6,
    eta: 2,
    seats: 1,
    driverName: "Rahul Verma",
    driverPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.8,
    driverPhone: "+91 98888 77777",
    vehicleNumber: "DL 9S XY 4321",
    speed: 38,
    lat: 28.6050, // Lodhi Gardens
    lon: 77.2150,
    temperature: 31,
    isAvailable: true,
  },
  {
    id: 104,
    model: "Ola S1 Pro (EV Bike)",
    type: "Bike",
    battery: 45,
    range: 95,
    pricePerKm: 8,
    eta: 4,
    seats: 2,
    driverName: "Sanjay Dutta",
    driverPhoto: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.5,
    driverPhone: "+91 97777 66666",
    vehicleNumber: "DL 4S YY 5543",
    speed: 40,
    lat: 28.6180, // National Museum
    lon: 77.2010,
    temperature: 33,
    isAvailable: true,
  },
  {
    id: 105,
    model: "Mercedes EQS (Luxury EV)",
    type: "Luxury EV",
    battery: 95,
    range: 460,
    pricePerKm: 35,
    eta: 6,
    seats: 4,
    driverName: "Rajesh Malhotra",
    driverPhoto: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.95,
    driverPhone: "+91 96666 55555",
    vehicleNumber: "DL 2C AX 0007",
    speed: 48,
    lat: 28.5920, // Humayun Tomb
    lon: 77.2400,
    temperature: 30,
    isAvailable: true,
  },
  {
    id: 106,
    model: "BYD e6 (EV Van)",
    type: "Van",
    battery: 62,
    range: 280,
    pricePerKm: 20,
    eta: 8,
    seats: 7,
    driverName: "Manoj Yadav",
    driverPhoto: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&h=120&q=80",
    driverRating: 4.6,
    driverPhone: "+91 95555 44444",
    vehicleNumber: "DL 5C AY 8876",
    speed: 35,
    lat: 28.6300, // Karol Bagh
    lon: 77.1900,
    temperature: 35,
    isAvailable: true,
  }
];

export const chargingStations = [
  {
    id: 301,
    name: "Connaught Place EV Hyper-Hub",
    lat: 28.6304,
    lon: 77.2177,
    available: 5,
    fast: 4,
    slow: 2,
    price: "₹12/kWh",
    queue: 1,
    status: "Open"
  },
  {
    id: 302,
    name: "South Ext Metro EV Plaza",
    lat: 28.5726,
    lon: 77.2104,
    available: 3,
    fast: 2,
    slow: 2,
    price: "₹15/kWh",
    queue: 3,
    status: "Open"
  },
  {
    id: 303,
    name: "Noida Sector-62 Chargepoint",
    lat: 28.6276,
    lon: 77.3726,
    available: 8,
    fast: 6,
    slow: 4,
    price: "₹10/kWh",
    queue: 0,
    status: "Open"
  },
  {
    id: 304,
    name: "Khan Market Swap Station",
    lat: 28.6002,
    lon: 77.2273,
    available: 12, // swap batteries available
    fast: 12,
    slow: 0,
    price: "₹150/swap",
    queue: 2,
    status: "Open"
  }
];

// Helper to simulate dynamic live tracking coordinate shifts
export const updateTelemetry = (vehicles) => {
  return vehicles.map((v) => {
    // If vehicle is moving, shift coordinates slightly along a circular path
    const angleChange = 0.0005 * (Math.random() > 0.5 ? 1 : -1);
    let newLat = v.lat;
    let newLon = v.lon;
    
    // Simulate active movement only for online/available vehicles
    if (v.isAvailable) {
      newLat = v.lat + angleChange * Math.sin(Date.now() / 10000);
      newLon = v.lon + angleChange * Math.cos(Date.now() / 10000);
    }
    
    // Simulate battery drainage (very slowly)
    let newBattery = v.battery;
    if (Math.random() > 0.9 && v.battery > 5) {
      newBattery -= 1;
    }

    // Simulate speed variations
    let newSpeed;
    if (v.isAvailable) {
      newSpeed = Math.max(10, Math.min(85, v.speed + Math.floor((Math.random() - 0.5) * 10)));
    } else {
      newSpeed = 0;
    }

    return {
      ...v,
      lat: newLat,
      lon: newLon,
      battery: newBattery,
      speed: newSpeed,
    };
  });
};
