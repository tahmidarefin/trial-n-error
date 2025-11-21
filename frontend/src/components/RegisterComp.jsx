import { useState } from 'react';

export default function RegiterComp() {
  const ENDPOINT_URL = "http://localhost:8000/users";
  const [message, setMessage] = useState("");
  
  const handleRegister = (e) => {
    e.preventDefault();
    const _data = new FormData(e.target);
    const {full_name, email, password} = Object.fromEntries(_data.entries());
    const obj = {"full_name": full_name, "email": email, "password": password};
    (async () => {
      const response = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(obj)
      });
      const data = await response.json();
      console.log(data);
      if(data.hasOwnProperty('detail')) {
        setMessage(data.detail);
      }
    })();
  };
  
  return (
    <>
      <div>
        <form onSubmit={(e) => handleRegister(e)} action="POST">
          <input name="full_name" type="text" placeholder="Md Tahmid"></input>
          <input name="email" type="email" placeholder="tahmid@xyz.com"></input>
          <input name="password" type="password" placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;"></input>
          <button>Sign Up</button>
        </form>
        <span>{message}</span>
      </div>
    </>
  );
}