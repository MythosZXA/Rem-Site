import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import './LHN.css'

export default function LHN() {
	const navigate = useNavigate();
	const {auth, setAuth} = useContext(AuthContext);
	const [active, setActive] = useState(false);

	const logout = () => {
		setAuth(false);
		navigate('/login');
	}

	const renderTab = (label) => {
		return (
			<li onClick={ () => {
					navigate(`/${label.toLowerCase()}`);
					setActive(false);
				}}>
				{label}
			</li>
		)
	}

	return (
		<>
			<button className={`nav-button ${active ? "active" : ""}`} onClick={ () => setActive(!active) }>
				<span/>
			</button>
			<nav className={`lhn ${active ? "active" : ""}`}>
				<ul className="nav-list">
					{renderTab('Home')}
					{auth && renderTab('Palia')}
					{auth && renderTab('Message')}
					<li onClick={logout}>Logout</li>
				</ul>
			</nav>
		</>
	)
}