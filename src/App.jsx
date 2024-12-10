import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "./App.css";

function App() {
  const [loginData, setLoginData] = useState({
    id: undefined,
    token: undefined,
  });
  const [error, setError] = useState(null);

  const emailRef = useRef();
  const passwordRef = useRef();
  const buttonRef = useRef();
  const idRef = useRef();

  const SERVER = "http://127.0.0.1:5000";

  var socket = useRef(
    io(SERVER, {
      autoConnect: false,
      auth: {
        userId: undefined,
        sessionID: undefined,
      },
    })
  );

  useEffect(() => {
    // remove connect_error handler
    return () => socket.current.off("connect_error");
  });

  console.log("socket", socket.current);

  socket.current.on("connect", () => console.log("socket connected"));
  socket.current.on("message", (msg) => {
    console.log("message", msg);
  });
  socket.current.on("sessionID", (sid) => {
    socket.current.auth.sessionID = sid;

    localStorage.setItem("notif_session_id", sid); // Whenever a user logs in, check for this item, and if present: attach it to the handshake auth
  });
  socket.current.on("disconnect", (reason) => {
    console.log("socket disconnected.", reason);
    socket.current.close();
  });
  socket.current.on("connect_error", (err) => setError(err.message));

  const handleConnect = () => {
    if (socket.current.connected) {
      socket.current.disconnect();
      buttonRef.current.innerText = "Connect Socket";
    } else {
      socket.current.connect();
      buttonRef.current.innerText = "Disconnect Socket";
    }
  };

  const handleLogin = async () => {
    socket.current.auth.userId = parseInt(idRef.current.value);
    // setError(null);

    // try {
    //   const res = await axios({
    //     url: "http://localhost:8080/api/auth/login/customer",
    //     method: "post",
    //     data: {
    //       email: emailRef.current.value,
    //       password: passwordRef.current.value,
    //     },
    //   });

    //   if (res.data) {
    //     const userData = res.data;
    //     setLoginData({ id: userData.user.id, token: userData.token });
    //     socket.current.auth.userId = userData.user.id;
    //     // console.log("socket in login", socket.current);
    //   }
    // } catch (error) {
    //   console.log(error);
    //   setError(error.message);
    // }
  };

  const handleApiCall = async () => {
    const id = parseInt(idRef.current.value);
    await axios.get(`http://localhost:5000/generate-notif?id=${id}`);
  };

  return (
    <>
      {error && <p>{error}</p>}
      <div>
        {/* <div>
          email
          <input ref={emailRef} type="text" />
        </div>
        <div>
          password
          <input ref={passwordRef} type="text" />
        </div> */}
        <div>
          user id
          <input ref={idRef} type="text" />
        </div>
        <button onClick={handleLogin}>login</button>
      </div>
      <button ref={buttonRef} onClick={handleConnect}>
        Connect Socket
      </button>
      <br />
      <button onClick={handleApiCall}>Make API call</button>
    </>
  );
}

export default App;
