import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

const AuthContext =
  createContext({});

export function AuthProvider({
  children,
}) {
  const [user, setUser] =
    useState(null);

  const [perfil, setPerfil] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  async function carregarPerfil(
    userId
  ) {
    const {
      data,
      error,
    } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.log(error);
      return;
    }

    setPerfil(data);
  }

  useEffect(() => {
    async function carregar() {
      const {
        data: { session },
      } =
        await supabase.auth.getSession();

      const usuario =
        session?.user || null;

      setUser(usuario);

      if (usuario) {
        await carregarPerfil(
          usuario.id
        );
      }

      setLoading(false);
    }

    carregar();

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        async (
          _event,
          session
        ) => {
          const usuario =
            session?.user || null;

          setUser(usuario);

          if (usuario) {
            await carregarPerfil(
              usuario.id
            );
          } else {
            setPerfil(null);
          }
        }
      );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(
    email,
    password
  ) {
    return await supabase.auth.signInWithPassword(
      {
        email,
        password,
      }
    );
  }

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
    setPerfil(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        perfil,
        loading,
        signIn,
        signOut,
      }}
    >
      {!loading &&
        children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}