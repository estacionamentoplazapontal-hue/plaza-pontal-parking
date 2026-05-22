import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import { supabase } from "./lib/supabase";

function formatarData(data) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      timeZone:
        "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "medium",
    }
  ).format(new Date(data));
}

function App() {
  const { user, signOut } =
    useAuth();

  const [placa, setPlaca] =
    useState("");

  const [modelo, setModelo] =
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
    carregarMovimentacoes();
  }, []);

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

    const minutos =
      Math.ceil(
        diffMs / 1000 / 60
      );

    const horas =
      Math.max(
        1,
        Math.ceil(
          minutos / 60
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
            saida.toISOString(),
          valor,
        })
        .eq("id", item.id);

    if (error) {
      alert(error.message);
      return;
    }

    carregarMovimentacoes();
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
            Plaza Pontal
            Parking
          </h1>

          <p>
            Usuário:
            {" "}
            {user?.email}
          </p>
        </div>

        <button
          onClick={signOut}
        >
          Sair
        </button>
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

        {movimentacoes.map(
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

                    Permanência:
                    {" "}
                    {Math.max(
                      1,
                      Math.ceil(
                        (new Date(
                          item.saida_em
                        ).getTime() -
                          new Date(
                            item.entrada_em
                          ).getTime()) /
                          1000 /
                          60 /
                          60
                      )
                    )}
                    h

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
                <span
                  style={{
                    color:
                      "green",
                    fontWeight:
                      "bold",
                  }}
                >
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