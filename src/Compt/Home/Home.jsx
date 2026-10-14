import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import SatelliteMap from '../Map/SatelliteMap';
import AIAssistant from '../AI/AIAssistant';
import AdminDashboard from '../Admin/AdminDashboard';
import { initialVehicles, chargingStations, updateTelemetry } from '../MockData/mockTelemetry';
import './Home.css';

// Preset locations for quick New Delhi geocoding
const locationCoordinates = {
  "Indira Gandhi International Airport, New Delhi": { lat: 28.5562, lon: 77.1001 },
  "India Gate, Rajpath, New Delhi": { lat: 28.6129, lon: 77.2295 },
  "New Delhi Railway Station, New Delhi": { lat: 28.6418, lon: 77.2208 },
  "AIIMS Hospital, Sri Aurobindo Marg, New Delhi": { lat: 28.5684, lon: 77.2113 },
  "Unnamed Road, Sultanpur, Bihar": { lat: 28.6200, lon: 77.2300 }, // Placed close to Delhi for demo visual routing
  "Sultanpur, Bihar": { lat: 28.6200, lon: 77.2300 }
};

const Home = () => {
  // Navigation & Page Tabs State
  const [activeTab, setActiveTab] = useState('book'); // 'home' | 'book' | 'track' | 'fleet' | 'admin'
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Fleet & Telemetry State
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedStationId, setSelectedStationId] = useState(null);

  // Map layer toggle settings
  const [layers, setLayers] = useState({
    satellite: true,
    streets: true,
    charging: true,
    terrain: false,
    traffic: false
  });

  // Inputs & Booking Form
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropoffCoords, setDropoffCoords] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [rideType, setRideType] = useState('Standard');
  const [rideDate, setRideDate] = useState('Today');
  const [rideTime, setRideTime] = useState('Now');
  const [passengers, setPassengers] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Digital Wallet');

  // Booking Flow Control States
  const [bookingState, setBookingState] = useState('idle'); // 'idle' | 'searching' | 'driver_assigned' | 'in_progress' | 'completed'
  const [assignedVehicle, setAssignedVehicle] = useState(null);
  const [rideOTP, setRideOTP] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  // Mocking search history (previous cities/locations searched)
  const [searchHistory, setSearchHistory] = useState([
    'Unnamed Road, Sultanpur, Bihar',
    'Indira Gandhi International Airport, New Delhi',
    'India Gate, Rajpath, New Delhi'
  ]);

  // Weather data mockup
  const weatherData = {
    temp: 31,
    condition: 'Sunny',
    wind: '12 km/h',
    rain: '5%',
    visibility: '10 km'
  };

  // Notification items
  const notificationsList = [
    { id: 1, text: "Battery Swap Station Khan Market is fully loaded.", time: "2 min ago" },
    { id: 2, text: "Promo code 'GOGREEN' applied: ₹50 discount ready.", time: "10 min ago" },
    { id: 3, text: "Your carbon offset reached a milestone of 15kg!", time: "1 hour ago" }
  ];

  // Geocode location strings (pre-loaded or dynamic OSM lookup)
  const geocodeLocation = async (address, type) => {
    if (!address.trim()) return;

    // Check presets first
    const preset = Object.keys(locationCoordinates).find(key => 
      key.toLowerCase().includes(address.toLowerCase()) || address.toLowerCase().includes(key.toLowerCase())
    );

    if (preset) {
      const coords = locationCoordinates[preset];
      if (type === 'pickup') {
        setPickupCoords(coords);
      } else {
        setDropoffCoords(coords);
      }
      return;
    }

    // Dynamic OpenStreetMap geocoding fallback
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        { headers: { 'User-Agent': 'EV-Ride-Web-App' } }
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        if (type === 'pickup') {
          setPickupCoords(coords);
        } else {
          setDropoffCoords(coords);
        }
      } else {
        // Mock random coords around New Delhi if geocoder fails
        const mockCoords = {
          lat: 28.6139 + (Math.random() - 0.5) * 0.08,
          lon: 77.2090 + (Math.random() - 0.5) * 0.08
        };
        if (type === 'pickup') setPickupCoords(mockCoords);
        else setDropoffCoords(mockCoords);
      }
    } catch {
      // Offline fallback
      const mockCoords = {
        lat: 28.6139 + (Math.random() - 0.5) * 0.08,
        lon: 77.2090 + (Math.random() - 0.5) * 0.08
      };
      if (type === 'pickup') setPickupCoords(mockCoords);
      else setDropoffCoords(mockCoords);
    }
  };

  // Run dynamic vehicle simulation telemetry
  useEffect(() => {
    const timer = setInterval(() => {
      setVehicles((prev) => updateTelemetry(prev));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Simulate active ride vehicle driving to destination
  useEffect(() => {
    let driveInterval;
    if (bookingState === 'in_progress' && pickupCoords && dropoffCoords && assignedVehicle) {
      let step = 0;
      const totalSteps = 10;

      driveInterval = setInterval(() => {
        step += 1;
        const progress = step / totalSteps;
        setProgressPercent(Math.floor(progress * 100));

        // Interpolate vehicle coordinates
        const curLat = pickupCoords.lat + (dropoffCoords.lat - pickupCoords.lat) * progress;
        const curLon = pickupCoords.lon + (dropoffCoords.lon - pickupCoords.lon) * progress;

        setVehicles((prev) => 
          prev.map((v) => 
            v.id === assignedVehicle.id 
              ? { ...v, lat: curLat, lon: curLon, speed: 52, battery: Math.max(10, v.battery - 1) }
              : v
          )
        );

        if (step >= totalSteps) {
          clearInterval(driveInterval);
          setBookingState('completed');
          toast.success("You have arrived at your destination! Ride completed.");
        }
      }, 1500);
    }

    return () => {
      if (driveInterval) clearInterval(driveInterval);
    };
  }, [bookingState, pickupCoords, dropoffCoords, assignedVehicle]);

  // Handle current location GPS fetch
  const handleCurrentLocationGPS = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    toast.loading("Fetching current location coordinates...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss();
        const address = "Unnamed Road, Sultanpur, Bihar"; // standard mock geocode address
        setPickup(address);
        setPickupCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        toast.success("Pickup set to GPS current location!");
      },
      () => {
        toast.dismiss();
        const fallback = "Unnamed Road, Sultanpur, Bihar";
        setPickup(fallback);
        setPickupCoords({ lat: 28.6139, lon: 77.2090 });
        toast.success("Location set to Sultanpur, Bihar (Fallback)");
      }
    );
  };

  // AI Copilot Auto-Fill hook
  const handleBookRideFromAI = (aiPickup, aiDropoff) => {
    setPickup(aiPickup);
    setDropoff(aiDropoff);
    geocodeLocation(aiPickup, 'pickup');
    geocodeLocation(aiDropoff, 'dropoff');
    setActiveTab('book');
  };

  // Initiate Booking searches
  const handleBookRideSubmit = () => {
    if (!pickup || !dropoff) {
      toast.error("Please enter both pickup and destination locations");
      return;
    }
    
    // Save to history
    if (!searchHistory.includes(pickup)) {
      setSearchHistory(prev => [pickup, ...prev].slice(0, 5));
    }

    // Geocode coordinates if not already loaded
    geocodeLocation(pickup, 'pickup');
    geocodeLocation(dropoff, 'dropoff');

    // Trigger loading search state
    setBookingState('searching');
    toast.loading("Finding nearest EV drivers...");

    setTimeout(() => {
      toast.dismiss();
      // Match a vehicle of the requested type or take first available
      const driver = vehicles.find(v => v.type === vehicleType && v.isAvailable) || vehicles[0];
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      
      setAssignedVehicle(driver);
      setRideOTP(otp);
      setBookingState('driver_assigned');
      toast.success(`Driver ${driver.driverName} accepted your booking!`);

      // Set chat welcome message from driver
      setChatMessages([
        { sender: 'driver', text: `Hi there! I am heading to your pickup location. Your OTP is ${otp}.`, time: "Just now" }
      ]);
    }, 2500);
  };

  const handleStartRide = () => {
    setProgressPercent(0);
    setBookingState('in_progress');
    toast.success("EV Ride started! Travel safely.");
  };

  const handleSendDriverMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userText, time: "Just now" }]);
    setChatInput('');

    // Driver auto-reply simulation
    setTimeout(() => {
      let reply = "Got it! See you shortly.";
      if (bookingState === 'driver_assigned') {
        reply = "I'm almost at your pickup address. Please share the OTP.";
      } else if (bookingState === 'in_progress') {
        reply = "Navigating along the optimal 3D path now.";
      }
      setChatMessages(prev => [...prev, { sender: 'driver', text: reply, time: "Just now" }]);
    }, 1500);
  };

  // Admin modifiers
  const handleAddVehicle = (newEv) => {
    setVehicles((prev) => [newEv, ...prev]);
  };

  const handleDeleteVehicle = (id) => {
    setVehicles((prev) => prev.filter(v => v.id !== id));
    toast.success(`EV #${id} decommissioned from fleet.`);
  };

  // Find info objects based on clicks
  const clickedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  const clickedStation = chargingStations.find(s => s.id === selectedStationId);

  return (
    <div className={`ev-app-page ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      
      {/* ─── FLOATING TOP NAVBAR ─── */}
      <nav className="ev-navbar">
        <div className="nav-left">
          <div className="nav-brand">
            <span className="brand-bolt">⚡</span>
            <span className="brand-text">EV RIDE</span>
          </div>
          <ul className="nav-menu">
            <li className={activeTab === 'home' ? 'active' : ''} onClick={() => { setActiveTab('home'); setBookingState('idle'); }}>Home</li>
            <li className={activeTab === 'book' ? 'active' : ''} onClick={() => setActiveTab('book')}>Book Ride</li>
            <li className={activeTab === 'track' ? 'active' : ''} onClick={() => setActiveTab('track')}>Track Ride</li>
            <li className={activeTab === 'fleet' ? 'active' : ''} onClick={() => setActiveTab('fleet')}>Fleet</li>
            <li className={activeTab === 'admin' ? 'active' : ''} onClick={() => setActiveTab('admin')}>Admin Panel</li>
          </ul>
        </div>

        <div className="nav-right">
          <div className="nav-search-bar">
            <input 
              type="text" 
              placeholder="Search station or place..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim()) {
                  setPickup(searchQuery);
                  geocodeLocation(searchQuery, 'pickup');
                  toast.success(`Searching location: ${searchQuery}`);
                }
              }}
            />
            <button className="search-icon-btn" onClick={() => {
              if (searchQuery.trim()) {
                setPickup(searchQuery);
                geocodeLocation(searchQuery, 'pickup');
                toast.success(`Searching location: ${searchQuery}`);
              }
            }}>🔍</button>
          </div>

          {/* Dark Mode toggle */}
          <button className="nav-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Notification bell badge */}
          <div className="nav-notif-wrapper">
            <button className="nav-notif-btn" onClick={() => setShowNotifications(!showNotifications)}>
              🔔
              <span className="notif-badge">3</span>
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  className="notif-dropdown"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                >
                  <div className="notif-header">Live Telemetry Alerts</div>
                  {notificationsList.map(n => (
                    <div key={n.id} className="notif-item">
                      <div className="notif-item-text">{n.text}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile menu */}
          <div className="nav-profile-wrapper">
            <div className="nav-avatar" onClick={() => setShowProfile(!showProfile)}>
              👤
            </div>
            {showProfile && (
              <div className="profile-dropdown">
                <div className="profile-header">Kumar Ayushman</div>
                <div className="profile-sub">VIP EV Rider</div>
                <div className="profile-divider"></div>
                <div className="profile-item">Ride History</div>
                <div className="profile-item" onClick={() => toast.success("Connected to digital wallet: Balance ₹2,450")}>Digital Wallet</div>
                <div className="profile-item" onClick={() => toast.success("SOS triggers active")}>Emergency SOS</div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ─── MAIN CONTENT CONTAINER (MAP & FLOATING CARDS) ─── */}
      <div className="ev-main-layout">
        
        {/* Full-screen 3D Map Component */}
        <div className="map-view-panel">
          <SatelliteMap 
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            vehicles={vehicles}
            chargingStations={chargingStations}
            layers={layers}
            selectedVehicleId={selectedVehicleId}
            setSelectedVehicleId={setSelectedVehicleId}
            selectedStationId={selectedStationId}
            setSelectedStationId={setSelectedStationId}
          />
        </div>

        {/* ─── LEFT FLOATING BOOKING CARD ─── */}
        {activeTab === 'book' && bookingState === 'idle' && (
          <motion.div 
            className="floating-card left-booking-card"
            initial={{ opacity: 0, x: -80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="card-title">Book Your Electric Ride</h2>
            
            <div className="booking-inputs-grid">
              {/* Pickup location input */}
              <div className="booking-input-group">
                <label>Pickup Location</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    placeholder="Enter pickup address" 
                    value={pickup} 
                    onChange={(e) => {
                      setPickup(e.target.value);
                      if (locationCoordinates[e.target.value]) {
                        setPickupCoords(locationCoordinates[e.target.value]);
                      }
                    }}
                  />
                  <button className="gps-btn" onClick={handleCurrentLocationGPS} title="Locate via GPS">
                    ◎
                  </button>
                </div>
              </div>

              {/* Destination location input */}
              <div className="booking-input-group">
                <label>Destination Location</label>
                <input 
                  type="text" 
                  placeholder="Enter destination address" 
                  value={dropoff} 
                  onChange={(e) => {
                    setDropoff(e.target.value);
                    if (locationCoordinates[e.target.value]) {
                      setDropoffCoords(locationCoordinates[e.target.value]);
                    }
                  }}
                />
              </div>

              {/* Row: Vehicle type & Ride type */}
              <div className="booking-row">
                <div className="booking-input-group flex-1">
                  <label>Vehicle Type</label>
                  <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    <option value="Car">Electric Car</option>
                    <option value="SUV">Electric SUV</option>
                    <option value="Van">Electric Van</option>
                    <option value="Scooter">Electric Scooter</option>
                    <option value="Bike">Electric Bike</option>
                    <option value="Luxury EV">Luxury EV</option>
                  </select>
                </div>

                <div className="booking-input-group flex-1">
                  <label>Ride Type</label>
                  <select value={rideType} onChange={(e) => setRideType(e.target.value)}>
                    <option value="Standard">Standard</option>
                    <option value="Share Pool">Share Pool</option>
                    <option value="Priority Hub">Priority Hub</option>
                  </select>
                </div>
              </div>

              {/* Row: Date & Time */}
              <div className="booking-row">
                <div className="booking-input-group flex-1">
                  <label>Date</label>
                  <input type="text" value={rideDate} onChange={(e) => setRideDate(e.target.value)} />
                </div>
                <div className="booking-input-group flex-1">
                  <label>Time</label>
                  <input type="text" value={rideTime} onChange={(e) => setRideTime(e.target.value)} />
                </div>
              </div>

              {/* Row: Passenger count & payment */}
              <div className="booking-row">
                <div className="booking-input-group flex-1">
                  <label>Passengers</label>
                  <input type="number" min="1" max="7" value={passengers} onChange={(e) => setPassengers(parseInt(e.target.value))} />
                </div>
                <div className="booking-input-group flex-1">
                  <label>Payment Mode</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="Digital Wallet">Digital Wallet</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="QR Scan Pay">QR Scan Pay</option>
                  </select>
                </div>
              </div>

              {/* Promo code */}
              <div className="booking-input-group">
                <label>Promo Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. GOGREEN" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </div>
            </div>

            {/* Pricing / Fare estimates card snippet */}
            <div className="fare-estimate-box">
              <div className="fare-estimate-title">Green Energy Estimate</div>
              <div className="fare-estimate-value">₹245.00 - ₹280.00</div>
              <div className="carbon-saved-tag">🌱 Offsets 1.8kg carbon offset</div>
            </div>

            <div className="booking-actions-row">
              <button className="book-btn" onClick={handleBookRideSubmit}>Book EV Ride Now</button>
              <button className="estimate-btn" onClick={() => {
                geocodeLocation(pickup, 'pickup');
                geocodeLocation(dropoff, 'dropoff');
                toast.success("Seeding route planner coordinates!");
              }}>Estimate Route</button>
            </div>
          </motion.div>
        )}

        {/* ─── VEHICLE SELECTOR CARD SLIDER ─── */}
        {activeTab === 'book' && bookingState === 'idle' && (
          <div className="ev-fleet-scroller-panel">
            <h3 className="panel-subtitle">Futuristic EV Fleet Availability</h3>
            <div className="ev-cards-scroller">
              {vehicles.map((v) => (
                <div 
                  key={v.id} 
                  className={`ev-fleet-card ${selectedVehicleId === v.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedVehicleId(v.id);
                    setVehicleType(v.type);
                    setSelectedStationId(null);
                  }}
                >
                  <div className="ev-fleet-header">
                    <span className="ev-fleet-name">{v.model}</span>
                    <span className="ev-fleet-type">{v.type}</span>
                  </div>
                  <div className="ev-fleet-stats">
                    <div className="ev-stat">
                      <span>🔋 Battery:</span>
                      <strong style={{ color: v.battery > 50 ? '#00ff88' : '#ffaa00' }}>{v.battery}%</strong>
                    </div>
                    <div className="ev-stat">
                      <span>📏 Range:</span>
                      <strong>{v.range} km</strong>
                    </div>
                    <div className="ev-stat">
                      <span>💵 Price:</span>
                      <strong>₹{v.pricePerKm}/km</strong>
                    </div>
                    <div className="ev-stat">
                      <span>🕐 ETA:</span>
                      <strong>{v.eta} min</strong>
                    </div>
                  </div>
                  <div className="ev-fleet-footer">
                    <span>💺 {v.seats} Seats</span>
                    <span className="ev-fleet-driver">👤 {v.driverName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── RIDE TRACKING TIMELINE / ORDER TRACKER ─── */}
        {bookingState !== 'idle' && (
          <motion.div 
            className="floating-card tracking-order-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <h3 className="card-title">EV Tracking Feed</h3>
            
            {/* Booking State timeline indicator */}
            <div className="tracking-timeline">
              <div className={`timeline-step ${bookingState === 'searching' ? 'active' : 'done'}`}>
                <div className="step-circle">🔍</div>
                <div className="step-label">Searching</div>
              </div>
              <div className={`timeline-step ${bookingState === 'driver_assigned' ? 'active' : bookingState === 'in_progress' || bookingState === 'completed' ? 'done' : ''}`}>
                <div className="step-circle">🚗</div>
                <div className="step-label">Assigned</div>
              </div>
              <div className={`timeline-step ${bookingState === 'in_progress' ? 'active' : bookingState === 'completed' ? 'done' : ''}`}>
                <div className="step-circle">🛣️</div>
                <div className="step-label">On Trip</div>
              </div>
              <div className={`timeline-step ${bookingState === 'completed' ? 'active done' : ''}`}>
                <div className="step-circle">🏁</div>
                <div className="step-label">Arrived</div>
              </div>
            </div>

            {/* Live Driver profile card details */}
            {assignedVehicle && (
              <div className="driver-profile-info-box">
                <div className="driver-card-top">
                  <img src={assignedVehicle.driverPhoto} alt={assignedVehicle.driverName} className="driver-photo-avatar" />
                  <div className="driver-text-meta">
                    <div className="driver-name-header">{assignedVehicle.driverName}</div>
                    <div className="driver-rating-sub">⭐ {assignedVehicle.driverRating} VIP Rated</div>
                    <div className="driver-vehicle-details">{assignedVehicle.model} ({assignedVehicle.vehicleNumber})</div>
                  </div>
                </div>

                <div className="driver-otp-section">
                  <span>Ride OTP Check:</span>
                  <strong>{rideOTP}</strong>
                </div>

                {/* Progress bar for trip */}
                {bookingState === 'in_progress' && (
                  <div className="trip-progress-box">
                    <div className="trip-progress-labels">
                      <span>Ride Progress</span>
                      <span>{progressPercent}% Completed</span>
                    </div>
                    <div className="trip-progress-track">
                      <div className="trip-progress-bar" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div className="tracking-actions-box">
                  {bookingState === 'driver_assigned' && (
                    <button className="start-ride-btn" onClick={handleStartRide}>Start EV Ride</button>
                  )}
                  {bookingState === 'completed' && (
                    <button className="cancel-ride-btn" onClick={() => setBookingState('idle')}>Book Another Ride</button>
                  )}
                  <button className="cancel-ride-btn" onClick={() => {
                    setBookingState('idle');
                    toast.success("EV booking cancelled successfully.");
                  }}>
                    Cancel Ride
                  </button>
                </div>

                {/* Chat window with Driver */}
                <div className="driver-chat-container">
                  <div className="chat-log-box">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-line ${msg.sender}`}>
                        <div className="chat-bubble">{msg.text}</div>
                      </div>
                    ))}
                  </div>
                  <form className="chat-input-row" onSubmit={handleSendDriverMessage}>
                    <input 
                      type="text" 
                      placeholder="Send chat message to driver..." 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit">➔</button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ─── RIGHT OVERLAY INFO PANEL (TELEMETRY / VEHICLE DETAILS) ─── */}
        {pickupCoords && dropoffCoords && (
          <div className="floating-card right-telemetry-panel">
            <h3 className="card-title">Live Route Telemetry</h3>
            <div className="telemetry-grid">
              <div className="telemetry-item">
                <span className="telemetry-label">ESTIMATED FARE</span>
                <span className="telemetry-val">₹258.00</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">CO2 OFFSET</span>
                <span className="telemetry-val green">🌱 1.8 kg Saved</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">ROUTE DISTANCE</span>
                <span className="telemetry-val">5.4 km</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">EST. TRAVEL TIME</span>
                <span className="telemetry-val">12 mins</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">BATTERY CONSUMED</span>
                <span className="telemetry-val">~6% Battery</span>
              </div>
              <div className="telemetry-item">
                <span className="telemetry-label">CHARGING STOPS</span>
                <span className="telemetry-val">0 Stops required</span>
              </div>
            </div>

            {/* Weather Widget */}
            <div className="telemetry-divider"></div>
            <div className="telemetry-weather-widget">
              <div className="weather-title">Route Climate Conditions</div>
              <div className="weather-stats">
                <span>🌡️ {weatherData.temp}°C {weatherData.condition}</span>
                <span>💨 Wind: {weatherData.wind}</span>
                <span>💧 Humidity: {weatherData.rain}</span>
              </div>
              <p className="weather-impact-note">*Optimal climate conditions. No range degradation.*</p>
            </div>
          </div>
        )}

        {/* Map Layers & Station Control Widget */}
        <div className="floating-card map-layer-control-panel">
          <div className="control-header">Map Layers Feed</div>
          <div className="layer-checkbox-row">
            <label className={`layer-toggle-chip ${layers.streets ? 'active' : ''}`} onClick={() => setLayers(prev => ({ ...prev, streets: !prev.streets }))}>
              🗺️ Hybrid Overlays
            </label>
            <label className={`layer-toggle-chip ${layers.charging ? 'active' : ''}`} onClick={() => setLayers(prev => ({ ...prev, charging: !prev.charging }))}>
              ⚡ Charging Stations
            </label>
            <label className={`layer-toggle-chip ${layers.traffic ? 'active' : ''}`} onClick={() => {
              setLayers(prev => ({ ...prev, traffic: !prev.traffic }));
              toast.success(layers.traffic ? "Traffic view disabled" : "Live traffic density view active!");
            }}>
              🚦 Live Traffic
            </label>
          </div>
        </div>

        {/* Selected Map Marker Popups (Side Drawer Panel Overlay) */}
        {clickedVehicle && (
          <div className="floating-card map-item-drawer">
            <button className="drawer-close-btn" onClick={() => setSelectedVehicleId(null)}>×</button>
            <h4 className="drawer-title">{clickedVehicle.model}</h4>
            <div className="drawer-details-box">
              <div className="drawer-row">
                <span>Driver Name:</span>
                <strong>{clickedVehicle.driverName}</strong>
              </div>
              <div className="drawer-row">
                <span>Plate Number:</span>
                <strong>{clickedVehicle.vehicleNumber}</strong>
              </div>
              <div className="drawer-row">
                <span>Current Speed:</span>
                <strong>{clickedVehicle.speed} km/h</strong>
              </div>
              <div className="drawer-row">
                <span>Battery Level:</span>
                <strong style={{ color: clickedVehicle.battery > 50 ? '#00ff88' : '#ffaa00' }}>
                  {clickedVehicle.battery}% ({clickedVehicle.range} km range)
                </strong>
              </div>
              <div className="drawer-row">
                <span>Engine Temp:</span>
                <strong>{clickedVehicle.temperature}°C</strong>
              </div>
              <div className="drawer-row">
                <span>Active Status:</span>
                <strong className={clickedVehicle.isAvailable ? 'text-green' : 'text-red'}>
                  {clickedVehicle.isAvailable ? 'Available' : 'Occupied'}
                </strong>
              </div>
            </div>
            <button className="drawer-action-btn" onClick={() => {
              setPickup(clickedVehicle.driverName + " EV Location");
              setPickupCoords({ lat: clickedVehicle.lat, lon: clickedVehicle.lon });
              setSelectedVehicleId(null);
              toast.success(`Set pickup coordinates at driver's location!`);
            }}>
              Book this driver
            </button>
          </div>
        )}

        {clickedStation && (
          <div className="floating-card map-item-drawer">
            <button className="drawer-close-btn" onClick={() => setSelectedStationId(null)}>×</button>
            <h4 className="drawer-title">⚡ {clickedStation.name}</h4>
            <div className="drawer-details-box">
              <div className="drawer-row">
                <span>Total Chargers:</span>
                <strong>{clickedStation.available} Hubs Free</strong>
              </div>
              <div className="drawer-row">
                <span>Fast Charging Level:</span>
                <strong>{clickedStation.fast} Superchargers (120 kW)</strong>
              </div>
              <div className="drawer-row">
                <span>Slow Charge Slots:</span>
                <strong>{clickedStation.slow} Slots (22 kW)</strong>
              </div>
              <div className="drawer-row">
                <span>Rate per kWh:</span>
                <strong>{clickedStation.price}</strong>
              </div>
              <div className="drawer-row">
                <span>Current Queue:</span>
                <strong style={{ color: clickedStation.queue > 2 ? '#ff4466' : '#00ff88' }}>
                  {clickedStation.queue} vehicles waiting
                </strong>
              </div>
              <div className="drawer-row">
                <span>Status:</span>
                <strong className="text-green">{clickedStation.status}</strong>
              </div>
            </div>
            <button className="drawer-action-btn" onClick={() => {
              setDropoff(clickedStation.name);
              setDropoffCoords({ lat: clickedStation.lat, lon: clickedStation.lon });
              setSelectedStationId(null);
              toast.success(`Rerouting to ${clickedStation.name} charging hub!`);
            }}>
              Route to Hub
            </button>
          </div>
        )}

        {/* ─── ADMIN DASHBOARD TAB OVERLAY PANEL ─── */}
        {activeTab === 'admin' && (
          <div className="admin-overlay-modal">
            <div className="admin-header-row">
              <h2>Admin Analytics Dashboard</h2>
              <button className="admin-close-btn" onClick={() => setActiveTab('book')}>Close Panel ×</button>
            </div>
            <AdminDashboard 
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onDeleteVehicle={handleDeleteVehicle}
            />
          </div>
        )}

        {/* ─── FLOATING AI CHAT COPILOT ASSISTANT ─── */}
        <AIAssistant onBookRideFromAI={handleBookRideFromAI} />

      </div>
    </div>
  );
};

export default Home;
