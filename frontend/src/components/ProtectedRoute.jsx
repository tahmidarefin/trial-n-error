import { useContext, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { UserContext } from './AuthProvider.jsx'

export default function ProtectedRoute({ children }) {
    const {user} = useContext(UserContext);
    const Navigate = useNavigate();

    useEffect(() => {
        if(!user) {
            Navigate('/');
        }
    }, []);

    return (
        <>
            {user && children }
        </>
    );
}