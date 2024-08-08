import { useEffect, useContext } from 'react';
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

  // authenticate
  useEffect(() => {
    (async () => {
      let newAuth;
      try {
        // create session if there is a token, otherwise check server for an active session
        newAuth = token ? await requestSession(token, tokenType) : await requestSession();
      } catch (e) {
        console.error(e);
        navigate('/login');
      }

      // set user info (session created/restored)
      if (newAuth) {
        setAuth(newAuth);
        // redirect to home (already on the page but this clears the query string)
        navigate('/home');
      }
      // if no session returned from server, redirect back to login
      else {
        navigate('/login');
      }
    })();
  }, []);

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

// create session if token is provided
// otherwise restore session
async function requestSession(token, tokenType) {
  const resBody = await api('POST', 'login', {
    tokenInfo: [token, tokenType],
    reqType: token ? 'L' : 'R'
  });
  return resBody?.userSess ?? null;
};

//** END HELPER FUNCTIONS */