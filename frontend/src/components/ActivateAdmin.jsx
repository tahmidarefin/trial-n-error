import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';

export default function ActivateAdmin() {
  const [modalVisible, setModalVisible] = useState(null);

  useEffect(() => {
    setModalVisible("admin");
  }, []);

  const makeAdmin = (e) => {
    e.preventDefault();
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/activate/admin`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
          },
      });
      const _data = await response.json();
      console.log(_data);
    })();
  }

  return (<>
  {modalVisible === "admin" && <Modal callbackVisible={setModalVisible}>
    <div><button onClick={makeAdmin}>Make Me Admin</button></div>
  </Modal>}
  </>);
}