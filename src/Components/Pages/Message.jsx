import { HOST } from '../../config';
import { useState, useRef, useEffect } from 'react';
import io from 'socket.io-client';
import api from '../../api';
import './Message.css';

let socket;
let remAvatarURL;

export default function Message() {
  const [selectedChat, setSelectedChat] = useState('');
  const [messageHistory, setMessageHistory] = useState([]);

  return (
    <div className="page-container">
      <ChatSelect
        selectedChat={ selectedChat }
        setSelectedChat={ setSelectedChat }
        setMessageHistory={ setMessageHistory }
      />
      <span className="chat-message">
        {selectedChat && (<Chat 
          selectedChat={ selectedChat }
          messageHistory={ messageHistory }
          setMessageHistory={ setMessageHistory }
        />)}
      </span>
    </div>
  )
}

function ChatSelect({ selectedChat, setSelectedChat, setMessageHistory }) {
  const [members, setMembers] = useState([]);
  const [channels, setChannels] = useState([]);

  // populate chat select with server members and text channels
  useEffect(() => {
    setupChatSelect();
  }, []);

  const setupChatSelect = async () => {
    const mBody = await api('GET', 'serverMembers');
    const cBody = await api('GET', 'textChannels');
    if (mBody && cBody) {
      setMembers(mBody.members);
      setChannels(cBody);
      remAvatarURL = mBody.remAvatarURL;
    }
  }

  const selectChat = async (id) => {
    // update selected chat name
    setSelectedChat(id);

    // load chat messages
    const resBody = await api('POST', 'messageHistory', { id: id });
    const messageHistory = resBody ?? [];
    setMessageHistory(messageHistory);
  }

  return (
    <span className="chat-select">
      <input type="checkbox" id="toggleSelect"/>
      <label htmlFor="toggleSelect">
        <span/>
      </label>
      <div>
        <ul>
          {members.map((member, i) => (
            <li
              key={`mc${i}`}
              className={member.userId === selectedChat ? "selected" : ""}
              onClick={() => selectChat(member.userId)}
            >
              <span style={{backgroundImage: `url(${member.displayAvatarURL})`}}/>
              <p>{member.displayName}</p>
            </li>
          ))}
        </ul>
        <ul>
          {channels.map((channel, i) => (
            <li
              key={`cc${i}`}
              className={channel.id === selectedChat ? "selected" : ""}
              onClick={() => selectChat(channel.id)}
            >
              <p>{channel.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </span>
  )
}

function Chat({ selectedChat, messageHistory, setMessageHistory }) {
  const [message, setMessage] = useState('');
  const inputMessage = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      socket = io(HOST, { query: { id: selectedChat }, withCredentials: true });
      socket.on('dcMsg', (msg) => {
        setMessageHistory((prevHistory) => {
          const newHistory = [...prevHistory];
          newHistory.unshift({
            rem: false,
            avatarURL: msg.avatarURL,
            content: msg.content
          });
          return newHistory;
        });
      });
  
      return () => {
        socket.disconnect();
      }
    }
  }, [selectedChat]);

  const sendMessage = () => {
    // send message to server
    socket.emit('remMsg', { id: selectedChat, content: message });
    // update chat log
    setMessageHistory((prevHistory) => {
      const newHistory = [...prevHistory];
      newHistory.unshift({
        rem: true,
        avatarURL: remAvatarURL,
        content: message
      });
      return newHistory;
    });
    // reset
    setMessage('');
    inputMessage.current.focus();
  };

  return (
    <>
      <input
        placeholder="Message"
        size="100"
        autoComplete="off"
        value={message}
        ref={inputMessage}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => { if (e.key === 'Enter') sendMessage() }}
      />
      {messageHistory.map((message, i) => (
        <div key={`mh${i}`}>
          <span
            className={message.rem ? 'right' : 'left'}
            style={{backgroundImage: `url(${message.avatarURL})`}}
          />
          <p className={message.rem ? 'right' : 'left'}>{message.content}</p>
        </div>
      ))}
    </>
  )
}