import { useState, useContext } from 'react'
import { UserContext } from './AuthProvider.jsx';

export default function LoginComp() {
  const [message, setMessage] = useState(null);
  const {setUser} = useContext(UserContext);

  const getToken = (obj) => {
    (async () => {
      const response = await fetch("http://localhost:8000/auth/token", {
        method: "POST",
        body: obj
      });
      const _data = await response.json();
      if(_data.hasOwnProperty('detail')) {
        setMessage(_data["detail"]);
      } else {
        localStorage.setItem("access", _data.access_token);
        await (async () => {
          const _response = await fetch("http://localhost:8000/auth/user/me", {
              headers: {
                "Authorization": `Bearer ${_data.access_token}`
              }
          });
          const _data_ = await _response.json();
          if(_data_.hasOwnProperty('id')) {
            setUser(_data_);
            document.body.style.pointerEvents = "initial";
          } else {
            setMessage(_data_["detail"]);
          }
        })();
      }
    })();
  };

  const activateUser = () => {
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/user/activate`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
          },
      });
      const _data = await response.json();
      console.log(_data);
    })();
  }

  const handleLogin = (e) => {
      e.preventDefault();
      const _data = new FormData(e.target);
      getToken(_data);
  };

  return (<>
    <div>
      <form onSubmit={(e) => handleLogin(e)} action="POST">
          <input name="username" type="email" placeholder="tahmid@xyz.com"></input>
          <input name="password" type="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;"></input>
          <button>Login</button>
      </form>
      {/* <p onClick={() => callbackVisible("reset")}>Forgot your password? <b>Reset</b></p> */}
      <span>{message}</span><br/>
      {message === "Inactive User" && <span className={"activate-user"} onClick={activateUser}>Activate Account</span>}
      <p>New here? <b onClick={() => callbackVisible("register")}>Register</b></p>
    </div>
    </>);
}