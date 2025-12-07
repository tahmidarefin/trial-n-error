import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from "react-router-dom";
import { UserContext } from './AuthProvider.jsx';
import LoginComp from "./LoginComp.jsx"
import RegisterComp from "./RegisterComp.jsx"
import Modal from "./Modal.jsx"

export default function UserComp() {
  const {user, setUser} = useContext(UserContext);
  const [active, setActive] = useState(false);
  const [modalVisible, setModalVisible] = useState("");
  const Navigate = useNavigate();
  const logOut = () => {
    try {
      localStorage.removeItem('access');
    } finally {
      setUser(null);
      setModalVisible("");
      setActive(state => !state);
      Navigate('/');
    }
  };

  const expandUser = () => {
    setActive(state => !state);
  };

  useEffect(() => {
    document.body.style.pointerEvents = "initial";
  }, []);

  return (<>
  <span onClick={expandUser} className={`user-logo ${active ? "user-logo-active" : ""}`}>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    </svg>
  </span>
  {active && <div className="user-menu">
    {user ? <>
      <span>{user.full_name}</span> <br />
      <span>{user.email}</span> <br />
      <span><Link to={'privilege/admin'}>Admin</Link></span> <br />
      <span className="hover-bar" onClick={logOut}>Logout</span></> : <>
        <span className="hover-bar" onClick={() => {setActive(state => !state); setModalVisible("login")}}>Login</span> &nbsp;
        <span className="hover-bar" onClick={() => {setActive(state => !state); setModalVisible("register")}}>Register</span>
      </>}
  </div>}
  {modalVisible && !user &&
  (modalVisible === "login" ? 
  <Modal callbackVisible={setModalVisible}>
    <LoginComp />
  </Modal> :
  <Modal callbackVisible={setModalVisible}>
    <RegisterComp />
  </Modal>)}
    </>);
}