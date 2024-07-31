import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import api from '../../api';
import './Login.css';

export function Login() {
  const navigate = useNavigate();
  const {auth, setAuth} = useContext(AuthContext);
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState('DC Username');
  const [error, setError] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const [reqType, setReqType] = useState('U');

  useEffect(() => {
    
  }, []);

  const login = async () => {
    const resBody = await api('POST', 'login', { input: input, reqType: reqType });
    
    switch (reqType) {
      case 'U':
        if (resBody) {
          // Rem login
          if (resBody.avatarURL) {
            setAuth({
              admin: true,
              avatarURL: resBody.avatarURL
            });
            navigate('/home');
          } 
          // member login
          else {
            setInput('');
            setReqType('C');
            setPlaceholder('6-Digit Pin');
          }
        } else {
          setErrMsg('Username not found');
          setError(true);
        }
        break;
      case 'C':
        if (resBody) {
          setAuth({
            id: resBody.id,
            admin: resBody.admin,
            username: resBody.username,
            avatarURL: resBody.avatarURL
          });
          navigate('/home');
        } else {
          setErrMsg('Incorrect pin');
          setError(true);
        }
        break;
    }
  }

  const resetLogin = () => {
    setInput('');
    setReqType('U');
    setPlaceholder('DC Username');
    setError(false);
  }

  return (
    <AuthContext.Provider value={{auth, setAuth}}>
      <div className="left-login"/>
      <div className="right-login">
        <span/>
        <div className="login-body">
          <p className={error ? "error" : ""}>{errMsg}</p>
          <input
            value={input}
            placeholder={placeholder}
            onChange={e => setInput(e.target.value)}
            onKeyUp={e => { if (e.key === 'Enter') login() }}
          />
          <div>
            <button onClick={resetLogin}><span>Reset</span></button>
            <button onClick={login}><span>Login</span></button>
          </div>
          <button className="login-button">
            <span className="fa-brands fa-discord"/>
            <b>Login with Discord</b>
          </button>
        </div>
        <p>レム</p>
      </div>
    </AuthContext.Provider>
  )
}