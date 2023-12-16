// import { HOST } from '../config';
import { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import LHN from './LHN';
import '../App.css';

function ProtectedRoute({ auth, children }) {
	const navigate = useNavigate();

	useEffect(() => {
		if (!auth) {
			navigate('/login');
		}
	}, []);

	return children;
};

export default function Root() {
	const [avatarURL, setAvatarURL] = useState('');
	const navigate = useNavigate();
	const {auth, setAuth} = useContext(AuthContext);

	useEffect(() => {
		console.log(auth)
	}, []);

	return (
		<ProtectedRoute auth={auth}>
			<LHN/>
			<Outlet/>
		</ProtectedRoute>
	)
}