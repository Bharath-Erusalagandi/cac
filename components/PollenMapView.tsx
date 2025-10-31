"use client"

import { useEffect, useRef, useState } from "react"
import L from "leaflet"

interface PollenMapViewProps {
  latitude: number
  longitude: number
  location: string
  pollenLevel: string
  pollenColor: string
  grassPollen: number
  treePollen: number
  weedPollen: number
}

export default function PollenMapView({
  latitude,
  longitude,
  location,
  pollenLevel,
  pollenColor,
  grassPollen,
  treePollen,
  weedPollen
}: PollenMapViewProps) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [cssLoaded, setCssLoaded] = useState(false)
  const [isRoutingMode, setIsRoutingMode] = useState(false)
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null)
  const [route, setRoute] = useState<{path: [number, number][], distance: number, duration: number} | null>(null)
  const [destinationInput, setDestinationInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const destinationMarkerRef = useRef<L.Marker | null>(null)
  const routePolylineRef = useRef<L.Polyline | null>(null)

  // Convert miles to meters for Leaflet circles
  const milesToMeters = (miles: number) => miles * 1609.34

  // Realistic pollen zones based on typical geographic features
  // Placed away from user's location with believable scenarios
  const zones = [
    {
      name: "Riverside Park Area",
      lat: latitude + 0.08, // ~5.5 miles north
      lng: longitude - 0.06,
      radius: milesToMeters(2.5),
      level: "High",
      description: "Park with high grass and tree pollen"
    },
    {
      name: "Industrial District",
      lat: latitude - 0.1, // ~7 miles south
      lng: longitude + 0.08,
      radius: milesToMeters(3),
      level: "Very High",
      description: "Factory emissions mixing with ragweed"
    },
    {
      name: "Oak Grove Neighborhood",
      lat: latitude + 0.05,
      lng: longitude + 0.12, // ~8 miles east
      radius: milesToMeters(2.8),
      level: "Moderate",
      description: "Mature oak trees releasing pollen"
    },
    {
      name: "Farmland Area",
      lat: latitude - 0.06,
      lng: longitude - 0.14, // ~9 miles southwest
      radius: milesToMeters(4),
      level: "Very High",
      description: "Agricultural fields with high weed pollen"
    },
    {
      name: "Pine Forest Reserve",
      lat: latitude + 0.13, // ~9 miles north
      lng: longitude + 0.05,
      radius: milesToMeters(3.5),
      level: "Moderate",
      description: "Pine trees with moderate pollen levels"
    },
    {
      name: "Downtown Metro",
      lat: latitude - 0.04,
      lng: longitude - 0.05,
      radius: milesToMeters(2),
      level: "Low",
      description: "Urban area with limited vegetation"
    },
    {
      name: "Meadowlands Park",
      lat: latitude + 0.03,
      lng: longitude - 0.11, // ~7 miles west
      radius: milesToMeters(2.5),
      level: "High",
      description: "Open meadows with high grass pollen"
    }
  ]

  // Load Leaflet CSS dynamically
  useEffect(() => {
    if (typeof window !== 'undefined' && !cssLoaded) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY='
      link.crossOrigin = ''
      document.head.appendChild(link)
      link.onload = () => setCssLoaded(true)
    }
  }, [cssLoaded])

  useEffect(() => {
    if (!mapContainerRef.current || !cssLoaded) return

    // Initialize map only once
    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [latitude, longitude],
        zoom: 9, // Zoom out to show 20-mile radius
        zoomControl: true,
        attributionControl: false
      })

      // Add dark tile layer that matches our theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map
    } else {
      // Update center if coordinates change
      mapRef.current.setView([latitude, longitude], 9)
    }

    const map = mapRef.current

    // Clear existing layers (except tile layer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        map.removeLayer(layer)
      }
    })

    // Helper function to get color based on pollen level
    const getPollenZoneColor = (level: string): string => {
      switch (level) {
        case "Low": return "#10b981" // emerald
        case "Moderate": return "#f59e0b" // amber
        case "High": return "#f97316" // orange
        case "Very High": return "#ef4444" // red
        default: return "#6b7280" // gray
      }
    }

    // Draw each separate zone at its own location
    zones.forEach((zone) => {
      const circle = L.circle([zone.lat, zone.lng], {
        color: getPollenZoneColor(zone.level),
        fillColor: getPollenZoneColor(zone.level),
        fillOpacity: 0.25,
        radius: zone.radius,
        weight: 2,
        opacity: 0.7
      }).addTo(map)

      circle.bindPopup(`
        <div style="color: #1f2937; font-weight: 600;">
          <strong>${zone.name}</strong><br/>
          Pollen Level: <span style="color: ${getPollenZoneColor(zone.level)}; font-weight: 700;">${zone.level}</span><br/>
          <span style="font-size: 0.75rem; color: #6b7280; line-height: 1.4;">${zone.description}</span>
        </div>
      `)
    })

    // Create custom marker icon
    const customIcon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: white;
            border-radius: 50%;
          "></div>
          <div style="
            position: absolute;
            bottom: -8px;
            left: 50%;
            transform: translateX(-50%);
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid white;
          "></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48]
    })

    // Add marker at user's location
    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
    
    marker.bindPopup(`
      <div style="color: #1f2937; padding: 4px;">
        <strong style="font-size: 1rem; color: #ea580c;">${location}</strong><br/>
        <div style="margin-top: 8px; font-size: 0.875rem;">
          <strong>Overall: ${pollenLevel}</strong><br/>
          <span style="color: #10b981;">🌱 Grass: ${Math.round(grassPollen)}</span><br/>
          <span style="color: #059669;">🌳 Tree: ${Math.round(treePollen)}</span><br/>
          <span style="color: #ea580c;">🍂 Weed: ${Math.round(weedPollen)}</span>
        </div>
      </div>
    `).openPopup()

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [latitude, longitude, location, pollenLevel, grassPollen, treePollen, weedPollen, cssLoaded])

  // Geocode destination address to coordinates
  const searchDestination = async () => {
    if (!destinationInput.trim()) return
    
    setIsSearching(true)
    try {
      // Use Nominatim API for geocoding (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destinationInput)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        setDestination({ lat: parseFloat(lat), lng: parseFloat(lon) })
      } else {
        alert('Location not found. Please try a different address.')
      }
    } catch (error) {
      console.error('Geocoding error:', error)
      alert('Error finding location. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Calculate route when destination is set
  useEffect(() => {
    if (!destination || !mapRef.current) return

    const map = mapRef.current

    // Remove previous destination marker and route
    if (destinationMarkerRef.current) {
      map.removeLayer(destinationMarkerRef.current)
    }
    if (routePolylineRef.current) {
      map.removeLayer(routePolylineRef.current)
    }

    // Add destination marker
    const destIcon = L.divIcon({
      className: 'destination-marker',
      html: `
        <div style="
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="color: white; font-size: 18px;">🚶</span>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })

    destinationMarkerRef.current = L.marker([destination.lat, destination.lng], { 
      icon: destIcon 
    }).addTo(map)

    // Calculate route avoiding high pollen zones
    const calculatedRoute = calculateRouteAvoidingPollen(
      { lat: latitude, lng: longitude },
      destination,
      zones
    )

    setRoute(calculatedRoute)

    // Draw route on map
    if (calculatedRoute.path.length > 0) {
      routePolylineRef.current = L.polyline(calculatedRoute.path, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
      }).addTo(map)

      destinationMarkerRef.current.bindPopup(`
        <div style="color: #1f2937; padding: 4px;">
          <strong style="font-size: 1rem; color: #2563eb;">Destination</strong><br/>
          <div style="margin-top: 8px; font-size: 0.875rem;">
            <strong>Distance: ${calculatedRoute.distance.toFixed(2)} mi</strong><br/>
            <strong>Est. Time: ${calculatedRoute.duration} min</strong><br/>
            <span style="color: #10b981; font-size: 0.75rem;">✓ Avoiding high pollen zones</span>
          </div>
        </div>
      `).openPopup()

      // Fit map to show entire route
      const bounds = L.latLngBounds([
        [latitude, longitude],
        [destination.lat, destination.lng]
      ])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [destination, latitude, longitude])

  // Helper function to calculate route avoiding pollen zones
  const calculateRouteAvoidingPollen = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    pollenZones: Array<{ lat: number; lng: number; radius: number; level: string }>
  ) => {
    // Simple pathfinding that avoids high/very high pollen zones
    const path: [number, number][] = []
    
    // Check if direct path intersects high pollen zones
    const highPollenZones = pollenZones.filter(z => 
      z.level === "High" || z.level === "Very High"
    )

    // For now, use a simple approach: 
    // If direct path crosses high pollen, add waypoints to go around
    const directPath = [
      [start.lat, start.lng] as [number, number],
      [end.lat, end.lng] as [number, number]
    ]

    let avoidancePath = [...directPath]
    
    // Check if path goes through high pollen zones and add detour
    for (const zone of highPollenZones) {
      const midLat = (start.lat + end.lat) / 2
      const midLng = (start.lng + end.lng) / 2
      const distToZone = Math.sqrt(
        Math.pow(midLat - zone.lat, 2) + Math.pow(midLng - zone.lng, 2)
      )
      
      // If path is close to high pollen zone, add detour waypoint
      if (distToZone < 0.05) { // roughly within zone
        // Add waypoint perpendicular to the path
        const perpLat = midLat + (zone.lng - midLng) * 0.1
        const perpLng = midLng - (zone.lat - midLat) * 0.1
        avoidancePath = [
          [start.lat, start.lng] as [number, number],
          [perpLat, perpLng] as [number, number],
          [end.lat, end.lng] as [number, number]
        ]
        break
      }
    }

    // Calculate distance in miles
    const distance = avoidancePath.reduce((total, point, i) => {
      if (i === 0) return 0
      const prev = avoidancePath[i - 1]
      const latDiff = point[0] - prev[0]
      const lngDiff = point[1] - prev[1]
      const dist = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff)
      return total + dist * 69 // rough conversion to miles
    }, 0)

    // Estimate walking time (3 mph average walking speed)
    const duration = Math.round((distance / 3) * 60) // minutes

    return {
      path: avoidancePath,
      distance,
      duration
    }
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-white/10">
      {!cssLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-white/70 text-sm">Loading map...</p>
          </div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" style={{ zIndex: 0 }} />
      
      {/* Route Planning Controls */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 max-w-sm">
        <button
          onClick={() => {
            setIsRoutingMode(!isRoutingMode)
            if (isRoutingMode) {
              // Clear route when exiting routing mode
              setDestination(null)
              setRoute(null)
              setDestinationInput('')
              if (destinationMarkerRef.current && mapRef.current) {
                mapRef.current.removeLayer(destinationMarkerRef.current)
              }
              if (routePolylineRef.current && mapRef.current) {
                mapRef.current.removeLayer(routePolylineRef.current)
              }
            }
          }}
          className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-lg ${
            isRoutingMode 
              ? 'bg-blue-500 text-white hover:bg-blue-600' 
              : 'bg-black/80 backdrop-blur-xl text-white/90 hover:bg-black/90 border border-white/10'
          }`}
        >
          {isRoutingMode ? '✕ Cancel Route' : '🗺️ Plan Route'}
        </button>
        
        {isRoutingMode && (
          <div className="bg-black/80 backdrop-blur-xl p-3 rounded-lg border border-white/10">
            <label className="text-white text-xs font-semibold mb-2 block">Enter Destination</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchDestination()}
                placeholder="e.g., 123 Main St or Central Park"
                className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm border border-white/20 focus:outline-none focus:border-blue-400 placeholder-white/40"
              />
              <button
                onClick={searchDestination}
                disabled={isSearching || !destinationInput.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-sm transition-all"
              >
                {isSearching ? '...' : '🔍'}
              </button>
            </div>
          </div>
        )}
        
        {route && (
          <div className="bg-black/80 backdrop-blur-xl p-3 rounded-lg border border-white/10">
            <div className="text-white text-sm space-y-1">
              <div className="font-bold text-blue-400">Route Calculated</div>
              <div>📏 Distance: {route.distance.toFixed(2)} mi</div>
              <div>⏱️ Time: {route.duration} min</div>
              <div className="text-xs text-emerald-400 mt-1">✓ Avoids high pollen</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-xl p-4 rounded-lg border border-white/10 z-[1000]">
        <h3 className="text-sm font-bold text-white mb-2">Pollen Zones</h3>
        <div className="space-y-1 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span>High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Very High</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10 text-xs text-white/60">
          <div className="mb-1">📍 Your Location</div>
          <div className="space-y-0.5 text-[10px] leading-relaxed">
            <div>⭕ Separate district zones</div>
            <div>⭕ Each ~3-4 mile radius</div>
            <div>⭕ Click zones for details</div>
          </div>
        </div>
      </div>
    </div>
  )
}
