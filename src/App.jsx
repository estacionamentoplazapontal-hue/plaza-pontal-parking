import { useState } from "react";
import { useAuth } from "./context/AuthContext";

function App() {
  const {
    user,
    signIn,
    signOut,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  async function handleLogin(e) {
    e.preventDefault();

    const { error } =
      await signIn(email, password);

    if (error) {
      alert(error.message);
    }
  }

  if (user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f5f5",
          padding: 40,
          fontFamily: "Arial",
        }}
      >
        <h1>
          Plaza Pontal Parking
        </h1>

        <p>
          Sistema online
        </p>

        <p>
          Usuário:
          {" "}
          {user.email}
        </p>

        <button
          onClick={signOut}
        >
          Sair
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
        fontFamily: "Arial",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#fff",
          padding: 30,
          borderRadius: 10,
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <h2>
          Plaza Pontal Parking
        </h2>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={{
            padding: 12,
          }}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={{
            padding: 12,
          }}
        />

        <button
          type="submit"
          style={{
            padding: 12,
            cursor: "pointer",
          }}
        >
          Entrar
        </button>
      </form>
    </div>
  );
}

export default App;