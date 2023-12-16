import { HOST } from '../config';
import { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Link
} from "react-router-dom";
import PageHome from './Home'
import PagePalia from './Palia'
import PageMessage from './Message'
import api from '../api';
import '../CSS/loginLHN.css'

export default function LoginLHN() {
	const [input, setInput] = useState();
	const [reqType, setReqType] = useState('N');
	const [loggedIn, setLoggedIn] = useState(false);
	const [avatarURL, setAvatarURL] = useState('');

	// login if there is a sessionID cookie
	useEffect(() => {
    (async () => {
			const resBody = await api('POST', 'login', { reqType: 'S' });
      // const res = await fetch(`${HOST}/login`, {
      //   method: 'POST',
      //   headers: {
      //     "Content-Type": "application/json",
      //     "Accept": "application/json"
      //   },
      //   body: JSON.stringify({
      //     reqType: 'S'
      //   })
      // });
      // if (res.ok) {
      //   setLoggedIn(true);
      //   // delay a bit to avoid awkward instant login
      //   const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      //   await delay(1000);
			// }
      // else return;

			setAvatarURL(resBody.avatarURL);
      // hide login screen
      document.querySelector('div.left-login').setAttribute('class', 'lhn');
      document.querySelector('div.right-login').classList.add('auth');
      resetLogin();
    })();
	}, []);
	
	// login
	function resetLogin() {
		setInput('');
		setReqType('N');
		document.querySelector('div.right-login p').setAttribute('class', '');
		document.querySelector('div.right-login input').setAttribute('placeholder', 'DC Nickname');
	}

	async function login() {
		const res = await fetch(`${HOST}/login`, {
			method: 'POST',
			credentials: 'include',
			headers: {
				"Content-Type": "application/json",
				"Accept": "application/json"
			},
			body: JSON.stringify({
				reqType: reqType,
				input: input
			})
		});

		// default class and reflow for error animation
		document.querySelector('div.right-login p').setAttribute('class', '');
		document.querySelector('div.right-login p').offsetWidth;

		// status handling
		switch (res.status) {
			case 200:	// log in
				setLoggedIn(true);
				const resBody = await res.json();
				document.querySelector('span.profile-avatar').style.backgroundImage = `url(${resBody.avatarURL})`;
				// hide login screen
				document.querySelector('div.left-login').setAttribute('class', 'lhn');
				document.querySelector('div.right-login').classList.add('auth');
				resetLogin();
				break;
			case 202:	// valid nickname
				setReqType('C');
				document.querySelector('div.right-login input').setAttribute('placeholder', '6-Digit Pin');
				break;
			case 401:	// invalid pin
				document.querySelector('div.right-login p').innerText = 'Incorrect pin';
				document.querySelector('div.right-login p').setAttribute('class', 'error');
				break;
			case 404: // invalid nickname
				document.querySelector('div.right-login p').innerText = 'Nickname not found';
				document.querySelector('div.right-login p').setAttribute('class', 'error');
				break;
			default:
				break;
		}

		setInput('');
	}
	// login end

	// lhn
	function toggleLHN() {
		document.querySelector('div.lhn').classList.toggle('active');
		document.querySelector('button.nav-button').classList.toggle('active');
	}

	function selectTab(event) {
		// unselect previous tab
		document.querySelector('div.lhn ul li.selected').classList.toggle('selected');
		// select new tab
		event.target.classList.toggle('selected');

		// hide previous page
		document.querySelector('div.page-container.active')?.classList.toggle('active');
		// display selected page
		document.getElementById(`container${event.target.innerHTML}`)?.classList.toggle('active');

		// close lhn
		document.querySelector('button.nav-button').click();
	}

	async function logout() {
		const res = await fetch('/logout', { method: 'POST' });
		// default home tab
		document.querySelector('div.lhn ul li:first-child').click();
		// clear profile
		document.querySelector('span.profile-avatar').style.backgroundImage = '';
		// show login screen
		document.querySelector('div.lhn').setAttribute('class', 'left-login');
		document.querySelector('div.right-login').classList.remove('auth');
		
		if (res.status === 200) {
			setLoggedIn(false);
		}
	}

	function renderTab(label, firstTab) {
		return (
			// <li className={`${firstTab ? 'selected' : ''}`}>
			<li>
				<a href={`${label.toLowerCase()}`}>{label}</a>
			</li>
		)
	}
	// lhn end

	return (
		<>
			<button className="nav-button" onClick={toggleLHN}>
				<span/>
			</button>
			{/* <div className="left-login lhn"> */}
			<nav className="left-login lhn">
				<ul className="nav-list">
					{renderTab('Home', true)}
					{renderTab('Palia')}
					{renderTab('Message')}
					<li onClick={logout}>Logout</li>
				</ul>
			</nav>
			{/* </div> */}
			<div className="right-login auth">
				<span/>
				<div className="login-body">
					<p>Message</p>
					<input
						value={input}
						placeholder='DC Nickname'
						onChange={e => setInput(e.target.value)}
						onKeyDown={e => { if (e.key === 'Enter') login() }}
					/>
					<div>
						<button onClick={resetLogin}><span>Reset</span></button>
						<button onClick={login}><span>Login</span></button>
					</div>
				</div>
				{/* <button onClick={() => {location.href='/portfolio'}}>Portfolio</button> */}
				<p>レム</p>
			</div>
			<Routes>
				<Route path='/home'>
					<PageHome avatarURL={ avatarURL }/>
				</Route>
				<Route path='/palia'>
					<PagePalia/>
				</Route>
				<Route path='/message'>
					<PageMessage/>
				</Route>
			</Routes>
			{/* {loggedIn && (
			)} */}
		</>
	)
}