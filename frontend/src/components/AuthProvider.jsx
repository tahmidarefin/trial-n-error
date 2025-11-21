import { createContext } from "react";
import { useState, useEffect } from "react";

export const UserContext = createContext();
export default function AuthProvider({ children }) {
    const ENDPOINT_URL = "http://localhost:8000/auth/user/me";
    const [user, setUser] = useState(null);

    const authorizeUser = async () => {
      const access = localStorage.getItem("access");
      if(access) {
        (async () => {
          const response = await fetch(ENDPOINT_URL, {
              headers: {
                "Authorization": `Bearer ${access}`
              }
          });
          const _data = await response.json();
          if(_data.hasOwnProperty('id')) {
            setUser(_data);
          }
        })();
      }
    };

    useEffect(() => {
        authorizeUser();
    }, []);

    return <UserContext value={{user, setUser}}>
        { children }
    </UserContext>
}