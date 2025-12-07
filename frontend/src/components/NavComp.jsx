import { useLocation } from 'react-router-dom'
import '../App.css'
import HomeNav from './HomeNav.jsx'
import ExamNav from './ExamNav.jsx'

export default function NavComp({ exam }) {
  const location = useLocation();

  return (
    <>{ location.pathname.includes('examinations') ? 
      <ExamNav exam={exam} /> :
      <HomeNav /> }
    </>
  )
}
