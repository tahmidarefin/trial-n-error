import { useState, useEffect, useContext } from "react";
import { UserContext } from './AuthProvider.jsx'
import Modal from './Modal.jsx'

export default function ExamForm({ exams }) {
  const [formVisible, setFormVisible] = useState(null);
  const { user } = useContext(UserContext);

  const handleSubmit = (e) => {
    e.preventDefault();
    const exam = new FormData(e.target);
    const {title, duration} = Object.fromEntries(exam.entries());
    const obj = {
      "title": title,
      "duration": duration,
      "exam_ques": exams.map(value => value.id),
    }
    console.log(obj);
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch('http://localhost:8000/exams', {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${access}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(obj)
      });
      const _data = await response.json();
      console.log(_data);
    })();
  };

  useEffect(() => {
    setFormVisible("view");
  }, []);

  return (<>
    {formVisible === "view" && <Modal callbackVisible={setFormVisible}>
      <form onSubmit={handleSubmit}>
        <label>Examination Name</label>
        <input type="text" name="title" />
        <label>Duration</label>
        <input type="number" name="duration" />
        <button>Save</button>
      </form>
    </Modal>}
    </>);
}
