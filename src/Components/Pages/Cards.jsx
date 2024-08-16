import { useContext, useEffect, useRef, useState } from "react";
import { io } from 'socket.io-client';
import { HOST } from "../../config";
import { AuthContext } from "../../AuthContext.jsx";
import Draggable from "react-draggable";
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
  const {auth, setAuth} = useContext(AuthContext);
  const [guests, setGuests] =  useState([]); // guests currently in the lobby
  const [selected, setSelected] = useState(new Set()); // guests currently selected

  // set up SSE for lobby information
  useEffect(() => {
    const lobby = new EventSource(`${HOST}/cards/lobby`, { withCredentials: true });

    // lobby was updated or game started
    lobby.onmessage = e => {
      const jsonData = JSON.parse(e.data);

      // if response has guest data then it's a lobby
      if (jsonData[0]?.username) {
        const filteredLobby = jsonData.filter(guest => guest.username !== auth.username);
        setGuests(filteredLobby);
      }
      // otherwise it's a table
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
  const tableRef = useRef();
  const {auth, setAuth} = useContext(AuthContext);
  const [table, setTable] = useState([[]]);
  const [hand, setHand] = useState([]);

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

  const placeCard = (e, dragData) => {
    const tableRect = tableRef.current.getBoundingClientRect();
    const cardOrigin = dragData.node.getAttribute('origin');


    if (cardOrigin === 'table' && !isInsideTable({x: e.clientX, y: e.clientY}, tableRect)) {
      takeFromTable(dragData.node.id);
    } else if (cardOrigin === 'hand') {
      if (isInsideTable({x: e.clientX, y: e.clientY}, tableRect)) {
        placeToTable(dragData.node.id);
      } else if (e.clientX < tableRect.left) {
        moveCard(dragData.node.id, 'B');
      } else if (e.clientX > tableRect.right) {
        moveCard(dragData.node.id, 'F');
      }
    }
  }

  // helper functions
  const isInsideTable = (mousePos, tableRect) => {
    if (tableRect.left < mousePos.x && mousePos.x < tableRect.right &&
        tableRect.top < mousePos.y && mousePos.y < tableRect.bottom) {
      return true;
    } else {
      return false;
    }
  }
  const placeToTable = (cardID) => {
    // add card from hand to table
    setTable(prevTable => {
      const newTable = [...prevTable];
      newTable[newTable.length - 1].push(cardID);
      return newTable;
    });
    // remove card from hand
    setHand(prevHand => {
      let newHand = [...prevHand];
      newHand = newHand.filter(card => card !== cardID);
      return newHand;
    });
  }
  const takeFromTable = (cardID) => {
    // remove card from table
    setTable(prevTable => {
      const newTable = [...prevTable];
      newTable[newTable.length - 1] = newTable[newTable.length - 1].filter(card => card !== cardID);
      return newTable;
    });
    // add card to hand
    setHand(prevHand => {
      const newHand = [...prevHand];
      newHand.push(cardID);
      return newHand;
    });
  }
  const moveCard = (cardID, destination) => {
    setHand(prevHand => {
      let newHand = [...prevHand];
      newHand = newHand.filter(card => card !== cardID);
      destination === 'F' ? newHand.push(cardID) : newHand.unshift(cardID);
      return newHand;
    });
  }

  return (
    <div>
      <div className="table column" ref={tableRef}>
        {table.map((row, i) => (
          <div key={`tr${i}`} className="hand">
            {row.map((card, i) => (
              <Draggable
                key={`td${card}`}
                onStop={(e, dragData) => placeCard(e, dragData)}
                position={{x: 0, y: 0}}
              >
                <div
                  className="card"
                  id={card}
                  origin="table"
                  style={{backgroundImage: `url(${cards[card]})`}}
                />
              </Draggable>
            ))}
          </div>
        ))}
        {table[table.length-1].length > 0 && <button><span>Play</span></button>}
      </div>
      <div className="hand">
        {hand.map(card => (
          <Draggable
            key={`d${card}`}
            onStop={(e, dragData) => placeCard(e, dragData)}
            position={{x: 0, y: 0}}
          >
            <div
              className="card"
              id={card}
              origin="hand"
              style={{backgroundImage: `url(${cards[card]})`}}
            />
          </Draggable>
        ))}
      </div>
    </div>
  )
}