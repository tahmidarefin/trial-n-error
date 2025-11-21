import { useEffect } from 'react';

export default function Modal({ children, callbackVisible }) {
    useEffect(() => {
        document.body.style.pointerEvents = "none";
        document.querySelector('.modal').style.pointerEvents = "auto";
    }, []);
    return (
        <>
            <div className="modal-overlay">
                <div className="modal">
                    <svg onClick={() => {callbackVisible(""); document.body.style.pointerEvents = "initial";}} xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="black" viewBox="0 0 16 16" stroke="currentColor">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
                    </svg>
                    {children}
                </div>
            </div>
        </>
    );
}