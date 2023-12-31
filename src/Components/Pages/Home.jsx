import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './Home.css';

export default function Home() {
	const {auth, setAuth} = useContext(AuthContext);

	return(
		<div className="page-container active" id="containerHome">
			<div className="profile-card">
				<span
					className="profile-avatar"
					style={{backgroundImage: `url(${auth.avatarURL})`}}
				/>
			</div>
		</div>
	)
}