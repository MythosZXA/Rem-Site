import { useContext, useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';
import { HOST } from "../../config";
import { AuthContext } from "../../AuthContext.jsx";
import api from '../../api.js';
import cards from '../../Images/Cards/index.js';
import './Cards.css';

let socket;

export default function Cards() {
  const [active, setActive] = useState(false);
  
  return(
    <div className="page-container" id="containerCards">
      {active ?
        <Game
        /> :
        <Lobby
          setActive={ setActive }
        />
      }
    </div>
  )
}

function Lobby({ setActive }) {
  const {auth} = useContext(AuthContext);
  const [guests, setGuests] =  useState([]); // guests currently in the lobby
  const [selected, setSelected] = useState(new Set()); // guests currently selected

  // set up SSE for lobby information
  useEffect(() => {
    const lobby = new EventSource(`${HOST}/cards/lobby`, { withCredentials: true });

    // lobby was updated or game started
    lobby.onmessage = e => {
      const jsonData = JSON.parse(e.data);

      // if response has guest data then it's a lobby
      if (jsonData[0]?.username) { // prolly needs to be refactored
        const filteredLobby = jsonData.filter(guest => guest.username !== auth.username);
        setGuests(filteredLobby);
      }
      // otherwise there's an active game
      else {
        setActive(true);
      }
    };

    // error
    lobby.onerror = e => {
      console.error(e);
      lobby.close();
    };

    // leave lobby
    return () => {
      lobby.close();
    };
  }, []);

  // remove selected guests that aren't in lobby
  useEffect(() => {
    if (!guests.length) {
      setSelected(new Set());
    } else {
      // loop through selected usernames and remove those that aren't in the lobby
      const cloneSet = new Set([...selected]);
      selected.forEach(username => {
        if (!guests.some(player => player.username === username)) {
          cloneSet.delete(username);
        }
      });

      setSelected(cloneSet);
    }
  }, [guests]);

  const selectPlayer = username => {
    const newSel = new Set(selected);
    if (newSel.has(username)) {
      newSel.delete(username);
    } else if (selected.size < 3) {
      newSel.add(username);
    }
    setSelected(newSel);
  }

  const beginGame = async () => {
    const resBody = await api('POST', 'cards/begin', {
      players: [auth.username, ...selected]
    });

    if (resBody) {
      setActive(true);
    }
  }

  return (
    <div className="select-container">
      <h3>Select up to 3 other players</h3>
      {guests.length > 0 ?
        <>
          <PlayerList players={guests} selected={selected} selectPlayer={selectPlayer}/>
          {selected.size > 0 && <button onClick={beginGame}>Start</button>}
        </>
        :
        <h4>No other guests currently in the lobby...</h4>
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

function Game() {
  const {auth} = useContext(AuthContext);
  const [hand, setHand] = useState([]);
  const [toPlay, setToPlay] = useState([]);

  // initialize socket to get/play cards
  useEffect(() => {
    socket = io(HOST, { query: {id: `HandCard-${auth.id}`}, withCredentials: true });
    
    socket.on('hand', (hand) => {
      setHand(hand);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  const addToPlay = (index) => {
    // remove from hand
    const newHand = [...hand];
    const selectedCard = newHand.splice(index, 1);
    setHand(newHand);
    // add to toPlay
    const newToPlay = [...toPlay, ...selectedCard];
    setToPlay(newToPlay);
  };

  const removeFromPlay = (index) => {
    // remove from toPlay
    const newToPlay = [...toPlay];
    const selectedCard = newToPlay.splice(index, 1);
    console.log(selectedCard);
    setToPlay(newToPlay);
    // add to hand
    const newHand = [...hand, ...selectedCard];
    setHand(newHand);
  };

  const play = () => {
    socket.emit('cardPlay', { arrCards: toPlay });
    setToPlay([]);
  };

  return (
    <>
      <Table/>
      <div className="hand">
        {toPlay.map((card, i) => (
          <div
            key={`tp${card}`}
            className="card"
            style={{backgroundImage: `url(${cards[card]})`}}
            onClick={() => removeFromPlay(i)}
          />
        ))}
        {toPlay.length > 0 &&
          <button onClick={play}>Play</button>
        }
      </div>
      <div className="hand">
        {hand.map((card, i) => (
          <div
            key={`h${card}`}
            className="card"
            style={{backgroundImage: `url(${cards[card]})`}}
            onClick={() => addToPlay(i)}
          />
        ))}
      </div>
    </>
  );
}

function Table() {
  const [table, setTable] = useState([]);

  useEffect(() => {
    const tableE = new EventSource(`${HOST}/cards/table`, { withCredentials: true });

    // lobby was updated or game started
    tableE.onmessage = e => {
      const jsonData = JSON.parse(e.data);

      setTable(jsonData);
    };

    // error
    tableE.onerror = e => {
      console.error(e);
      tableE.close();
    };

    // stop spectating game
    return () => {
      tableE.close();
    };
  }, []);

  return (
    <div className="table column">
      {table.map((row, i) => (
        <div key={`r${i}`} className="hand">
          {row.map(card => (
            <div
              key={`tb${card}`}
              className="card"
              style={{backgroundImage: `url(${cards[card]})`}}
            />
          ))}
        </div>
      ))}
    </div>
  );
}