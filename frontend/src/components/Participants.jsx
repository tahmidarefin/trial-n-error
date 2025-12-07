import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Participants({ exam_id }) {
  const [data, setData] = useState(null);

  const getData = () => {
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/exams/${exam_id}/users`, {
        headers: {
          "Authorization": `Bearer ${access}`,
          "Content-Type": "application/json"
        }
      });
      const _data = await response.json();
      if(_data) {
        setData(_data);
      }
    })()
  }

  useEffect(() => {
    getData();
  }, []);

  return (<>
  {data && data.map((value, index) => (<Link to={`/examinations/${exam_id}/${value.id}`} key={index}>{value.full_name}<br/></Link>))}
  </>)
}