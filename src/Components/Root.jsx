import { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import LHN from './LHN';
import '../App.css';
import api from '../api';

export default function Root() {
  const navigate = useNavigate();
  const {auth, setAuth} = useContext(AuthContext);

  const params = new URLSearchParams(window.location.hash.slice(1));
  let token = params.get("access_token");
  let tokenType = params.get("token_type");

  // get discord user info
  useEffect(() => {
    (async () => {
      try {
        // if no token from query string, check server for an active session
        if (!token) {
          [token, tokenType] = await restoreToken();
        }

        // if no token from server, redirect back to login
        if (!token) {
          navigate('/login');
        }

        // request user information from discord
        const res = await fetch('https://discord.com/api/users/@me', {
          headers: {
            authorization: `${tokenType} ${token}`
          }
        });
      
        // if no information was returned, redirect back to login
        if (!res.ok) {
          navigate('/login');
        }

        // store user information into context
        const dcUserInfo = await res.json();
        dcUserInfo.accessToken = token;
        dcUserInfo.tokenType = tokenType;
        setAuth(dcUserInfo);
      } catch (e) {
        console.error(e);
        // navigate('/login');
      }
    })();
  }, []);

  // once authorized, request session cookies from server
  useEffect(() => {
    if (!auth) return;

    (async () => {
      const resBody = await api('POST', 'login', { user: auth, reqType: 'L' });
      console.log(resBody)
    })();

    // redirect to home (already on the page but this clears the query string)
    navigate('/home');
  }, [auth]);

  return (
    <ProtectedRoute auth={auth}>
      <LHN/>
      <Outlet/>
    </ProtectedRoute>
  )
}

function ProtectedRoute({ auth, children }) {
  return auth ? children : null;
}

//** HELPER FUNCTIONS */

const restoreToken = async () => {
  const resBody = await api('POST', 'login', { reqType: 'R' });
  if (resBody) {
    return [resBody.token, resBody.tokenType];
  }
}

//** END HELPER FUNCTIONS */