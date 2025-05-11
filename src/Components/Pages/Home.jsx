import { useContext } from 'react';
import { AuthContext } from '../../AuthContext';
import './Home.css';

export default function Home() {
  const {auth, setAuth} = useContext(AuthContext);

  const fileExt = auth.avatar?.startsWith('a_') ? 'gif' : 'webp';
  const globalName = auth.global_name;

  return(
    <div className="page-container active" id="containerHome">
      <div
        className="profile-card"
        style={{backgroundImage: `url(https://cdn.discordapp.com/banners/${auth.id}/${auth.banner}.png?size=4096)`}}
      >
        <span
          className="profile-avatar"
          style={{backgroundImage: `url(https://cdn.discordapp.com/avatars/${auth.id}/${auth.avatar}.${fileExt})`}}
        />
        <div>
          <h1>{globalName}</h1>
        </div>
      </div>
    </div>
  )
}