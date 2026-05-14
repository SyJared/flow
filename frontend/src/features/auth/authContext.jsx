import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../../api/auth.js";

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const logout = () => {
  localStorage.removeItem("token");
  setUser(null);
};

  useEffect(() => {
   
    const loadUser = async () => {
      try {
        const data = await getMe();
        
        setUser(data.user);
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null); 
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, []);

  const defaultUser = {
  id: null,
  name: '',
  email: '',
};



  return (
    <AuthContext.Provider value={{ user, setUser, userLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);