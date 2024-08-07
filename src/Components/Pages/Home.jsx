import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './Home.css';

export default function Home() {
  const {auth, setAuth} = useContext(AuthContext);

  const fileExt = auth.avatar?.startsWith('a_') ? 'gif' : 'webp';

  return(
    <div className="page-container active" id="containerHome">
      <div className="profile-card">
        <span
          className="profile-avatar"
          style={{backgroundImage: `url(https://cdn.discordapp.com/avatars/${auth.id}/${auth.avatar}.${fileExt})`}}
        />
      </div>
    </div>
  )
}