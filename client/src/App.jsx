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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setTempUsername("");
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
    width: "95%",
    maxWidth: 500,
    maxHeight: "90vh",
    backgroundColor: "#1e1e1e",
    boxShadow:
      "0 4px 15px rgba(106, 77, 183, 0.4), 0 6px 20px rgba(106, 77, 183, 0.3)",
    color: "white",
    borderRadius: 16,
    padding: 24,
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
      <div style={{
        ...containerStyle,
        padding: 20,
      }}>
        <div style={{
          ...boxStyle,
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#1e1e1e",
          padding: "2rem",
          textAlign: "center",
        }}>
          <h2 style={{
            marginBottom: "1.5rem",
            fontSize: "1.5rem"
          }}>
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
              backgroundColor: "#2d2d2d",
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
      <div style={boxStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ textAlign: "center", margin: 0 }}>
            Sohbet Odası ({username})
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={clearChat}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#e74c3c',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(231, 76, 60, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Sohbeti Temizle"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>

            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#555',
                cursor: 'pointer',
                padding: '5px',
                borderRadius: '5px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(85, 85, 85, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
              title="Çıkış Yap"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>

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
                  textAlign: "left",
                }}
              >
                <div
                  style={{
                    marginBottom: 6,
                    opacity: 0.75,
                    fontSize: 13,
                    textAlign: "left",
                  }}
                >
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

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Mesajınızı yazın..."
            style={{
              ...inputStyle,
              width: 'calc(100% - 50px)',
              marginBottom: 0,
              borderTopRightRadius: 0,
              borderBottomRightRadius: 0
            }}
          />
          <button
            onClick={sendMessage}
            style={{
              width: '50px',
              height: '46px',
              backgroundColor: '#6a4db7',
              color: 'white',
              border: 'none',
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              cursor: 'pointer',
              marginLeft:"5px",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#5d3dac';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#6a4db7';
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
