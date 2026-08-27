import { useState, useEffect } from "react";
import "./App.css";
import { getBaggage } from "./api";

function App() {
  useEffect(() => {
    const loadBaggage = async () => {
      try {
        const data = await getBaggage();

        if (Array.isArray(data) && data.length > 0) {
          setBags(data);
        } else if (Array.isArray(data?.results) && data.results.length > 0) {
          setBags(data.results);
        }
      } catch (error) {
        console.error("Django baggage API error:", error);
      }
    };

    loadBaggage();
  }, []);
  // =========================================================
  // LOGIN
  // =========================================================
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // BAG DATA
  // =========================================================
  const [bags, setBags] = useState([
    {
      id: "BG1001",
      flight: "AI302",
      route: "BLR → DEL",
      status: "In Transit",
      location: "Bangalore Airport - Terminal 1",
      battery: "82%",
      risk: "Low",
      riskPercent: 12,
      reader: "RFID-CHK-01",
      checkpoint: "Check-in Area",
      expectedCheckpoint: "Check-in Area",
      update: "13 Aug 2026, 10:30 AM",
    },
    {
      id: "BG1002",
      flight: "SG812",
      route: "BLR → BOM",
      status: "Checked In",
      location: "Bangalore Airport - Sorting Area",
      battery: "91%",
      risk: "Low",
      riskPercent: 12,
      reader: "RFID-SRT-03",
      checkpoint: "Sorting Area",
      expectedCheckpoint: "Sorting Area",
      update: "12 Aug 2026, 07:50 AM",
    },
    {
      id: "BG1003",
      flight: "AI415",
      route: "HYD → DEL",
      status: "Delivered",
      location: "Delhi Airport - Terminal 3",
      battery: "65%",
      risk: "Low",
      riskPercent: 8,
      reader: "RFID-COL-06",
      checkpoint: "Baggage Collection",
      expectedCheckpoint: "Baggage Collection",
      update: "10 Aug 2026, 03:20 PM",
    },
    {
      id: "BG1004",
      flight: "AI501",
      route: "BLR → DEL",
      status: "Checked In",
      location: "Bangalore Airport - Gate Area",
      battery: "78%",
      risk: "Medium",
      riskPercent: 45,
      reader: "RFID-GATE-05",
      checkpoint: "Gate Area",
      expectedCheckpoint: "Gate Area",
      update: "13 Aug 2026, 11:15 AM",
    },
  ]);

  // =========================================================
  // SELECTED BAG
  // =========================================================
  const [selectedBag, setSelectedBag] = useState(null);

  // =========================================================
  // RFID SCANNER
  // =========================================================
  const [scanStatus, setScanStatus] = useState("Ready to Scan");
  const [scanMessage, setScanMessage] = useState("");
  const [lastScanTime, setLastScanTime] = useState("");
  const [scanHistory, setScanHistory] = useState([]);

  // =========================================================
  // NEW FEATURE 1
  // MOVEMENT TIMELINE
  // =========================================================
  const [movementTimeline, setMovementTimeline] = useState([]);

  // =========================================================
  // SECURITY ALERT
  // =========================================================
  const [securityAlert, setSecurityAlert] = useState({
    type: "info",
    title: "RFID System Ready",
    message: "All baggage monitoring systems are active.",
    visible: true,
  });

  // =========================================================
  // RFID READERS
  // =========================================================
  const rfidReaders = [
    {
      reader: "RFID-CHK-01",
      checkpoint: "Check-in Area",
      location: "Bangalore Airport - Terminal 1",
    },
    {
      reader: "RFID-SEC-02",
      checkpoint: "Security Area",
      location: "Bangalore Airport - Security",
    },
    {
      reader: "RFID-SRT-03",
      checkpoint: "Sorting Area",
      location: "Bangalore Airport - Sorting Area",
    },
    {
      reader: "RFID-TRF-04",
      checkpoint: "Transfer Area",
      location: "Bangalore Airport - Transfer Area",
    },
    {
      reader: "RFID-GATE-05",
      checkpoint: "Gate Area",
      location: "Bangalore Airport - Gate Area",
    },
    {
      reader: "RFID-COL-06",
      checkpoint: "Baggage Collection",
      location: "Delhi Airport - Terminal 3",
    },
  ];

  const [selectedReader, setSelectedReader] = useState(
    rfidReaders[2]
  );

  // =========================================================
  // ROUTE ORDER
  // =========================================================
  const routeOrder = [
    "Check-in Area",
    "Security Area",
    "Sorting Area",
    "Transfer Area",
    "Gate Area",
    "Baggage Collection",
  ];

  // =========================================================
  // ALGORITHM 1
  // MOVEMENT ANOMALY DETECTION
  // =========================================================
  const detectMovementAnomaly = (
    currentCheckpoint,
    expectedCheckpoint
  ) => {
    const currentIndex =
      routeOrder.indexOf(currentCheckpoint);

    const expectedIndex =
      routeOrder.indexOf(expectedCheckpoint);

    // Unknown checkpoint
    if (currentIndex === -1 || expectedIndex === -1) {
      return {
        anomaly: true,
        type: "Unknown Checkpoint",
        message:
          "⚠️ Unknown RFID checkpoint detected.",
      };
    }

    // Bag moved backwards
    if (currentIndex < expectedIndex) {
      return {
        anomaly: true,
        type: "Backward Movement",
        message:
          `🚨 MOVEMENT ANOMALY DETECTED\n` +
          `Bag moved backwards from ${expectedCheckpoint} to ${currentCheckpoint}.\n` +
          `Expected checkpoint: ${expectedCheckpoint}.`,
      };
    }

    // Bag skipped checkpoints
    if (currentIndex > expectedIndex + 1) {
      const skippedCheckpoints = routeOrder.slice(
        expectedIndex,
        currentIndex
      );

      return {
        anomaly: true,
        type: "Skipped Checkpoint",
        message:
          `🚨 MOVEMENT ANOMALY DETECTED\n` +
          `Bag moved from ${expectedCheckpoint} to ${currentCheckpoint}.\n` +
          `Skipped: ${skippedCheckpoints.join(" → ")}.`,
      };
    }

    // Normal movement
    return {
      anomaly: false,
      type: "Normal Movement",
      message:
        "🟢 Normal baggage movement detected.",
    };
  };

  // =========================================================
  // ALGORITHM 2
  // PRIORITY QUEUE
  // =========================================================
  const getBagPriority = (bag) => {
    if (bag.risk === "High") {
      return 1;
    }

    if (bag.risk === "Medium") {
      return 2;
    }

    return 3;
  };

  const priorityQueue = [...bags]
    .map((bag) => ({
      ...bag,
      priority: getBagPriority(bag),
    }))
    .sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return b.riskPercent - a.riskPercent;
    });

  const highestPriorityBag = priorityQueue[0];

  // =========================================================
  // ADD BAG
  // =========================================================
  const [showAddBag, setShowAddBag] = useState(false);

  const [newBag, setNewBag] = useState({
    id: "",
    flight: "",
    route: "",
    location: "",
  });

  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = (e) => {
    e.preventDefault();

    if (
      userId.trim() === "P1001" &&
      password === "1234"
    ) {
      setLoggedIn(true);
      setError("");
    } else {
      setError("Invalid ID or Password");
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================
  const handleLogout = () => {
    setLoggedIn(false);
    setSelectedBag(null);
    setUserId("");
    setPassword("");
    setScanHistory([]);
    setMovementTimeline([]);
    setScanMessage("");
    setScanStatus("Ready to Scan");
    setLastScanTime("");

    setSecurityAlert({
      type: "info",
      title: "RFID System Ready",
      message:
        "All baggage monitoring systems are active.",
      visible: true,
    });
  };

  // =========================================================
  // SELECT BAG
  // =========================================================
  const handleSelectBag = (bag) => {
    setSelectedBag(bag);
    setScanStatus("Ready to Scan");
    setScanMessage("");
    setLastScanTime("");

    const matchingReader = rfidReaders.find(
      (reader) =>
        reader.reader === bag.reader
    );

    if (matchingReader) {
      setSelectedReader(matchingReader);
    }
  };

  // =========================================================
  // RFID SCAN
  // =========================================================
  const handleRFIDScan = () => {
    const bag = selectedBag || bags[0];

    if (!bag) {
      return;
    }

    setScanStatus("Scanning...");
    setScanMessage("");

    setTimeout(() => {
      const now = new Date();

      const time = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      // -------------------------------------------------------
      // INPUT
      // -------------------------------------------------------
      const expectedCheckpoint =
        bag.expectedCheckpoint ||
        "Check-in Area";

      const detectedCheckpoint =
        selectedReader.checkpoint;

      // -------------------------------------------------------
      // ROUTE VERIFICATION
      // -------------------------------------------------------
      const isCorrectRoute =
        detectedCheckpoint === expectedCheckpoint;

      // -------------------------------------------------------
      // MOVEMENT ANOMALY DETECTION
      // -------------------------------------------------------
      const movementResult =
        detectMovementAnomaly(
          detectedCheckpoint,
          expectedCheckpoint
        );

      let risk;
      let riskPercent;
      let newStatus;
      let nextExpectedCheckpoint;
      let message;

      // -------------------------------------------------------
      // CORRECT ROUTE
      // -------------------------------------------------------
      if (isCorrectRoute) {
        risk = "Low";
        riskPercent = 5;

        const currentIndex =
          routeOrder.indexOf(
            detectedCheckpoint
          );

        if (
          currentIndex >= 0 &&
          currentIndex <
            routeOrder.length - 1
        ) {
          nextExpectedCheckpoint =
            routeOrder[currentIndex + 1];
        } else {
          nextExpectedCheckpoint =
            "Baggage Collection";
        }

        newStatus =
          detectedCheckpoint ===
          "Baggage Collection"
            ? "Delivered"
            : "In Transit";

        message =
          `🟢 ROUTE VERIFIED\n` +
          `Expected: ${expectedCheckpoint}\n` +
          `Detected: ${detectedCheckpoint}\n` +
          `Result: Baggage is following the expected route.\n` +
          `Next expected checkpoint: ${nextExpectedCheckpoint}.`;
      }

      // -------------------------------------------------------
      // WRONG ROUTE / MOVEMENT ANOMALY
      // -------------------------------------------------------
      else {
        risk = movementResult.anomaly
          ? "High"
          : "Medium";

        riskPercent =
          movementResult.anomaly
            ? 90
            : 60;

        newStatus =
          movementResult.anomaly
            ? "Movement Anomaly"
            : "Route Alert";

        nextExpectedCheckpoint =
          expectedCheckpoint;

        message =
          movementResult.message +
          `\nExpected: ${expectedCheckpoint}` +
          `\nDetected: ${detectedCheckpoint}`;
      }

      // -------------------------------------------------------
      // UPDATED BAG
      // -------------------------------------------------------
      const updatedBag = {
        ...bag,
        reader: selectedReader.reader,
        checkpoint: detectedCheckpoint,
        location: selectedReader.location,
        risk,
        riskPercent,
        status: newStatus,
        expectedCheckpoint:
          nextExpectedCheckpoint,
        update:
          `Just now at ${time}`,
      };

      // -------------------------------------------------------
      // UPDATE BAG LIST
      // -------------------------------------------------------
      setBags((previousBags) =>
        previousBags.map((item) =>
          item.id === bag.id
            ? updatedBag
            : item
        )
      );

      // -------------------------------------------------------
      // UPDATE SELECTED BAG
      // -------------------------------------------------------
      setSelectedBag(updatedBag);

      // -------------------------------------------------------
      // RFID ACTIVITY HISTORY
      // -------------------------------------------------------
      const historyItem = {
        id: Date.now(),
        bagId: bag.id,
        reader: selectedReader.reader,
        checkpoint: detectedCheckpoint,
        expectedCheckpoint:
          expectedCheckpoint,
        time,
        status: isCorrectRoute
          ? "Route Verified"
          : "Wrong Route Detected",
        risk,
        anomaly:
          movementResult.anomaly,
        anomalyType:
          movementResult.type,
      };

      setScanHistory(
        (previousHistory) => [
          historyItem,
          ...previousHistory,
        ]
      );

      // -------------------------------------------------------
      // NEW FEATURE
      // MOVEMENT TIMELINE
      // -------------------------------------------------------
      const timelineItem = {
        id: Date.now() + 1,
        bagId: bag.id,
        checkpoint: detectedCheckpoint,
        reader: selectedReader.reader,
        time,
        type: movementResult.anomaly
          ? movementResult.type
          : "Normal Movement",
        anomaly:
          movementResult.anomaly,
        risk,
        expectedCheckpoint:
          expectedCheckpoint,
      };

      setMovementTimeline(
        (previousTimeline) => [
          timelineItem,
          ...previousTimeline,
        ]
      );

      // -------------------------------------------------------
      // SCANNER UPDATE
      // -------------------------------------------------------
      setScanStatus("RFID Detected");
      setLastScanTime(time);
      setScanMessage(message);

      // -------------------------------------------------------
      // REAL-TIME SECURITY ALERT
      // -------------------------------------------------------
      if (movementResult.anomaly) {
        setSecurityAlert({
          type: "danger",
          title:
            "🚨 MOVEMENT ANOMALY DETECTED",
          message:
            `${bag.id} detected at ${detectedCheckpoint}. ` +
            `Expected: ${expectedCheckpoint}. ` +
            `Anomaly Type: ${movementResult.type}. ` +
            `Risk Level: HIGH (${riskPercent}%).`,
          visible: true,
        });
      } else if (!isCorrectRoute) {
        setSecurityAlert({
          type: "warning",
          title: "⚠️ ROUTE ALERT",
          message:
            `${bag.id} is not at its expected checkpoint. ` +
            `Expected: ${expectedCheckpoint}. ` +
            `Detected: ${detectedCheckpoint}.`,
          visible: true,
        });
      } else {
        setSecurityAlert({
          type: "success",
          title: "🟢 ROUTE VERIFIED",
          message:
            `${bag.id} was detected at the correct checkpoint: ${detectedCheckpoint}.`,
          visible: true,
        });
      }
    }, 1000);
  };

  // =========================================================
  // VIEW MAP
  // =========================================================
  const handleViewMap = (bag) => {
    setSelectedBag(bag);

    setTimeout(() => {
      const mapElement =
        document.getElementById(
          "bag-map"
        );

      if (mapElement) {
        mapElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // =========================================================
  // ADD NEW BAG
  // =========================================================
  const handleAddBag = (e) => {
    e.preventDefault();

    if (
      !newBag.id ||
      !newBag.flight ||
      !newBag.route ||
      !newBag.location
    ) {
      alert(
        "Please fill all the details"
      );
      return;
    }

    const alreadyExists =
      bags.some(
        (bag) =>
          bag.id.toUpperCase() ===
          newBag.id.toUpperCase()
      );

    if (alreadyExists) {
      alert(
        "This Bag ID already exists"
      );
      return;
    }

    const bagToAdd = {
      id: newBag.id.toUpperCase(),
      flight: newBag.flight.toUpperCase(),
      route: newBag.route.toUpperCase(),
      status: "Checked In",
      location: newBag.location,
      battery: "100%",
      risk: "Low",
      riskPercent: 5,
      reader: "RFID-CHK-01",
      checkpoint: "Check-in Area",
      expectedCheckpoint:
        "Check-in Area",
      update: "Just now",
    };

    setBags(
      (previousBags) => [
        ...previousBags,
        bagToAdd,
      ]
    );

    setNewBag({
      id: "",
      flight: "",
      route: "",
      location: "",
    });

    setShowAddBag(false);
    setSelectedBag(bagToAdd);
  };

  // =========================================================
  // LOGIN PAGE
  // =========================================================
  if (!loggedIn) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-icon">
            🧳
          </div>

          <h1>
            IoT Baggage Tracking
          </h1>

          <p className="login-subtitle">
            Track your baggage in real-time
          </p>

          <h2>
            Passenger Login
          </h2>

          <form onSubmit={handleLogin}>
            <label>
              Passenger ID
            </label>

            <input
              type="text"
              placeholder="Enter Passenger ID"
              value={userId}
              onChange={(e) =>
                setUserId(
                  e.target.value
                )
              }
            />

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <button
              type="submit"
              className="login-button"
            >
              Login
            </button>
          </form>

          {error && (
            <p className="error">
              {error}
            </p>
          )}

          <div className="login-hint">
            <strong>
              Demo Login
            </strong>
            <br />
            ID: P1001
            <br />
            Password: 1234
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // CURRENT BAG
  // =========================================================
  const currentBag =
    selectedBag || bags[0];

  // =========================================================
  // SECURITY SUMMARY
  // =========================================================
  const totalScans =
    scanHistory.length;

  const verifiedScans =
    scanHistory.filter(
      (item) =>
        item.status ===
        "Route Verified"
    ).length;

  const routeAlerts =
    scanHistory.filter(
      (item) =>
        item.status ===
        "Wrong Route Detected"
    ).length;

  const bagsAtRisk =
    bags.filter(
      (bag) =>
        bag.risk === "High"
    ).length;

  const currentBagTimeline =
    movementTimeline.filter(
      (item) =>
        item.bagId ===
        currentBag.id
    );

  // =========================================================
  // DASHBOARD
  // =========================================================
  return (
    <div className="dashboard">

      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="header-logo">
            🧳
          </div>

          <div>
            <h1>
              IoT Baggage Tracking
            </h1>

            <p>
              RFID-Based Baggage Tracking & Theft Detection
            </p>
          </div>
        </div>

        <div className="header-right">
          <span className="notification">
            🔔
          </span>

          <span className="passenger-name">
            Passenger P1001
          </span>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* =====================================================
          SECURITY ALERT
      ===================================================== */}
      {securityAlert.visible && (
        <section
          style={{
            margin: "20px 0",
            padding: "16px 20px",
            borderRadius: "14px",
            border:
              `1px solid ${
                securityAlert.type ===
                "danger"
                  ? "#ef4444"
                  : securityAlert.type ===
                    "warning"
                  ? "#f59e0b"
                  : securityAlert.type ===
                    "success"
                  ? "#22c55e"
                  : "#3b82f6"
              }`,
            background:
              securityAlert.type ===
              "danger"
                ? "#fff1f2"
                : securityAlert.type ===
                  "warning"
                ? "#fffbeb"
                : securityAlert.type ===
                  "success"
                ? "#f0fdf4"
                : "#eff6ff",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: "16px",
            boxShadow:
              "0 6px 18px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
                background: "white",
              }}
            >
              {securityAlert.type ===
              "danger"
                ? "🚨"
                : securityAlert.type ===
                  "warning"
                ? "⚠️"
                : securityAlert.type ===
                  "success"
                ? "✅"
                : "📡"}
            </div>

            <div>
              <strong
                style={{
                  display: "block",
                  marginBottom: "4px",
                }}
              >
                {securityAlert.title}
              </strong>

              <span
                style={{
                  lineHeight: "1.5",
                }}
              >
                {securityAlert.message}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setSecurityAlert(
                (previous) => ({
                  ...previous,
                  visible: false,
                })
              )
            }
            style={{
              border: "none",
              background:
                "transparent",
              fontSize: "22px",
              cursor: "pointer",
              padding:
                "4px 8px",
            }}
            aria-label="Close alert"
          >
            ×
          </button>
        </section>
      )}

      {/* =====================================================
          BAG SUMMARY
      ===================================================== */}
      <section className="bag-summary">
        <div>
          <span className="small-label">
            Currently Selected Bag
          </span>

          <h2>
            {currentBag.id}
          </h2>

          <div className="summary-details">
            <div>
              <span>
                Flight
              </span>

              <strong>
                {currentBag.flight}
              </strong>
            </div>

            <div>
              <span>
                Route
              </span>

              <strong>
                {currentBag.route}
              </strong>
            </div>
          </div>

          <small>
            Last Updated:{" "}
            {currentBag.update}
          </small>
        </div>

        <span className="status-pill">
          {currentBag.status}
        </span>
      </section>

      {/* =====================================================
          SELECTED BAG MESSAGE
      ===================================================== */}
      <div className="selected-message">
        🧳 Tracking{" "}
        <strong>
          {currentBag.id}
        </strong>
        {" "}• RFID Based Tracking
      </div>

      {/* =====================================================
          RFID SECURITY SUMMARY
      ===================================================== */}
      <section className="security-summary">
        <div className="summary-heading">
          <div>
            <h2>
              📊 RFID Security Summary
            </h2>

            <p>
              Real-time baggage security monitoring
            </p>
          </div>

          <span className="summary-live">
            ● LIVE
          </span>
        </div>

        <div className="summary-grid">

          <div className="summary-box">
            <div className="summary-box-icon">
              🧳
            </div>

            <div>
              <strong>
                {bags.length}
              </strong>

              <span>
                Total Bags
              </span>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-box-icon">
              📡
            </div>

            <div>
              <strong>
                {totalScans}
              </strong>

              <span>
                RFID Scans
              </span>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-box-icon">
              ✅
            </div>

            <div>
              <strong>
                {verifiedScans}
              </strong>

              <span>
                Verified Scans
              </span>
            </div>
          </div>

          <div className="summary-box danger-summary">
            <div className="summary-box-icon">
              🚨
            </div>

            <div>
              <strong>
                {routeAlerts}
              </strong>

              <span>
                Route Alerts
              </span>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-box-icon">
              🛡️
            </div>

            <div>
              <strong>
                {bagsAtRisk}
              </strong>

              <span>
                Bags at Risk
              </span>
            </div>
          </div>

          <div className="summary-box">
            <div className="summary-box-icon">
              🚨
            </div>

            <div>
              <strong>
                {highestPriorityBag?.id ||
                  "None"}
              </strong>

              <span>
                Top Priority
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          TRACKING PROGRESS
      ===================================================== */}
      <section className="dashboard-card">
        <div className="section-title">
          <div>
            <h2>
              Tracking Progress
            </h2>

            <p>
              Baggage journey status
            </p>
          </div>

          <span className="progress-percent">
            75%
          </span>
        </div>

        <div className="tracking-progress">

          <div className="progress-step completed">
            <div className="progress-circle">
              ✓
            </div>

            <div>
              <strong>
                Checked In
              </strong>

              <small>
                RFID Detected
              </small>
            </div>
          </div>

          <div className="progress-line completed-line" />

          <div className="progress-step completed">
            <div className="progress-circle">
              ✓
            </div>

            <div>
              <strong>
                Security Cleared
              </strong>

              <small>
                RFID Detected
              </small>
            </div>
          </div>

          <div className="progress-line completed-line" />

          <div className="progress-step active">
            <div className="progress-circle">
              →
            </div>

            <div>
              <strong>
                {currentBag.checkpoint}
              </strong>

              <small>
                Current RFID Checkpoint
              </small>
            </div>
          </div>

          <div className="progress-line" />

          <div className="progress-step">
            <div className="progress-circle">
              4
            </div>

            <div>
              <strong>
                Delivered
              </strong>

              <small>
                Pending
              </small>
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================
          RFID SCANNER
      ===================================================== */}
      <section className="dashboard-card rfid-scanner-card">
        <div className="section-title">

          <div>
            <h2>
              📡 RFID Scanner
            </h2>

            <p>
              Simulate an RFID reader detecting the selected bag
            </p>
          </div>

          <span
            className={
              scanStatus ===
              "RFID Detected"
                ? "secure-badge"
                : "live-badge"
            }
          >
            ● {scanStatus}
          </span>

        </div>

        <div className="rfid-scanner-content">

          <div className="scanner-info">
            <div className="scanner-icon">
              🧳
            </div>

            <div>
              <span>
                Selected Bag
              </span>

              <strong>
                {currentBag.id}
              </strong>
            </div>
          </div>

          <div className="scanner-info">
            <div className="reader-icon">
              📡
            </div>

            <div
              style={{
                width: "100%",
              }}
            >
              <span>
                RFID Reader
              </span>

              <select
                value={
                  selectedReader.reader
                }
                onChange={(e) => {
                  const reader =
                    rfidReaders.find(
                      (item) =>
                        item.reader ===
                        e.target.value
                    );

                  setSelectedReader(
                    reader
                  );

                  setScanStatus(
                    "Ready to Scan"
                  );

                  setScanMessage("");
                }}
              >
                {rfidReaders.map(
                  (reader) => (
                    <option
                      key={
                        reader.reader
                      }
                      value={
                        reader.reader
                      }
                    >
                      {reader.reader} —{" "}
                      {reader.checkpoint}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            className="rfid-scan-button"
            onClick={
              handleRFIDScan
            }
            disabled={
              scanStatus ===
              "Scanning..."
            }
          >
            {scanStatus ===
            "Scanning..."
              ? "📡 Scanning..."
              : "📡 Simulate RFID Scan"}
          </button>

        </div>

        {/* ALGORITHM RESULT */}
        {scanMessage && (
          <div
            className={
              currentBag.risk ===
                "High" ||
              currentBag.risk ===
                "Medium"
                ? "rfid-success rfid-danger"
                : "rfid-success"
            }
          >
            <span className="success-icon">
              {currentBag.risk ===
              "High"
                ? "!"
                : "✓"}
            </span>

            <div>
              <strong
                style={{
                  whiteSpace:
                    "pre-line",
                }}
              >
                {currentBag.status ===
                "Movement Anomaly"
                  ? "🚨 MOVEMENT ANOMALY DETECTED"
                  : currentBag.risk ===
                    "High"
                  ? "🚨 WRONG ROUTE DETECTED"
                  : currentBag.risk ===
                    "Medium"
                  ? "⚠️ ROUTE ALERT"
                  : "🟢 ROUTE VERIFIED"}
              </strong>

              <p
                style={{
                  whiteSpace:
                    "pre-line",
                  marginTop: "8px",
                }}
              >
                {scanMessage}
              </p>

              {lastScanTime && (
                <small>
                  Detection time:{" "}
                  {lastScanTime}
                </small>
              )}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          MAP
      ===================================================== */}
      <section
        className="dashboard-card map-card"
        id="bag-map"
      >
        <div className="section-title">

          <div>
            <h2>
              🗺️ Bag Tracking
            </h2>

            <p>
              RFID-based live checkpoint for{" "}
              {currentBag.id}
            </p>
          </div>

          <span className="live-badge">
            ● LIVE
          </span>

        </div>

        <div className="map">

          <div className="map-road road-one" />
          <div className="map-road road-two" />
          <div className="map-road road-three" />
          <div className="map-road road-four" />

          <div className="airport-label blr-label">
            CHECK-IN
            <small>
              RFID-CHK-01
            </small>
          </div>

          <div className="airport-label security-label">
            SECURITY
            <small>
              RFID-SEC-02
            </small>
          </div>

          <div className="airport-label sorting-label">
            SORTING
            <small>
              RFID-SRT-03
            </small>
          </div>

          <div className="airport-label transfer-label">
            TRANSFER
            <small>
              RFID-TRF-04
            </small>
          </div>

          <div className="airport-label del-label">
            GATE
            <small>
              RFID-GATE-05
            </small>
          </div>

          <div className="route-line" />

          <div
            className={`map-marker ${
              currentBag.checkpoint ===
              "Baggage Collection"
                ? "marker-delhi"
                : currentBag.checkpoint ===
                  "Gate Area"
                ? "marker-gate"
                : currentBag.checkpoint ===
                  "Sorting Area"
                ? "marker-sorting"
                : "marker-bangalore"
            }`}
          >
            <div className="marker-icon">
              🧳
            </div>

            <div className="marker-label">
              <strong>
                {currentBag.id}
              </strong>

              <small>
                RFID:{" "}
                {currentBag.reader}
              </small>
            </div>
          </div>

          <div className="map-place-name">
            📡 {currentBag.checkpoint}
          </div>

        </div>

        <div className="map-details">

          <div>
            <span>
              Bag ID
            </span>

            <strong>
              {currentBag.id}
            </strong>
          </div>

          <div>
            <span>
              RFID Reader
            </span>

            <strong>
              {currentBag.reader}
            </strong>
          </div>

          <div>
            <span>
              Checkpoint
            </span>

            <strong>
              {currentBag.checkpoint}
            </strong>
          </div>

          <div>
            <span>
              Current Location
            </span>

            <strong>
              {currentBag.location}
            </strong>
          </div>

        </div>
      </section>

      {/* =====================================================
          LOCATION + DEVICE
      ===================================================== */}
      <div className="two-column">

        <section className="dashboard-card">
          <h2>
            📍 Live Location
          </h2>

          <div className="location-box">

            <div className="location-icon">
              📡
            </div>

            <div>
              <strong>
                {currentBag.location}
              </strong>

              <small>
                RFID Checkpoint:{" "}
                {currentBag.checkpoint}
              </small>

              <small>
                Reader ID:{" "}
                {currentBag.reader}
              </small>
            </div>

          </div>

          <button
            className="outline-button"
            onClick={() =>
              handleViewMap(
                currentBag
              )
            }
          >
            View on Map →
          </button>
        </section>

        <section className="dashboard-card">

          <h2>
            📡 RFID Device Status
          </h2>

          <div className="device-row">
            <span>
              RFID Connection
            </span>

            <strong className="green-text">
              Connected ●
            </strong>
          </div>

          <div className="device-row">
            <span>
              RFID Reader
            </span>

            <strong>
              {currentBag.reader}
            </strong>
          </div>

          <div className="device-row">
            <span>
              Battery
            </span>

            <strong>
              {currentBag.battery}
            </strong>
          </div>

          <div className="battery-bar">
            <div
              className="battery-fill"
              style={{
                width:
                  currentBag.battery,
              }}
            />
          </div>

          <div className="device-row">
            <span>
              Last RFID Detection
            </span>

            <strong>
              {currentBag.update}
            </strong>
          </div>

        </section>

      </div>

      {/* =====================================================
          THEFT DETECTION
      ===================================================== */}
      <section className="dashboard-card theft-card">

        <div className="section-title">

          <div>
            <h2>
              🛡️ Theft Detection
            </h2>

            <p>
              RFID route monitoring
            </p>
          </div>

          <span
            className={
              currentBag.risk ===
              "Low"
                ? "secure-badge"
                : "warning-badge"
            }
          >
            {currentBag.risk ===
            "Low"
              ? "SECURE"
              : "🚨 ATTENTION"}
          </span>

        </div>

        <div className="risk-content">

          <div className="shield">
            {currentBag.risk ===
            "High"
              ? "🚨"
              : "🛡️"}
          </div>

          <div className="risk-text">

            <h3
              className={
                currentBag.risk ===
                "Low"
                  ? "low-risk"
                  : "medium-risk"
              }
            >
              {currentBag.risk} Risk
            </h3>

            <p>
              {currentBag.status ===
              "Movement Anomaly"
                ? "🚨 Unexpected baggage movement detected. One or more checkpoints may have been skipped."
                : currentBag.risk ===
                  "Low"
                ? "RFID detected at the expected baggage checkpoint."
                : "🚨 Wrong RFID checkpoint detected. Possible unauthorized baggage movement."}
            </p>

            {currentBag.risk ===
              "High" && (
              <small>
                Expected:{" "}
                <strong>
                  {
                    currentBag.expectedCheckpoint
                  }
                </strong>
              </small>
            )}

          </div>

          <div className="risk-number">
            <strong>
              {
                currentBag.riskPercent
              }%
            </strong>

            <small>
              Risk
            </small>
          </div>

        </div>

        <div className="risk-bar">
          <div
            className="risk-fill"
            style={{
              width:
                `${currentBag.riskPercent}%`,
            }}
          />
        </div>

      </section>

      {/* =====================================================
          PRIORITY QUEUE
      ===================================================== */}
      <section className="dashboard-card priority-card">

        <div className="section-title">

          <div>
            <h2>
              🚨 Baggage Priority Queue
            </h2>

            <p>
              High-risk baggage is processed first
            </p>
          </div>

          <span className="live-badge">
            PRIORITY
          </span>

        </div>

        <div className="activity-list">

          {priorityQueue.map(
            (bag) => (
              <div
                className={`activity-row ${
                  bag.risk ===
                  "High"
                    ? "activity-danger"
                    : ""
                }`}
                key={bag.id}
              >

                <div className="activity-icon">
                  {bag.priority ===
                  1
                    ? "🚨"
                    : bag.priority ===
                      2
                    ? "⚠️"
                    : "🟢"}
                </div>

                <div className="activity-info">

                  <strong>
                    {bag.id}
                  </strong>

                  <span>
                    Flight:{" "}
                    {bag.flight}
                  </span>

                  <span>
                    📍{" "}
                    {bag.checkpoint}
                  </span>

                </div>

                <div className="activity-status">

                  <strong>
                    Priority{" "}
                    {bag.priority}
                  </strong>

                  <small>
                    {bag.risk} Risk •{" "}
                    {bag.riskPercent}%
                  </small>

                </div>

              </div>
            )
          )}

        </div>

        {highestPriorityBag && (
          <div className="selected-message">
            🚨{" "}
            <strong>
              {
                highestPriorityBag.id
              }
            </strong>
            {" "}is currently the highest-priority bag
            {" "}(
            {
              highestPriorityBag.risk
            }{" "}
            Risk).
          </div>
        )}

      </section>

      {/* =====================================================
          NEW FEATURE
          MOVEMENT TIMELINE
      ===================================================== */}
      <section className="dashboard-card">

        <div className="section-title">

          <div>
            <h2>
              🕐 Baggage Movement Timeline
            </h2>

            <p>
              RFID-based movement history for{" "}
              {currentBag.id}
            </p>
          </div>

          <span className="live-badge">
            {currentBagTimeline.length}{" "}
            {currentBagTimeline.length ===
            1
              ? "Event"
              : "Events"}
          </span>

        </div>

        {currentBagTimeline.length ===
        0 ? (
          <div className="no-history">
            📡 No movement events yet.
            <br />

            <small>
              Scan the baggage using the RFID scanner
              to create a movement timeline.
            </small>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "15px",
            }}
          >
            {currentBagTimeline.map(
              (item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "12px",
                    border:
                      item.anomaly
                        ? "1px solid #ef4444"
                        : "1px solid #d1fae5",
                    background:
                      item.anomaly
                        ? "#fff1f2"
                        : "#f0fdf4",
                  }}
                >

                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        item.anomaly
                          ? "#fee2e2"
                          : "#dcfce7",
                      fontSize: "20px",
                    }}
                  >
                    {item.anomaly
                      ? "🚨"
                      : "✓"}
                  </div>

                  <div
                    style={{
                      flex: 1,
                    }}
                  >
                    <strong>
                      {item.checkpoint}
                    </strong>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        marginTop:
                          "4px",
                      }}
                    >
                      📡{" "}
                      {item.reader}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        marginTop:
                          "4px",
                      }}
                    >
                      🕐{" "}
                      {item.time}
                    </div>

                    <div
                      style={{
                        fontSize:
                          "13px",
                        marginTop:
                          "4px",
                      }}
                    >
                      Expected:{" "}
                      {item.expectedCheckpoint}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        "right",
                    }}
                  >
                    <strong
                      style={{
                        color:
                          item.anomaly
                            ? "#dc2626"
                            : "#16a34a",
                      }}
                    >
                      {item.anomaly
                        ? "Anomaly"
                        : "Normal"}
                    </strong>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "4px",
                      }}
                    >
                      {item.type}
                    </small>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "4px",
                      }}
                    >
                      Risk:{" "}
                      {item.risk}
                    </small>
                  </div>

                </div>
              )
            )}
          </div>
        )}

      </section>

      {/* =====================================================
          RFID ACTIVITY HISTORY
      ===================================================== */}
      <section className="dashboard-card activity-card">

        <div className="section-title">

          <div>
            <h2>
              📜 RFID Activity History
            </h2>

            <p>
              Recent RFID detections and route verification
            </p>
          </div>

          <span className="live-badge">
            {scanHistory.length}{" "}
            {scanHistory.length ===
            1
              ? "Scan"
              : "Scans"}
          </span>

        </div>

        {scanHistory.length ===
        0 ? (
          <div className="no-history">
            📡 No RFID scans yet.
            <br />

            <small>
              Select an RFID reader and click
              "Simulate RFID Scan".
            </small>
          </div>
        ) : (
          <div className="activity-list">

            {scanHistory.map(
              (item) => (
                <div
                  className={`activity-row ${
                    item.risk ===
                    "High"
                      ? "activity-danger"
                      : ""
                  }`}
                  key={item.id}
                >

                  <div className="activity-icon">
                    {item.risk ===
                    "High"
                      ? "🚨"
                      : "📡"}
                  </div>

                  <div className="activity-info">

                    <strong>
                      {item.bagId}
                    </strong>

                    <span>
                      {item.reader}
                    </span>

                    <span>
                      📍{" "}
                      {item.checkpoint}
                    </span>

                  </div>

                  <div className="activity-status">

                    <strong>
                      {item.status}
                    </strong>

                    <small>
                      🕐{" "}
                      {item.time}
                    </small>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>

      {/* =====================================================
          LATEST UPDATE
      ===================================================== */}
      <section className="dashboard-card latest-update">

        <h2>
          🔔 Latest RFID Update
        </h2>

        <p>
          {currentBag.id} was detected by{" "}
          <strong>
            {currentBag.reader}
          </strong>
          {" "}at{" "}
          <strong>
            {currentBag.checkpoint}
          </strong>.
        </p>

        <small>
          {currentBag.update}
        </small>

      </section>

      {/* =====================================================
          MY BAGS
      ===================================================== */}
      <section className="dashboard-card my-bags-card">

        <div className="my-bags-header">

          <h2>
            🧳 My Bags
          </h2>

          <span>
            {bags.length} Bags
          </span>

        </div>

        <div className="bags-list">

          {bags.map(
            (bag) => (
              <button
                type="button"
                key={bag.id}
                className={`bag-row ${
                  selectedBag?.id ===
                  bag.id
                    ? "selected-bag"
                    : ""
                }`}
                onClick={() =>
                  handleSelectBag(
                    bag
                  )
                }
              >

                <div className="bag-icon">
                  🧳
                </div>

                <div className="bag-info">

                  <strong>
                    {bag.id}
                  </strong>

                  <small>
                    Flight:{" "}
                    {bag.flight}
                  </small>

                  <small>
                    📡{" "}
                    {bag.checkpoint}
                  </small>

                </div>

                <span
                  className={`bag-status ${
                    bag.status
                      .toLowerCase()
                      .replace(
                        /\s+/g,
                        "-"
                      )
                  }`}
                >
                  {bag.status}
                </span>

                <span className="bag-arrow">
                  →
                </span>

              </button>
            )
          )}

        </div>

        <button
          className="add-bag-button"
          onClick={() =>
            setShowAddBag(true)
          }
        >
          + Add New Bag
        </button>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="dashboard-footer">

        <span>
          📡 RFID System Connected
        </span>

        <span>
          🧳 Bags Being Tracked
        </span>

        <span>
          🔒 Baggage Security Active
        </span>

      </footer>

      {/* =====================================================
          ADD BAG MODAL
      ===================================================== */}
      {showAddBag && (
        <div
          className="modal-overlay"
          onClick={() =>
            setShowAddBag(false)
          }
        >
          <div
            className="modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="modal-header">

              <div>
                <h2>
                  🧳 Add New Bag
                </h2>

                <p>
                  Enter your baggage details
                </p>
              </div>

              <button
                className="close-button"
                onClick={() =>
                  setShowAddBag(false)
                }
              >
                ×
              </button>

            </div>

            <form
              onSubmit={
                handleAddBag
              }
            >

              <label>
                Bag ID
              </label>

              <input
                type="text"
                placeholder="Example: BG1005"
                value={
                  newBag.id
                }
                onChange={(e) =>
                  setNewBag({
                    ...newBag,
                    id: e.target.value,
                  })
                }
              />

              <label>
                Flight Number
              </label>

              <input
                type="text"
                placeholder="Example: AI501"
                value={
                  newBag.flight
                }
                onChange={(e) =>
                  setNewBag({
                    ...newBag,
                    flight:
                      e.target.value,
                  })
                }
              />

              <label>
                Route
              </label>

              <input
                type="text"
                placeholder="Example: BLR → DEL"
                value={
                  newBag.route
                }
                onChange={(e) =>
                  setNewBag({
                    ...newBag,
                    route:
                      e.target.value,
                  })
                }
              />

              <label>
                Current Location
              </label>

              <input
                type="text"
                placeholder="Example: Bangalore Airport - Terminal 2"
                value={
                  newBag.location
                }
                onChange={(e) =>
                  setNewBag({
                    ...newBag,
                    location:
                      e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="save-bag-button"
              >
                Add Bag
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;