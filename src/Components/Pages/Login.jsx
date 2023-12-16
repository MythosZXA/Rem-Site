import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import api from '../../api';
import './Login.css';

export function Login() {
	const navigate = useNavigate();
	const {auth, setAuth} = useContext(AuthContext);
	const [input, setInput] = useState();
	const [reqType, setReqType] = useState('N');

	useEffect(() => {
		
	}, []);

	const login = async () => {
		setAuth(true);
		navigate('/home');
	}

	const resetLogin = () => {

	}

	return (
		<AuthContext.Provider value={auth}>
			<div className="left-login"/>
			<div className="right-login">
				<span/>
				<div className="login-body">
					<p>Message</p>
					<input
						value={input}
						placeholder='DC Username'
						onChange={e => setInput(e.target.value)}
						// onKeyDown={e => { if (e.key === 'Enter') login() }}
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