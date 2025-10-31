"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Mail, MapPin, Bell, Pill, Save, Plus, X, Clock, Calendar, AlertTriangle, Heart, Trash2 } from "lucide-react"

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    location: "",
    latitude: "",
    longitude: "",
    phone: "",
    emergencyContact: "",
  })

  const [selectedConditions, setSelectedConditions] = useState<string[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [sensitivities, setSensitivities] = useState<string[]>([])
  const [loaded, setLoaded] = useState(false)
  const [locationChanged, setLocationChanged] = useState(false)
  const [updatingLocation, setUpdatingLocation] = useState(false)

  // Load user data from localStorage on mount
  useEffect(() => {
    const userProfileData = localStorage.getItem("userProfile")
    if (userProfileData) {
      const savedProfile = JSON.parse(userProfileData)
      
      setProfile({
        name: savedProfile.name || "",
        email: savedProfile.email || "",
        location: savedProfile.location || "",
        latitude: savedProfile.latitude || "",
        longitude: savedProfile.longitude || "",
        phone: savedProfile.phone || "",
        emergencyContact: savedProfile.emergencyContact || "",
      })
      
      setSelectedConditions(savedProfile.conditions || [])
      setMedications(savedProfile.medications || [])
      setSensitivities(savedProfile.sensitivities || [])
    }
    setLoaded(true)
  }, [])

  const updateLocationCoordinates = async () => {
    if (!profile.location) {
      alert("Please enter a location first")
      return
    }

    setUpdatingLocation(true)
    const API_KEY = "dec40a13839b118013db7cb66e62bd90"
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(profile.location)}&limit=1&appid=${API_KEY}`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        setProfile({
          ...profile,
          latitude: data[0].lat.toString(),
          longitude: data[0].lon.toString(),
          location: `${data[0].name}, ${data[0].state || data[0].country}`,
        })
        setLocationChanged(false)
        alert(`Location updated: ${data[0].name}, ${data[0].state || data[0].country}`)
      } else {
        alert("Location not found. Please try a different search term.")
      }
    } catch (error) {
      console.error("Error updating location:", error)
      alert("Unable to find location. Please try again.")
    } finally {
      setUpdatingLocation(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setUpdatingLocation(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          
          const API_KEY = "dec40a13839b118013db7cb66e62bd90"
          try {
            const response = await fetch(
              `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`
            )
            const data = await response.json()
            
            if (data && data.length > 0) {
              setProfile({
                ...profile,
                location: `${data[0].name}, ${data[0].state || data[0].country}`,
                latitude: latitude.toString(),
                longitude: longitude.toString(),
              })
              setLocationChanged(false)
              alert(`Location detected: ${data[0].name}, ${data[0].state || data[0].country}`)
            }
          } catch (error) {
            console.error("Error fetching location name:", error)
          } finally {
            setUpdatingLocation(false)
          }
        },
        (error) => {
          console.error("Error getting location:", error)
          alert("Unable to get your location. Please check permissions.")
          setUpdatingLocation(false)
        }
      )
    } else {
      alert("Geolocation is not supported by your browser.")
    }
  }

  const [showAddMedication, setShowAddMedication] = useState(false)
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", time: "" })

  const availableConditions = [
    { id: "asthma", name: "Asthma", description: "Chronic respiratory condition" },
    { id: "seasonal-allergies", name: "Seasonal Allergies", description: "Hay fever, pollen allergies" },
    { id: "copd", name: "COPD", description: "Chronic Obstructive Pulmonary Disease" },
    { id: "environmental-allergies", name: "Environmental Allergies", description: "Dust, mold, pet dander" },
    { id: "food-allergies", name: "Food Allergies", description: "Food-related allergic reactions" },
    { id: "sinusitis", name: "Chronic Sinusitis", description: "Sinus inflammation" },
    { id: "bronchitis", name: "Chronic Bronchitis", description: "Airway inflammation" },
  ]

  const availableSensitivities = [
    "Pollen (Trees)", "Pollen (Grass)", "Pollen (Ragweed)", "Pollen (Weeds)",
    "Dust Mites", "Pet Dander (Cats)", "Pet Dander (Dogs)", "Mold Spores",
    "Air Pollution (PM2.5)", "Air Pollution (Ozone)", "Smoke", "Cold Air",
    "Perfumes/Fragrances", "Chemical Fumes"
  ]

  const toggleCondition = (condition: string) => {
    if (selectedConditions.includes(condition)) {
      setSelectedConditions(selectedConditions.filter(c => c !== condition))
    } else {
      setSelectedConditions([...selectedConditions, condition])
    }
  }

  const toggleSensitivity = (sensitivity: string) => {
    if (sensitivities.includes(sensitivity)) {
      setSensitivities(sensitivities.filter(s => s !== sensitivity))
    } else {
      setSensitivities([...sensitivities, sensitivity])
    }
  }

  const addMedication = () => {
    if (newMed.name && newMed.dosage) {
      setMedications([...medications, { 
        id: Date.now(), 
        ...newMed,
        reminders: true 
      }])
      setNewMed({ name: "", dosage: "", frequency: "", time: "" })
      setShowAddMedication(false)
    }
  }

  const removeMedication = (id: number) => {
    setMedications(medications.filter(med => med.id !== id))
  }

  const saveProfile = () => {
    // Get existing profile data
    const existingData = localStorage.getItem("userProfile")
    const existing = existingData ? JSON.parse(existingData) : {}
    
    // Merge and save
    const updatedProfile = {
      ...existing,
      ...profile,
      conditions: selectedConditions,
      medications: medications,
      sensitivities: sensitivities,
    }
    
    localStorage.setItem("userProfile", JSON.stringify(updatedProfile))
    alert("Profile saved successfully!")
  }

  if (!loaded) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/70">Loading your profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white/95 mb-2 drop-shadow-lg">Profile Settings</h1>
        <p className="text-orange-300/70">Manage your health profile and personalize your ClearSky experience</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Personal Information - Full Width */}
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
              <User className="h-5 w-5 text-orange-400" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-orange-300/80 mb-2 block font-medium">Full Name *</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 focus:border-orange-400/50"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="text-sm text-orange-300/80 mb-2 block font-medium">Email *</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 focus:border-orange-400/50"
                  placeholder="your.email@example.com"
                />
              </div>
              <div>
                <label className="text-sm text-orange-300/80 mb-2 block font-medium">Phone Number</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 focus:border-orange-400/50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-orange-300/80 mb-2 block font-medium">Location *</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={profile.location}
                      onChange={(e) => {
                        setProfile({ ...profile, location: e.target.value })
                        setLocationChanged(true)
                      }}
                      className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 focus:border-orange-400/50"
                      placeholder="City, State or Zip Code"
                    />
                    <Button
                      onClick={updateLocationCoordinates}
                      disabled={!locationChanged || updatingLocation}
                      className="bg-orange-500/20 border border-orange-400/30 text-orange-300 hover:bg-orange-500/30 disabled:opacity-50"
                    >
                      {updatingLocation ? "Updating..." : "Update"}
                    </Button>
                    <Button
                      onClick={getCurrentLocation}
                      disabled={updatingLocation}
                      variant="outline"
                      className="bg-white/5 border-white/10 text-white/95 hover:bg-white/10"
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                  {profile.latitude && profile.longitude && (
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      ✓ Coordinates: {parseFloat(profile.latitude).toFixed(4)}, {parseFloat(profile.longitude).toFixed(4)}
                    </p>
                  )}
                  {locationChanged && (
                    <p className="text-xs text-amber-400">
                      ⚠ Location changed. Click "Update" to get new coordinates for accurate data.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm text-orange-300/80 mb-2 block font-medium">Emergency Contact</label>
              <Input
                value={profile.emergencyContact}
                onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                className="bg-white/5 backdrop-blur-xl border-white/10 text-white/95 focus:border-orange-400/50"
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <Button 
              onClick={saveProfile}
              className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 backdrop-blur-2xl border border-orange-400/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white/95">Your Health Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Conditions</span>
              <span className="text-2xl font-bold text-orange-400">{selectedConditions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Medications</span>
              <span className="text-2xl font-bold text-orange-400">{medications.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/70">Sensitivities</span>
              <span className="text-2xl font-bold text-orange-400">{sensitivities.length}</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Profile Complete
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Respiratory Conditions */}
        <Card className="lg:col-span-3 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
              <Heart className="h-5 w-5 text-orange-400" />
              Respiratory Conditions & Allergies
            </CardTitle>
            <p className="text-sm text-orange-300/60 mt-1">Select all conditions that apply to you</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {availableConditions.map((condition) => (
                <button
                  key={condition.id}
                  onClick={() => toggleCondition(condition.name)}
                  className={`p-4 rounded-xl text-left transition-all border ${
                    selectedConditions.includes(condition.name)
                      ? "bg-orange-500/20 border-orange-400/50 shadow-lg shadow-orange-500/10"
                      : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-sm font-semibold text-white/95">{condition.name}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedConditions.includes(condition.name)
                        ? "border-orange-400 bg-orange-400"
                        : "border-white/30"
                    }`}>
                      {selectedConditions.includes(condition.name) && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-white/60">{condition.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Medications */}
        <Card className="lg:col-span-2 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
                <Pill className="h-5 w-5 text-orange-400" />
                Medication Management
              </CardTitle>
              <Button 
                onClick={() => setShowAddMedication(!showAddMedication)}
                size="sm"
                className="bg-orange-500/20 border border-orange-400/30 text-orange-300 hover:bg-orange-500/30"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <p className="text-sm text-orange-300/60 mt-1">Track medications and set reminders</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {showAddMedication && (
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-400/30 space-y-3">
                <h3 className="text-sm font-semibold text-orange-300">Add New Medication</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    placeholder="Medication name"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white/95"
                  />
                  <Input
                    placeholder="Dosage (e.g., 10mg)"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    className="bg-white/5 border-white/10 text-white/95"
                  />
                  <Input
                    placeholder="Frequency (e.g., Daily)"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                    className="bg-white/5 border-white/10 text-white/95"
                  />
                  <Input
                    placeholder="Time (e.g., 09:00 AM)"
                    value={newMed.time}
                    onChange={(e) => setNewMed({ ...newMed, time: e.target.value })}
                    className="bg-white/5 border-white/10 text-white/95"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addMedication} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                    Add Medication
                  </Button>
                  <Button 
                    onClick={() => setShowAddMedication(false)} 
                    variant="outline"
                    className="bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-orange-400/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white/95">{med.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-orange-300/70">
                        <span className="flex items-center gap-1">
                          <Pill className="h-3 w-3" />
                          {med.dosage}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {med.frequency}
                        </span>
                        {med.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {med.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeMedication(med.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={med.reminders}
                      className="h-4 w-4"
                      readOnly
                    />
                    <span className="text-xs text-white/70">Enable reminders</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Environmental Sensitivities */}
        <Card className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              Sensitivities
            </CardTitle>
            <p className="text-sm text-orange-300/60 mt-1">Environmental triggers</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {availableSensitivities.map((sensitivity) => (
                <button
                  key={sensitivity}
                  onClick={() => toggleSensitivity(sensitivity)}
                  className={`w-full p-3 rounded-lg text-left text-sm transition-all border ${
                    sensitivities.includes(sensitivity)
                      ? "bg-orange-500/15 border-orange-400/40 text-white/95"
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{sensitivity}</span>
                    {sensitivities.includes(sensitivity) && (
                      <div className="w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="lg:col-span-3 bg-white/5 backdrop-blur-2xl border border-white/10 shadow-xl hover:border-white/20 transition-all">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white/95 flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-400" />
              Notification Preferences
            </CardTitle>
            <p className="text-sm text-orange-300/60 mt-1">Customize your alerts and reminders</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: "Medication Reminders", desc: "Daily medication alerts", checked: true },
                { label: "Air Quality Alerts", desc: "When AQI changes significantly", checked: true },
                { label: "Pollen Warnings", desc: "High pollen count notifications", checked: true },
                { label: "Weather Updates", desc: "Relevant weather changes", checked: false },
                { label: "Predictive Alerts", desc: "AI-powered health suggestions", checked: true },
                { label: "Activity Recommendations", desc: "Safe outdoor time suggestions", checked: true },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-sm font-medium text-white/95">{item.label}</h3>
                      <p className="text-xs text-white/60 mt-1">{item.desc}</p>
                    </div>
                    <input 
                      type="checkbox" 
                      defaultChecked={item.checked}
                      className="h-4 w-4 mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
