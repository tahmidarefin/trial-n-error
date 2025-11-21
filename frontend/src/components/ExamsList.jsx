import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function ExamList({ examMode }) {
  const [data, setData] = useState(null);

  const getAllData = () => {
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000${examMode ? '/' + examMode + '/' : "/"}exams`, {
        headers: {
          "Authorization": `Bearer ${access}`,
        }
      });
      const _data = await response.json();
      if(_data) {
        setData(_data);
      }
    })();
  }

  useEffect(() => {
    getAllData();
  }, []);

  return (
    <>
      <div>
        { data && data.map((value, index) => {
          return (<Link key={index} to={`/examinations/${value.id}`}>
            <li>
              {value.title} - {value.duration} Minutes
            </li>
          </Link>);
        }) }
      </div>
    </>
  )
}
