import { useState, useEffect } from 'react';

export default function Result({ result }) {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    setData(result);
  }, []);
  
  return (<>
  <h2>Obtained Marks is: {data}</h2>
  </>);
}