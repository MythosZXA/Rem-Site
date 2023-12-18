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
					setInput('');
					setReqType('C');
					setPlaceholder('6-Digit Pin');
				} else {
					setErrMsg('Username not found');
					setError(true);
				}
				break;
			case 'C':
				if (resBody) {
					setAuth({
						id: resBody.id,
						username: resBody.username,
						avatarURL: resBody.avatarURL
					});
					navigate('/home');
				}
				break;
		}
	}

	const resetLogin = () => {

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
				</div>
				<p>レム</p>
			</div>
		</AuthContext.Provider>
	)
}