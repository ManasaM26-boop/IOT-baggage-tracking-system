function PassengerLogin({ setLogin }) {
  const handleLogin = () => {
    setLogin(true);
  };

  return (
    <div>
      <h1>🧳 IoT Baggage Tracking System</h1>

      <h2>Passenger Login</h2>

      <input
        type="text"
        placeholder="Enter Passenger ID"
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Enter Password"
      />

      <br />
      <br />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default PassengerLogin;