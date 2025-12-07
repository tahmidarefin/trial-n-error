import { useState } from "react";
import LoginComp from "./LoginComp.jsx";
import Modal from "./Modal.jsx";

export default function Hero() {
  const [modalVisible, setModalVisible] = useState(null);
  return(<>
  <div className="hero">
      <h1>TrialNError</h1>
      <h4>A modern day solution for recruiters and educators.</h4>
      <p>TrialNError is a smart examination management system with effiecient and intuitive interface, and many features. One can organise their exminations or test, whether it's a short-duration or long-duration assement with multiple examination stages. You can see also evaluate result of Multiple Choice Question (MCQ) with predetermined answers. Each participants answers sheet is show individually, for the ease of evaluating result.</p>
      <button onClick={() => setModalVisible("login")}>Login</button>
  </div>
  {modalVisible && 
    <Modal callbackVisible={setModalVisible}>
        <LoginComp/>
    </Modal>}
  </>);
}