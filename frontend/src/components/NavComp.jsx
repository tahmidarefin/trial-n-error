import { useState, useContext } from 'react'
import '../App.css'
import ImportPreview from './ImportPreview.jsx'
import QuestionsList from './QuestionsList.jsx'
import { UserContext } from './AuthProvider.jsx';
import ExamsList from './ExamsList.jsx'
import UserComp from './UserComp.jsx'
import LoginComp from './LoginComp.jsx'

export default function NavComp() {
  const [mode, setMode] = useState("");
  const {user} = useContext(UserContext);

  const switchTab = (mode) => {
    setMode(mode);
  };

  return (
    <>{ user && 
    <nav className="nav-bar">
      {user.admin && <span onClick={() => switchTab("parse")} className={mode === "parse" ? "active-nav-tab" : ""}>Import</span>}
      {user.admin && <span onClick={() => switchTab("list")} className={mode === "list" ? "active-nav-tab" : ""}>Questions</span>}
      <span onClick={() => switchTab("exam")} className={mode === "exam" ? "active-nav-tab" : ""}>Examinations</span>
      {!user.admin && <span onClick={() => switchTab("current_exam")} className={mode === "current_exam" ? "active-nav-tab" : ""}>Ongoing</span>}
    </nav> }
    { mode === "parse" && <ImportPreview /> }
    { mode === "list" && <QuestionsList modeProp={"view"} /> }
    { mode.includes("exam") && <ExamsList examMode={mode === "exam" ? "" : "running"}/> }
    </>
  )
}
