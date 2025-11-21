import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ExamTimer({ expires }) {
  const [remaining, setRemaining] = useState(null);
  const Navigate = useNavigate();
  const formatDuration = (sec) => {
    let str = "";
    str += (sec % 60).toString().padStart(2, '0');
    sec = Math.floor(sec / 60);
    str = (sec % 60).toString().padStart(2, '0') + ':' + str;
    sec = Math.floor(sec / 60);
    str = (sec % 60).toString().padStart(2, '0') + ':' + str;
    return str;
  };

  useEffect(() => {
    if(!remaining) {
      const seconds = Math.floor((new Date(expires) - new Date()) / 1000);
      setRemaining(formatDuration(seconds));
    }
    if(remaining === 0) {
      Navigate('/');
    }
  }, [remaining]);

  setInterval(() => {
    const seconds = (expires ? Math.floor(Math.max(0, new Date(expires) - new Date()) / 1000) : 0);
    setRemaining(formatDuration(seconds));
  }, 1000)
  return (<>
  <h3>{remaining}</h3>
  </>)
}