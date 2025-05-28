import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

const userColors = [
  "#6a4db7",
  "#f25f5c",
  "#70c1b3",
  "#b5ac07",
  "#577590",
  "#9a8c98",
];

const getUserColor = (username) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % userColors.length;
  return userColors[index];
};

const saveMessagesToStorage = (messages) => {
  localStorage.setItem("chatMessages", JSON.stringify(messages));
};

const loadMessagesFromStorage = () => {
  const messages = localStorage.getItem("chatMessages");
  return messages ? JSON.parse(messages) : [];
};

function App() {
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState(loadMessagesFromStorage());
  const messagesEndRef = useRef(null);

  const handleLogin = () => {
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      setIsLoggedIn(true);
    }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMessage = {
      text: message,
      time: new Date().toLocaleTimeString(),
      username: username,
    };
    socket.emit("send_message", newMessage);
    setMessage("");
  };

  useEffect(() => {
    saveMessagesToStorage(chat);
  }, [chat]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => {
        const isExist = prev.some(
          (msg) =>
            msg.time === data.time &&
            msg.username === data.username &&
            msg.text === data.text
        );
        if (isExist) return prev;

        const updated = [...prev, data];
        saveMessagesToStorage(updated);
        return updated;
      });
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const clearChat = () => {
    localStorage.removeItem("chatMessages");
    setChat([]);
  };

  const containerStyle = {
    height: "100vh",
    width: "100vw",
    backgroundColor: "#1a1a1a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    
  };

  const boxStyle = {
    width: 400,
    maxHeight: "90vh",
    backgroundColor: "#6a4db7",
    boxShadow: "0 4px 15px rgba(106, 77, 183, 0.4), 0 6px 20px rgba(106, 77, 183, 0.3)",
    color: "white",     
    borderRadius: 16,
    padding: 24,
    color: "white",
    textAlign: "center",
  };

  const inputStyle = {
    width: "95%",
    padding: "12px 15px",
    fontSize: 16,
    borderRadius: 8,
    border: "none",
    outline: "none",
    marginBottom: 16,
    backgroundColor: "#444",
    color: "#fff",
  };

  if (!isLoggedIn) {
    
    return (
      <div style={containerStyle}>
        <div style={boxStyle}>
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>
            Hoşgeldiniz!
          </h2>

          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Kullanıcı adı"
            style={{
              width: "80%",
              padding: "12px 15px",
              fontSize: 16,
              borderRadius: 8,
              border: "none",
              outline: "none",
              marginBottom: 20,
              boxShadow: "inset 0 0 5px rgba(255, 255, 255, 0.3)",
              color: "#6a4db7",
              fontWeight: "600",
            }}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />

          <button
            onClick={handleLogin}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: 18,
              fontWeight: "700",
              borderRadius: 8,
              border: "none",
              backgroundColor: "#fff",
              color: "#6a4db7",
              cursor: "pointer",
              boxShadow:
                "0 3px 10px rgba(255, 255, 255, 0.6), 0 5px 15px rgba(255, 255, 255, 0.4)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#eaeaea";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#fff";
            }}
          >

            Giriş Yap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={{ ...boxStyle, width: 500,backgroundColor: "#1e1e1e",}}>
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Sohbet Odası ({username})
        </h2>

        <div
          style={{
          height: 300,
          overflowY: "auto",
          backgroundColor: "#333333",
          borderRadius: 10,
          padding: 10,
          marginBottom: 15,
          }}
    >
            {chat.map((msg, i) => {
              const isOwnMessage = msg.username === username;
              const bgColor = isOwnMessage
                ? "#6a4db7"
                : getUserColor(msg.username);
              return (
                <div
                  key={i}
                  style={{
                    maxWidth: "50%",
                    marginBottom: 12,
                    marginLeft: isOwnMessage ? "auto" : "0",
                    backgroundColor: bgColor,
                    color: "white",
                    padding: "12px 18px",
                    borderRadius: 20,
                    borderTopRightRadius: isOwnMessage ? 0 : 20,
                    borderTopLeftRadius: isOwnMessage ? 20 : 0,
                    boxShadow: isOwnMessage
                      ? "0 4px 12px rgba(106, 77, 183, 0.7)"
                      : "0 4px 12px rgba(0,0,0,0.8)",
                    wordBreak: "break-word",
                    fontWeight: "600",
                    fontSize: 15,
                    textAlign:"left"
                  }}
                >
                  <div style={{ marginBottom: 6, opacity: 0.75, fontSize: 13, textAlign:"left" }}>
                    {msg.username}
                  </div>
                  <div>{msg.text}</div>
                  <div
                    style={{
                      fontSize: 11,
                      textAlign: "right",
                      marginTop: 8,
                      opacity: 0.6,
                    }}
                  >
                    {msg.time}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Mesajınızı yazın..."
          style={inputStyle}
        />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button
            onClick={sendMessage}
            style={{
              ...inputStyle,
              backgroundColor: "#6a4db7",
              color: "white",
              fontWeight: "bold",
              width: "48%",
              cursor: "pointer",
            }}
          >
            Gönder
          </button>
          <button
            onClick={clearChat}
            style={{
              ...inputStyle,
              backgroundColor: "#b00020",
              color: "white",
              fontWeight: "bold",
              width: "48%",
              cursor: "pointer",
            }}
          >
            Temizle
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
