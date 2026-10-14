import { useState } from 'react';
import toast from 'react-hot-toast';

const AdminDashboard = ({ vehicles, onAddVehicle, onDeleteVehicle }) => {
  const [newModel, setNewModel] = useState('');
  const [newType, setNewType] = useState('Car');
  const [newBattery, setNewBattery] = useState(85);
  const [newDriver, setNewDriver] = useState('');

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newModel.trim() || !newDriver.trim()) {
      toast.error("Please fill in all vehicle details");
      return;
    }

    const vehicle = {
      id: Math.floor(Math.random() * 9000) + 1000,
      model: newModel.trim(),
      type: newType,
      battery: parseInt(newBattery),
      driverName: newDriver.trim(),
      vehicleNumber: `DL ${Math.floor(Math.random() * 9) + 1}C AB ${Math.floor(Math.random() * 9000) + 1000}`,
      speed: 0,
      lat: 28.6139 + (Math.random() - 0.5) * 0.05,
      lon: 77.2090 + (Math.random() - 0.5) * 0.05,
      temperature: 30 + Math.floor(Math.random() * 5),
      isAvailable: true,
    };

    onAddVehicle(vehicle);
    setNewModel('');
    setNewDriver('');
    toast.success("New EV added to active fleet successfully!");
  };

  return (
    <div className="admin-dashboard-container">
      {/* Analytics Row */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon green">⚡</div>
          <div className="admin-stat-info">
            <div className="admin-stat-title">Active Fleet</div>
            <div className="admin-stat-value">{vehicles.length} EVs</div>
            <div className="admin-stat-sub">34 online | 2 in charging</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon blue">💰</div>
          <div className="admin-stat-info">
            <div className="admin-stat-title">Daily Revenue</div>
            <div className="admin-stat-value">₹48,250</div>
            <div className="admin-stat-sub">+12.4% from yesterday</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon cyan">🌱</div>
          <div className="admin-stat-info">
            <div className="admin-stat-title">CO2 Saved</div>
            <div className="admin-stat-value">1,482.5 kg</div>
            <div className="admin-stat-sub">Equiv. to planting 72 trees</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-icon red">🔌</div>
          <div className="admin-stat-info">
            <div className="admin-stat-title">Avg. Charge Level</div>
            <div className="admin-stat-value">
              {(vehicles.reduce((acc, v) => acc + v.battery, 0) / (vehicles.length || 1)).toFixed(1)}%
            </div>
            <div className="admin-stat-sub">Optimal fleet battery health</div>
          </div>
        </div>
      </div>

      <div className="admin-content-grid">
        {/* Fleet List Section */}
        <div className="admin-panel fleet-list-panel">
          <h3 className="admin-panel-title">Active Fleet Tracker</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Model / Driver</th>
                  <th>Battery</th>
                  <th>Location (Lat/Lon)</th>
                  <th>Speed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => {
                  const battColor = vehicle.battery > 50 ? '#00ff88' : vehicle.battery > 20 ? '#ffaa00' : '#ff4466';
                  return (
                    <tr key={vehicle.id}>
                      <td className="vehicle-id">#{vehicle.id}</td>
                      <td>
                        <div className="driver-cell-info">
                          <span className="driver-vehicle-model">{vehicle.model}</span>
                          <span className="driver-name-sub">Driver: {vehicle.driverName}</span>
                        </div>
                      </td>
                      <td className="battery-cell">
                        <span className="battery-indicator-dot" style={{ backgroundColor: battColor }}></span>
                        {vehicle.battery}%
                      </td>
                      <td className="location-cell">{vehicle.lat.toFixed(4)}, {vehicle.lon.toFixed(4)}</td>
                      <td>{vehicle.speed} km/h</td>
                      <td>
                        <span className={`status-badge ${vehicle.isAvailable ? 'available' : 'on-trip'}`}>
                          {vehicle.isAvailable ? 'Available' : 'On Trip'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="delete-vehicle-btn"
                          onClick={() => onDeleteVehicle(vehicle.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add EV & Analytics Panel */}
        <div className="admin-panel-column">
          {/* Add EV Form */}
          <div className="admin-panel form-panel">
            <h3 className="admin-panel-title">Deploy New EV Vehicle</h3>
            <form onSubmit={handleAddSubmit} className="admin-add-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Vehicle Model</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Tesla Model 3" 
                    value={newModel}
                    onChange={(e) => setNewModel(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Vehicle Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Scooter">Scooter</option>
                    <option value="Bike">Bike</option>
                  </select>
                </div>
              </div>

              <div className="form-group-row">
                <div className="form-group">
                  <label>Driver Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ramesh Kumar" 
                    value={newDriver}
                    onChange={(e) => setNewDriver(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Initial Battery %</label>
                  <input 
                    type="number" 
                    min="1" 
                    max="100" 
                    value={newBattery}
                    onChange={(e) => setNewBattery(e.target.value)}
                  />
                </div>
              </div>

              <button type="submit" className="admin-submit-btn">
                Deploy to Map Network
              </button>
            </form>
          </div>

          {/* Charging Hub queue analytics */}
          <div className="admin-panel analytics-sidebar">
            <h3 className="admin-panel-title">Charging Station Analytics</h3>
            
            <div className="chart-bar-item">
              <div className="chart-bar-info">
                <span>Connaught Place Hub</span>
                <span>85% Capacity</span>
              </div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: '85%', backgroundColor: '#ff4466' }}></div>
              </div>
            </div>

            <div className="chart-bar-item">
              <div className="chart-bar-info">
                <span>South Ext Plaza</span>
                <span>40% Capacity</span>
              </div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: '40%', backgroundColor: '#00ff88' }}></div>
              </div>
            </div>

            <div className="chart-bar-item">
              <div className="chart-bar-info">
                <span>Noida Sec-62 Plaza</span>
                <span>15% Capacity</span>
              </div>
              <div className="chart-bar-track">
                <div className="chart-bar-fill" style={{ width: '15%', backgroundColor: '#00d4ff' }}></div>
              </div>
            </div>

            {/* Heatmap overlay dummy */}
            <div className="admin-demand-alert">
              <span className="pulse-alert-dot"></span>
              <strong>High demand cluster:</strong> India Gate area (7 requests pending)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
