import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const SatelliteMap = ({
  pickupCoords,
  dropoffCoords,
  vehicles,
  chargingStations,
  layers,
  selectedVehicleId,
  setSelectedVehicleId,
  selectedStationId,
  setSelectedStationId,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({
    pickup: null,
    dropoff: null,
    vehicles: {},
    stations: [],
  });

  // Base map style using free Esri satellite imagery
  const mapStyle = {
    version: 8,
    projection: {
      type: 'globe'
    },
    sky: {
      'atmosphere-blend': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0, 1,
        7, 0
      ]
    },
    sources: {
      'satellite-imagery': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, GeoEye, Earthstar Geographics'
      },
      'osm-streets': {
        type: 'raster',
        tiles: [
          'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png' // dark street overlay for cool hybrid view
        ],
        tileSize: 256,
        attribution: '&copy; CartoDB'
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite-imagery',
        minzoom: 0,
        maxzoom: 20
      },
      {
        id: 'streets-layer',
        type: 'raster',
        source: 'osm-streets',
        minzoom: 0,
        maxzoom: 20,
        paint: {
          'raster-opacity': 0.35 // semi-transparent street/label overlay
        }
      }
    ]
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [77.2090, 28.6139], // Centered at New Delhi (India Gate coords)
      zoom: 13,
      pitch: 45, // tilted for 3D perspective
      bearing: -17,
      maxPitch: 85,
      minZoom: 0, // Enable zooming out all the way to see the whole earth
    });

    map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      visualizePitch: true,
    }), 'top-right');

    // Auto-rotation (spin) globe logic
    const secondsPerRevolution = 240;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    const spinGlobe = () => {
      const zoom = map.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          // Slow down as we zoom in
          const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.getCenter();
        center.lng -= distancePerSecond;
        map.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    };

    map.on('mousedown', () => { 
      userInteracting = true; 
      map.stop(); // Stop any active auto-rotation easeTo immediately
    });
    map.on('dragstart', () => { 
      userInteracting = true; 
      map.stop();
    });
    map.on('touchstart', () => { 
      userInteracting = true; 
      map.stop();
    });
    map.on('mouseup', () => { userInteracting = false; spinGlobe(); });
    map.on('touchend', () => { userInteracting = false; spinGlobe(); });
    map.on('zoomstart', () => { 
      userInteracting = true; 
      map.stop();
    });
    map.on('zoomend', () => { userInteracting = false; spinGlobe(); });
    map.on('moveend', () => { spinGlobe(); });

    map.on('load', () => {
      mapRef.current = map;
      
      // Make zoom speed faster (scroll wheel and trackpad)
      map.scrollZoom.setWheelZoomRate(1 / 100);
      map.scrollZoom.setZoomRate(1 / 25);

      // Set 3D Globe projection
      map.setProjection({
        type: 'globe'
      });
      
      map.addSource('route-source', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        }
      });

      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00d4ff',
          'line-width': 5,
          'line-opacity': 0.85,
        }
      });

      map.addLayer({
        id: 'route-glow',
        type: 'line',
        source: 'route-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00d4ff',
          'line-width': 12,
          'line-blur': 6,
          'line-opacity': 0.35
        }
      });

      setTimeout(() => {
        map.flyTo({
          center: [77.2090, 28.6139],
          zoom: 13.5,
          pitch: 50,
          bearing: 30,
          speed: 0.8,
          curve: 1.4,
          essential: true
        });
      }, 500);

      // Start initial spin if zoomed out
      spinGlobe();
    });

    return () => {
      map.remove();
    };
  }, []);

  // Update layer visibility
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.getLayer('streets-layer')) {
      map.setLayoutProperty('streets-layer', 'visibility', layers.streets ? 'visible' : 'none');
    }
  }, [layers.streets]);

  // Update Route geometry when pickup and dropoff change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const source = map.getSource('route-source');
    if (!source) return;

    if (pickupCoords && dropoffCoords) {
      // Generate a simulated route pathway with curve
      const p1 = [pickupCoords.lon, pickupCoords.lat];
      const p2 = [dropoffCoords.lon, dropoffCoords.lat];

      // Interpolate coordinates for a slightly winding street route
      const midLon = (p1[0] + p2[0]) / 2 + (p2[1] - p1[1]) * 0.15;
      const midLat = (p1[1] + p2[1]) / 2 + (p1[0] - p2[0]) * 0.15;
      
      const routeCoords = [
        p1,
        [p1[0] + (midLon - p1[0]) * 0.5, p1[1] + (midLat - p1[1]) * 0.4],
        [midLon, midLat],
        [midLon + (p2[0] - midLon) * 0.5, midLat + (p2[1] - midLat) * 0.6],
        p2
      ];

      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: routeCoords
        }
      });

      // Fly to fit bounds of route
      const lons = [p1[0], p2[0]];
      const lats = [p1[1], p2[1]];
      const bounds = [
        [Math.min(...lons) - 0.015, Math.min(...lats) - 0.015],
        [Math.max(...lons) + 0.015, Math.max(...lats) + 0.015]
      ];

      map.fitBounds(bounds, {
        padding: { top: 120, bottom: 120, left: 450, right: 120 },
        pitch: 45,
        bearing: 15,
        duration: 2000
      });
    } else {
      // Clear route
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: []
        }
      });
    }
  }, [pickupCoords, dropoffCoords]);

  // Update Pickup / Dropoff Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Pickup Marker
    if (pickupCoords) {
      if (markersRef.current.pickup) {
        markersRef.current.pickup.setLngLat([pickupCoords.lon, pickupCoords.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'map-marker pickup-marker';
        el.innerHTML = `
          <div class="marker-pulse-ring"></div>
          <div class="marker-pin-inner">◎</div>
        `;
        markersRef.current.pickup = new maplibregl.Marker({ element: el })
          .setLngLat([pickupCoords.lon, pickupCoords.lat])
          .addTo(map);
      }
    } else if (markersRef.current.pickup) {
      markersRef.current.pickup.remove();
      markersRef.current.pickup = null;
    }

    // Dropoff Marker
    if (dropoffCoords) {
      if (markersRef.current.dropoff) {
        markersRef.current.dropoff.setLngLat([dropoffCoords.lon, dropoffCoords.lat]);
      } else {
        const el = document.createElement('div');
        el.className = 'map-marker dropoff-marker';
        el.innerHTML = `
          <div class="marker-pin-inner">■</div>
        `;
        markersRef.current.dropoff = new maplibregl.Marker({ element: el })
          .setLngLat([dropoffCoords.lon, dropoffCoords.lat])
          .addTo(map);
      }
    } else if (markersRef.current.dropoff) {
      markersRef.current.dropoff.remove();
      markersRef.current.dropoff = null;
    }
  }, [pickupCoords, dropoffCoords]);

  // Update Dynamic Tracking Vehicles on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove obsolete markers
    Object.keys(markersRef.current.vehicles).forEach((id) => {
      if (!vehicles.find(v => v.id.toString() === id)) {
        markersRef.current.vehicles[id].remove();
        delete markersRef.current.vehicles[id];
      }
    });

    // Add or update active vehicle markers
    vehicles.forEach((vehicle) => {
      const id = vehicle.id.toString();
      const markerPos = [vehicle.lon, vehicle.lat];

      if (markersRef.current.vehicles[id]) {
        // Smoothly animate/move marker position
        markersRef.current.vehicles[id].setLngLat(markerPos);
        
        // Update battery color & rotation if styling permits
        const el = markersRef.current.vehicles[id].getElement();
        const battText = el.querySelector('.marker-batt');
        if (battText) battText.textContent = `${vehicle.battery}%`;
      } else {
        const el = document.createElement('div');
        el.className = `map-marker vehicle-marker ${vehicle.type === 'Scooter' || vehicle.type === 'Bike' ? 'two-wheeler' : ''} ${selectedVehicleId === vehicle.id ? 'selected' : ''}`;
        
        // Battery color based on level
        const battColor = vehicle.battery > 50 ? '#00ff88' : vehicle.battery > 20 ? '#ffaa00' : '#ff4466';

        el.innerHTML = `
          <div class="vehicle-icon-wrapper">
            ${vehicle.type === 'Scooter' ? '🛵' : vehicle.type === 'Bike' ? '🚲' : '🚗'}
          </div>
          <div class="marker-batt-bubble" style="border-color: ${battColor}">
            <span class="marker-batt">${vehicle.battery}%</span>
          </div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedVehicleId(vehicle.id);
          setSelectedStationId(null);
          
          map.flyTo({
            center: markerPos,
            zoom: 15.5,
            pitch: 55,
            bearing: map.getBearing() + 15,
            duration: 1000
          });
        });

        markersRef.current.vehicles[id] = new maplibregl.Marker({ element: el })
          .setLngLat(markerPos)
          .addTo(map);
      }
    });
  }, [vehicles, selectedVehicleId]);

  // Update Charging Stations Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old stations
    markersRef.current.stations.forEach(m => m.remove());
    markersRef.current.stations = [];

    // Add new stations if layer is enabled
    if (layers.charging) {
      chargingStations.forEach((station) => {
        const markerPos = [station.lon, station.lat];

        const el = document.createElement('div');
        el.className = `map-marker station-marker ${selectedStationId === station.id ? 'selected' : ''}`;
        el.innerHTML = `
          <div class="station-icon-wrapper">⚡</div>
          <div class="station-slots-count">${station.available}</div>
        `;

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedStationId(station.id);
          setSelectedVehicleId(null);

          map.flyTo({
            center: markerPos,
            zoom: 16,
            pitch: 60,
            duration: 1200
          });
        });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat(markerPos)
          .addTo(map);
          
        markersRef.current.stations.push(marker);
      });
    }
  }, [chargingStations, layers.charging, selectedStationId]);

  return (
    <div className="satellite-map-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', background: '#0b0b19' }} />
      
      {/* Visual UI layer overlays for compass/tilt indicator */}
      <div className="map-attribution-watermark">
        Satellite tracking visual feed active
      </div>
    </div>
  );
};

export default SatelliteMap;
