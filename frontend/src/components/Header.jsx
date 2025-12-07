import UserComp from './UserComp.jsx'
import { Link } from 'react-router-dom'

export default function Header() {

  return (
    <>
      <div className="header">
        <h1><Link to={'/'}>TrialNError</Link></h1>
        <UserComp />
      </div>
    </>
  )
}
