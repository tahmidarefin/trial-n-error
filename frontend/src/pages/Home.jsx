import { useContext } from "react";
import NavComp from '../components/NavComp.jsx'
import Hero from '../components/Hero.jsx'
import { UserContext } from '../components/AuthProvider.jsx'

export default function Home() {
  const { user } = useContext(UserContext);
  return (<>
    {user  ? <NavComp /> :
    <Hero /> }
  </>);
}