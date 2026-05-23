import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";

function formatarData(data) {
  return new Date(data).toLocaleString("pt-BR");
}

function App() {
  const {
    user,
    perfil,
    loading,
    signIn,
    signOut,
  } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [placa, setPlaca] =
    useState("");

  const [modelo, setModelo] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [
    movimentacoes,
    setMovimentacoes,
  ] = useState([]);

  async function carregarMovimentacoes() {
    const {
      data,
      error,
    } = await supabase
      .from("movimentacoes")
      .select("*")
      .order(
        "entrada_em",
        {
          ascending: false,
        }
      );

    if (error) {
      console.log(error);
      return;
    }

    setMovimentacoes(data);
  }

  useEffect(() => {
    if (user) {
      carregarMovimentacoes();
    }
  }, [user]);

  async function handleLogin(e) {
    e.preventDefault();

    const { error } =
      await signIn(
        email,
        password
      );

    if (error) {
      alert(error.message);
    }
  }

  async function registrarEntrada(
    e
  ) {
    e.preventDefault();

    const { error } =
      await supabase
        .from("movimentacoes")
        .insert([
          {
            placa,
            modelo,
            status: "ativo",
          },
        ]);

    if (error) {
      alert(error.message);
      return;
    }

    setPlaca("");
    setModelo("");

    carregarMovimentacoes();
  }

  async function registrarSaida(
    item
  ) {
    const entrada =
      new Date(
        item.entrada_em
      );

    const saida =
      new Date();

    const diffMs =
      saida.getTime() -
      entrada.getTime();

    const horas =
      Math.max(
        1,
        Math.ceil(
          diffMs /
            1000 /
            60 /
            60
        )
      );

    const valor =
      horas * 15;

    const { error } =
      await supabase
        .from("movimentacoes")
        .update({
          status:
            "finalizado",
          saida_em:
            new Date(),
          valor,
        })
        .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    carregarMovimentacoes();
  }

  const ativos =
    movimentacoes.filter(
      (m) =>
        m.status === "ativo"
    );

  const filtrados =
    movimentacoes.filter(
      (item) =>
        item.placa
          ?.toLowerCase()
          .includes(
            busca.toLowerCase()
          )
    );

  if (loading) {
    return (
      <div>
        Carregando...
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight:
            "100vh",
          display: "flex",
          justifyContent:
            "center",
          alignItems:
            "center",
          background:
            "#f5f5f5",
          fontFamily:
            "Arial",
        }}
      >
        <form
          onSubmit={
            handleLogin
          }
          style={{
            background:
              "#fff",
            padding: 30,
            borderRadius: 10,
            width: 320,
            display: "flex",
            flexDirection:
              "column",
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
              setEmail(
                e.target.value
              )
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
              setPassword(
                e.target.value
              )
            }
            style={{
              padding: 12,
            }}
          />

          <button type="submit">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "#f5f5f5",
        padding: 20,
        fontFamily:
          "Arial",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems:
            "center",
        }}
      >
        <div>
          <h1>
            Plaza Pontal Parking
          </h1>

          <p>
            {perfil?.nome ||
              user.email}
          </p>

          <p>
            {perfil?.tipo ||
              "operador"}
          </p>
        </div>

        <button
          onClick={signOut}
        >
          Sair
        </button>
      </div>

      <div
        style={{
          marginTop: 20,
          background:
            "#fff",
          padding: 20,
          borderRadius: 10,
        }}
      >
        <h3>
          Veículos Ativos
        </h3>

        <h1>
          {ativos.length}
        </h1>
      </div>

      <form
        onSubmit={
          registrarEntrada
        }
        style={{
          background:
            "#fff",
          padding: 20,
          borderRadius: 10,
          marginTop: 20,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          placeholder="Placa"
          value={placa}
          onChange={(e) =>
            setPlaca(
              e.target.value
            )
          }
          style={{
            padding: 12,
            flex: 1,
          }}
        />

        <input
          placeholder="Modelo"
          value={modelo}
          onChange={(e) =>
            setModelo(
              e.target.value
            )
          }
          style={{
            padding: 12,
            flex: 1,
          }}
        />

        <button type="submit">
          Entrada
        </button>
      </form>

      <div
        style={{
          marginTop: 20,
          background:
            "#fff",
          borderRadius: 10,
          padding: 20,
        }}
      >
        <h2>
          Veículos
        </h2>

        <input
          placeholder="Buscar placa"
          value={busca}
          onChange={(e) =>
            setBusca(
              e.target.value
            )
          }
          style={{
            padding: 12,
            width: "100%",
            marginBottom: 20,
          }}
        />

        {filtrados.map(
          (item) => (
            <div
              key={item.id}
              style={{
                borderBottom:
                  "1px solid #ddd",
                padding: 10,
                display: "flex",
                justifyContent:
                  "space-between",
              }}
            >
              <div>
                <strong>
                  {item.placa}
                </strong>

                <br />

                {item.modelo}

                <br />

                Status:
                {" "}
                {item.status}

                <br />

                Entrada:
                {" "}
                {formatarData(
                  item.entrada_em
                )}

                {item.status ===
                  "finalizado" && (
                  <>
                    <br />

                    Saída:
                    {" "}
                    {formatarData(
                      item.saida_em
                    )}

                    <br />

                    Valor:
                    {" "}
                    R$
                    {" "}
                    {Number(
                      item.valor || 0
                    ).toFixed(2)}
                  </>
                )}
              </div>

              {item.status ===
              "ativo" ? (
                <button
                  onClick={() =>
                    registrarSaida(
                      item
                    )
                  }
                >
                  Saída
                </button>
              ) : (
                <span>
                  Finalizado
                </span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;