import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../AuthContext';
import './navbar.css';
import { VscHome, VscComment } from 'react-icons/vsc';
import { GiCardAceHearts, GiBubbles } from "react-icons/gi";
import { IoIosLogOut } from "react-icons/io";
import api from '../../api';

export default function NavBar() {
  const navigate = useNavigate();
  const {auth, setAuth} = useContext(AuthContext);

  const logout = async () => {
    const resBody = await api('POST', 'logout');

    if (resBody) {
      setAuth(false);
      navigate('/login');
    } else {
      console.log('Session was not found on the server');
    }
  }

  return (
    <div className="navbar">
      <VscHome onClick={() => {navigate(`/home`)}}/>
      {auth && <GiCardAceHearts onClick={() => {navigate(`/cards`)}}/>}
      <GiBubbles onClick={() => {navigate(`/bubblewrap`)}}/>
      {auth.admin && <VscComment onClick={() => {navigate(`/message`)}}/>}
      <IoIosLogOut onClick={logout}/>
    </div>
  )
}