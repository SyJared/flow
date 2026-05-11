import { useEffect, useState } from "react";
import { loginUser } from "../../api/auth.js";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

function Login() {
  const { setUser, user } = useAuth()

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("yoyoyo");

  const navigate = useNavigate();

  


  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await loginUser({ email, password });
      console.log(data, "sssss")
      // redirect after login
      if(data.success){
        
        localStorage.setItem("token", data.token);
        setUser({
        id: data.user?.id || null,
        name: data.user?.name || '',
        email: data.user?.email || '',
      });
        setMessage(data.message)
        navigate("/logged",  { replace: true });
      }else{
          setMessage(data.message)
      }

    } catch (err) {
      console.error(err);
      setMessage(data.message);
    }
  };

  return (
    <>
    <form onSubmit={handleLogin}>
      <input
        className="form-control"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        className="form-control"
        placeholder="Password"
        type="password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Login</button>
      
    </form>
    <button onClick={() => navigate('/register')}>Register</button>
    {message && <p>{message}</p>}
    </>
  );
}

export default Login;