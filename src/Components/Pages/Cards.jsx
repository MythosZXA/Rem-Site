import { useEffect, useRef, useState } from "react";
import Draggable from "react-draggable";
import { HOST } from "../../config";
import api from '../../api.js';
import './Cards.css';
import cards from '../../Images/Cards/index.js';

export default function Cards() {
	const [active, setActive] = useState(false);
	const [hand, setHand] = useState([]);
	
	return(
		<div className="page-container" id="containerCards">
			{active ?
				<Table
					hand={ hand }
					setHand={ setHand }
				/> :
				<Lobby
					setActive={ setActive }
					setHand={ setHand }
				/>
			}
		</div>
	)
}

function Lobby({ setActive, setHand }) {
	const [players, setPlayers] =  useState([]); // players currently in the lobby
	const [selected, setSelected] = useState(new Set()); // players currently selected

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

	// remove selected players that aren't in lobby
	useEffect(() => {
		if (!players.length) {
			setSelected(new Set());
		} else {
			selected.forEach(username => {
				if (!players.some(player => player.username === username)) {
					const newSel = new Set(selected);
					newSel.delete(username);
					setSelected(newSel);
				}
			});
		}
	}, [players]);

	const selectPlayer = username => {
		const newSel = new Set(selected);
		if (newSel.has(username)) {
			newSel.delete(username);
		} else if (selected.size < 3) {
			newSel.add(username);
		}
		setSelected(newSel);
	}

	const startGame = async () => {
		const resBody = await api('POST', 'cards/start', {
			players: [...selected]
		});

		if (resBody) {
			setActive(true);
			setHand(resBody);
		}
	}

	return (
		<div className="select-container">
			<h3>Select up to 3 other players</h3>
			{players.length > 0 ?
				<>
					<PlayerList players={players} selected={selected} selectPlayer={selectPlayer}/>
					{selected.size > 0 && <button onClick={startGame}>Start</button>}
				</>
				:
				<h4>No other players currently in the lobby...</h4>
			}
		</div>

	)
}

function PlayerList({ players, selected, selectPlayer }) {
	return (
		<ul className="player-list">
			{players.map((player, i) => (
				<Player key={`li${i}`} player={player} selected={selected} selectPlayer={selectPlayer}/>
			))}
		</ul>
	)
}

function Player({ player, selected, selectPlayer }) {
	return (
		<li
			className={selected.has(player.username) ? 'selected' : ''}
			onClick={() => selectPlayer(player.username)}
		>
			<img style={{ backgroundImage: `url(${player.avatarURL})`}}/>
			<p>{player.username}</p>
		</li>
	)
}

function Table({ hand, setHand }) {
	const tableRef = useRef();
	const [table, setTable] = useState([]);

	const placeCard = dragData => {
		console.log(tableRef.current.getBoundingClientRect())
	}

	return (
		<div>
			<div className="table" ref={tableRef}></div>
			<div className="hand">
				{hand.map((card) => (
					<Draggable
						key={`d${card}`}
						onStop={(e, data) => placeCard(data)}
					>
						<div className="card" style={{backgroundImage: `url(${cards[card]})`}}/>
					</Draggable>
				))}
			</div>
		</div>
	)
}