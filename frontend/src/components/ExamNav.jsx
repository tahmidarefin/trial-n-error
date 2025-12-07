import { useState, useEffect, useContext } from 'react'
import '../App.css'
import { UserContext } from './AuthProvider.jsx';
import QuestionsList from './QuestionsList.jsx';
import Result from './Result.jsx';
import Participants from './Participants.jsx';

export default function ExamNav({ exam }) {
  const [mode, setMode] = useState(null);
  const [data, setData] = useState(null);
  const {user} = useContext(UserContext);

  const switchTab = (mode) => {
    setMode(mode);
  };

  useEffect(() => {
    setData(exam);
    setMode("exam");
  }, [JSON.stringify(exam)]);

  return (
    <>
    <nav className="nav-bar">
      <span onClick={() => switchTab("exam")} className={mode === "exam" ? "active-nav-tab" : ""}>Questions</span>
      {user.admin && <span onClick={() => switchTab("participants")} className={mode === "participants" ? "active-nav-tab" : ""}>Participants</span>}
      {!user.admin && <span onClick={() => switchTab("result")} className={mode === "result" ? "active-nav-tab" : ""}>Results</span>}
    </nav>{data && <>
    {mode === "exam" && <QuestionsList questions={data.questions} modeProp={"exam"} exam_id={data.id} user_id={user.id} ans_state={data.exam_state} />}
    {mode === "result" && <Result result={data.obtained_marks} />}
    {mode === "participants" && <Participants exam_id={data.id} />}
    </>}
    </>
  )
}
