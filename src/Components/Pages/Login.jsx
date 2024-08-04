import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const {auth, setAuth} = useContext(AuthContext);

  useEffect(() => {
    
  }, []);

  return (
    <AuthContext.Provider value={{auth, setAuth}}>
      <div className="left-login"/>
      <div className="right-login">
        <span/>
        <div className="login-body">
          <button className="login-button" onClick={() => { location.href = "https://discord.com/oauth2/authorize?client_id=773657778593202217&response_type=token&redirect_uri=https%3A%2F%2Frem.mythzxa.com%2Fhome&scope=identify" }}>
            <span className="fa-brands fa-discord"/>
            <b>Login with Discord</b>
          </button>
        </div>
        <p>レム</p>
      </div>
    </AuthContext.Provider>
  )
}