import { useEffect, useState } from "react";
import { HOST } from "../../config";
import './Cards.css';

export default function Cards() {
	const [active, setActive] = useState(false);
	const [players, setPlayers] =  useState([]); // players current in the cards page

	useEffect(() => {
		const lobby = new EventSource(`${HOST}/cards/lobby`, { withCredentials: true });

		// new player joined lobby
		lobby.onmessage = e => {
			setPlayers(JSON.parse(e.data));
		};

		// error
		lobby.onerror = e => {
			console.log('Failed connecting to lobby');
			lobby.close();
		}

		// leave lobby
		return () => {
			lobby.close();
		}
	}, []);

	return(
		<div className="page-container" id="containerCards">
			<div className="select-container">
				<h3>Select up to 3 other players</h3>
				{players.length > 0 &&
					<ul className="player-list">
						{players.map((player, i) => (
							<li key={`lp${i}`}>
								<img style={{ backgroundImage: `url(${player.avatarURL})`}}/>
								<p>{player.username}</p>
							</li>
						))}
					</ul>
				}
				{players.length === 0 && 
					<h4>No other players currently in the lobby...</h4>
				}
			</div>
		</div>
	)
}