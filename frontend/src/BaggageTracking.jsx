import "./App.css";

function BaggageTracking() {
  return (
    <div className="tracking-page">

      <div className="tracking-container">

        {/* Header */}
        <div className="tracking-header">
          <h1>🧳 Live Baggage Tracking</h1>

          <h2>Baggage ID: BAG101</h2>

          <p className="security-status">
            Status: ⚠️ Security Alert
          </p>

          <p>Last Updated: Just now</p>
        </div>

        {/* Current Location */}
        <div className="tracking-card">
          <h2>📍 Current Location</h2>

          <p>
            Current Location: <strong>Airport Terminal 1</strong>
          </p>

          <p>
            Next Location: <strong>Aircraft Loading Area</strong>
          </p>

          <p>
            GPS Coordinates: <strong>12.9716° N, 77.5946° E</strong>
          </p>
        </div>

        {/* Map */}
        <div className="tracking-card">
          <h2>🗺️ Baggage Location Map</h2>

          <div className="map-container">
            <iframe
              title="Baggage Location"
              src="https://www.openstreetmap.org/export/embed.html?bbox=77.57%2C12.95%2C77.62%2C12.99&layer=mapnik&marker=12.9716%2C77.5946"
            ></iframe>
          </div>
        </div>

        {/* Baggage Journey */}
        <div className="tracking-card">
          <h2>🧳 Baggage Journey</h2>

          <div className="journey-item completed">
            ✅ Baggage Checked-In
          </div>

          <div className="journey-item completed">
            ✅ Security Check Completed
          </div>

          <div className="journey-item current">
            🔵 Baggage In Transit
          </div>

          <div className="journey-item">
            ⚪ Aircraft Loading
          </div>

          <div className="journey-item">
            ⚪ Baggage Delivered
          </div>
        </div>

      </div>

    </div>
  );
}

export default BaggageTracking;