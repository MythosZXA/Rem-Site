import './Home.css';

export default function Home(avatarURL) {
	return(
		<div className="page-container active" id="containerHome">
			<div className="profile-card">
				<span
					className="profile-avatar"
					style={{backgroundImage: `url(${avatarURL})`}}
				/>
			</div>
		</div>
	)
}