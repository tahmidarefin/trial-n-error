import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { UserContext } from '../components/AuthProvider.jsx'
import QuestionsList from '../components/QuestionsList.jsx';
import ExamTimer from '../components/ExamTimer.jsx';
import Modal from '../components/Modal.jsx';

export default function Examinations() {
  const [data, setData] = useState(null);
  const [modalVisible, setModalVisible] = useState(null);
  const { id } = useParams();
  const { user } = useContext(UserContext);

  const getData = () => {
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/exams/${id}`, {
        headers: {
          "Authorization": `Bearer ${access}`,
          "Content-Type": "application/json"
        }
      });
      const _data = await response.json();
      console.log(_data);
      if(_data) {
        setData(_data);
      }
    })()
  }

  useEffect(() => {
    getData();
    if(data && data.hasOwnProperty("exam_state")) {
      setModalVisible("exam");
    }
  }, []);

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
      <QuestionsList questions={data.questions} modeProp={"exam"} exam_id={id} user_id={user.id} ans_state={data.exam_state} />
    </>}
  </>);
}