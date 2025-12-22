import { useState, useEffect } from "react";
import { Client } from "@/integrations/supabase/scheduling";

const CLIENT_STORAGE_KEY = "client_data";

export function useClientAuth() {
     const [client, setClient] = useState<Client | null>(null);
     const [isLoading, setIsLoading] = useState(true);

     useEffect(() => {
          // Carregar cliente do localStorage
          const storedClient = localStorage.getItem(CLIENT_STORAGE_KEY);
          if (storedClient) {
               try {
                    setClient(JSON.parse(storedClient));
               } catch (error) {
                    console.error("Erro ao carregar dados do cliente:", error);
                    localStorage.removeItem(CLIENT_STORAGE_KEY);
               }
          }
          setIsLoading(false);
     }, []);

     const login = (clientData: Client) => {
          localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clientData));
          setClient(clientData);
     };

     const logout = () => {
          localStorage.removeItem(CLIENT_STORAGE_KEY);
          setClient(null);
     };

     const updateClient = (clientData: Client) => {
          localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(clientData));
          setClient(clientData);
     };

     return {
          client,
          isLoading,
          isAuthenticated: !!client,
          login,
          logout,
          updateClient,
     };
}
