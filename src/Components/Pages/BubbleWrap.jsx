import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { HOST } from '../../config';
import './BubbleWrap.css';

let socket;

export default function BubbleWrap() {
  const [wrapRoll, setWrapRoll] = useState([]);

  useEffect(() => {
    socket = io(HOST, { query: {id: 'BubbleWrap'}, withCredentials: true });
    
    socket.on('newState', (updatedRoll) => {
      setWrapRoll(updatedRoll);
    });

    return () => {
      socket.disconnect();
    }
  }, []);

  return (
    <div className="page-container">
      <table id="tableRoll">
        <tbody>
          {wrapRoll.map((arr, i) => (
            <tr key={`trB${i}`}>
              {arr.map((bool, j) => (
                <Bubble
                  key={`B${i}-${j}`}
                  bool={bool}
                  i={i}
                  j={j}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Bubble({ bool, i , j }) {
  const pop = (i, j) => {
    socket.emit('pop', { x: j, y: i });
  };

  return (
    <td
      className="bubble"
    >
      <img
        className={bool ? "rem" : "ram"}
        onClick={() => {pop(i, j)}}
      />
    </td>
  )
}