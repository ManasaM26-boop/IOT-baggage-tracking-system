import { useState } from "react";
import BaggageTracking from "./BaggageTracking";

function Dashboard() {
  const [showTracking, setShowTracking] = useState(false);

  if (showTracking) {
    return (
      <BaggageTracking
        goBack={() => setShowTracking(false)}
      />
    );
  }

  return (
    <div>
      <h1>🧳 IoT Baggage Tracking System</h1>

      <h2>Passenger Dashboard</h2>

      <hr />

      <h3>✈️ Flight Details</h3>
      <p>Flight Number: AI101</p>
      <p>Route: Bangalore → Delhi</p>
      <p>Passenger: Passenger 101</p>

      <hr />

      <h3>🧳 Baggage Details</h3>
      <p>Baggage ID: BAG101</p>
      <p>Status: In Transit ✈️</p>

      <hr />

      <h3>📍 Current Location</h3>
      <p>Airport Terminal 1</p>

      <hr />

      <h3>🔋 IoT Device Status</h3>
      <p>Battery: 82% 🔋</p>
      <p>GPS: Connected 🛰️</p>
      <p>ESP32: Online 🟢</p>

      <hr />

      <h3>🚨 Security Status</h3>
      <p>Security: Safe ✅</p>
      <p>Unauthorized Movement: Not Detected</p>

      <br />

      <button onClick={() => setShowTracking(true)}>
        📍 Track My Baggage
      </button>
    </div>
  );
}

export default Dashboard;