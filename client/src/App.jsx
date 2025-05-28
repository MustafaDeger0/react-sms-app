import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:3001");

const userColors = [
  "#6a4db7", "#f25f5c", "#70c1b3", "#b5ac07", "#577590", "#9a8c98"
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

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f0f0f",
        padding: 20,
      }}
    >
      {!isLoggedIn ? (
        <div
          style={{
            maxWidth: 400,
            width: "100%",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            textAlign: "center",
            padding: 30,
            borderRadius: 12,
            backgroundColor: "#6a4db7",
            boxShadow:
              "0 4px 15px rgba(106, 77, 183, 0.4), 0 6px 20px rgba(106, 77, 183, 0.3)",
            color: "white",
          }}
        >
          <h2 style={{ marginBottom: 20, fontWeight: "700" }}>Hoşgeldin</h2>
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
      ) : (
        <div
          style={{
            maxWidth: 600,
            width: "100%",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            backgroundColor: "#1a1a1a",
            padding: 20,
            borderRadius: 12,
            color: "white",
            boxShadow: "0 4px 20px rgba(106, 77, 183, 0.6), 0 6px 25px rgba(0,0,0,0.8)",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 20, fontWeight: "700" }}>
            Gerçek Zamanlı Chat
          </h2>

          <button
            onClick={clearChat}
            style={{
              marginBottom: 15,
              padding: "10px 15px",
              backgroundColor: "#b00020",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: "700",
              boxShadow: "0 2px 8px rgba(176, 0, 32, 0.8)",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#d00030";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#b00020";
            }}
          >
            Sohbeti Sıfırla
          </button>

          <div
            style={{
              height: 350,
              overflowY: "auto",
              padding: 15,
              borderRadius: 12,
              backgroundColor: "#2c2c2c",
              boxShadow: "inset 0 0 10px #4b2a7a",
              marginBottom: 15,
            }}
          >
            {chat.map((msg, i) => {
              const isOwnMessage = msg.username === username;
              const bgColor = isOwnMessage ? "#6a4db7" : getUserColor(msg.username);
              return (
                <div
                  key={i}
                  style={{
                    maxWidth: "80%",
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
                  }}
                >
                  <div style={{ marginBottom: 6, opacity: 0.75, fontSize: 13 }}>
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
            placeholder="Mesaj yaz..."
            style={{
              width: "100%",
              padding: 14,
              fontSize: 16,
              borderRadius: 12,
              border: "none",
              outline: "none",
              boxShadow: "0 0 10px #6a4db7",
              backgroundColor: "#333333",
              color: "white",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
