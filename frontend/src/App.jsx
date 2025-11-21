import { Routes, Route} from 'react-router'
import './App.css'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Examinations from './pages/Examinations.jsx'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from "./pages/Home";


export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<Home />}></Route>
        <Route path='/examinations/:id' element={<ProtectedRoute>
            <Examinations />
          </ProtectedRoute>}>
        </Route>
      </Routes>
      <Footer />
    </>
  )
}

