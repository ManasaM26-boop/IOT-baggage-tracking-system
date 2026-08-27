function Login() {
  return (
    <div className="login-page">
      <div className="login-box">

        <h1>🧳 IoT Baggage Tracking System</h1>

        <h2>Passenger Login</h2>

        <input
          type="text"
          placeholder="Enter Passenger ID"
        />

        <input
          type="password"
          placeholder="Enter Password"
        />

        <button>Login</button>

      </div>
    </div>
  );
}

export default Login;