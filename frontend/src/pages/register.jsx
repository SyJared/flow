import { useState } from "react";
import { registerUser } from "../api/register";


function Register(){
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try{
      const data = await registerUser({ name, email, password });
      
      if(data.errors){
        setMessage(data.errors.map(e => `${e.message}`).join("\n"));
      }else{
        setMessage(data.message);
      }
      
    }catch(err){
        console.error(err);
    }
  };
  return(
    <>
    <form onSubmit={handleRegister}>
  <input
    type="text"
    placeholder="Enter your name..."
    value={name}
    onChange={(e) => setName(e.target.value)}
  />

  <input
    type="email"
    placeholder="Enter your email..."
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />

  <input
    type="password"
    placeholder="Enter your password..."
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  <button type="submit">Register</button>

  <p>Already have an account? <a href="/login">Login</a></p>
</form>
    {message && <p>{message}</p>}
    </>
  )
}
export default Register;