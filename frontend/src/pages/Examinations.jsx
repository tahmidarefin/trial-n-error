import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ExamTimer from '../components/ExamTimer.jsx';
import NavComp from '../components/NavComp.jsx';
import Modal from '../components/Modal.jsx';

export default function Examinations() {
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(null);
  const { id, user_id } = useParams();

  const getData = () => {
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/exams/${id}${user_id ? "/users/" + user_id : ""}`, {
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
  }, [user_id]);

  return (<>
    {data && <>
      <div className="exam-info">
      {modalVisible ? <Modal callbackVisible={() => setModalVisible}>
        <h2>{data.title}</h2>
        <div className="exam-update">
          <span>{data.questions.length} Questions</span>
          <span>{data.duration} Minutes</span>
          <span>{data.total_marks} Marks</span>
        </div>
        <button>Enter</button>
      </Modal> : <>
      <h2>{data.title}</h2>
        <div className="exam-update">
          <span>{data.questions.length} Questions</span>
          <span>{data.duration} Minutes</span>
          <span>{data.total_marks} Marks</span>
        </div>
      </>}
      
      {data.hasOwnProperty('expires') && <ExamTimer expires={data.expires} />}
      </div>
      <NavComp exam={data} />
    </>}
  </>);
}
