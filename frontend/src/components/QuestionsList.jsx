import { useState, useEffect, useRef } from 'react'
import SingleChoice from './SingleChoice.jsx'
import MultiChoice from './MultiChoice.jsx'
import TextSubmit from './TextSubmit.jsx'
import ImageUpload from './ImageUpload.jsx'
import ExamForm from './ExamForm.jsx'

export default function QuestionsList({ questions, valid, modeProp, exam_id, user_id, ans_state }) {
  const STATIC_STORAGE_URL = "http://localhost:8000/static"
  const [data, setData] = useState(null);
  const [formVisible, setFormVisible] = useState(null);
  const [mode, setMode] = useState(null);
  const [answers, setAnswers] = useState(null);
  const formRef = useRef(null);
  let examList = [];

  const getAllData = () => {
    (async () => {
      const response = await fetch('http://localhost:8000/questions');
      const _data = await response.json();
      if(_data.hasOwnProperty('questions')) {
        setData(_data.questions);
      }
    })();
  }

  const selectQuestion = (e, value) => {
    e.preventDefault();
    if(value.hasOwnProperty("id")) {
      examList.push(value);
      e.currentTarget.style.display = 'none';
    }
  };

  const deleteQuestion = (e, idValue) => {
    e.preventDefault();
    (async () => {
      const response = await fetch(`http://localhost:8000/questions/${idValue}`, {
        method: "DELETE",
      });
      const _data = await response.json();
      getAllData();
    })();
  }

  const addQuestions = (e) => {
    e.preventDefault();
    (async () => {
      const response = await fetch('http://localhost:8000/questions', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
      });
      const _data = await response.json();
    })();
    getAllData();
  };

  const previewExam = (e) => {
    e.preventDefault();
    if(examList.length > 0) {
      setMode("select");
      setData(examList);
    }
  }

  const collectAnswers = (e) => {
    let ans_list = [...answers];
    const [id, type] = e.target.name.split('_');
    const value = e.target.value;
    const ans_id = ans_list.findIndex(ans => ans["question_id"] === id);

    if(type === "0") {
      ans_list[ans_id]["answer"] = value;
    } else if(type === "-1") {
      ans_list[ans_id]["answer"] = value;
    } else if(type >= "1" && type <= "4") {
      if(e.target.checked === false) {
        const str = ans_list[ans_id]["answer"];
        ans_list[ans_id]["answer"] = str.split(', ').filter(item => item !== value).join(', ');
      } else {
        if(ans_list[ans_id]["answer"] !== "") {
          ans_list[ans_id]["answer"] += ', ';
        }
        ans_list[ans_id]["answer"] += value;
      }
    } else {
      ans_list[ans_id]["answer"] = `${STATIC_STORAGE_URL}/img/${ans_list[ans_id]["user_id"]}_${ans_list[ans_id]["examination_id"]}_${ans_list[ans_id]["question_id"]}.jpg`;
    }
    setAnswers([...ans_list]);
  }

  const handleAnsSubmit = (e) => {
    e.preventDefault();
    (async () => {
      const response = await fetch('http://localhost:8000/answers', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(answers)
      });
      const _data = await response.json();
    })();
  }

  useEffect(() => {
    setMode(modeProp);
    if(modeProp === "view") {
      getAllData();
    } else if(modeProp === "exam") {
      const obj = {"user_id": user_id, "examination_id": exam_id}
      let answerObjs = [];
      if(ans_state) {
        ans_state.forEach((value, index) => {
          const type = questions[index].type;
          let ans = value;
          if(ans !== '') {
            if(type === 'single_choice' || type === 'multi_choice') {
              ans = value.split(', ');
            }
            questions[index]["correct_answers"] = ans;
          }
          answerObjs.push({...obj, "question_id": questions[index].id, "answer": value});
        });
      } else {
        for(const value of questions) {
          answerObjs.push({...obj, "question_id": value.id, "answer": ""});
        }
      }
      setData(questions);
      setAnswers(answerObjs);
    } else {
      setData(questions);
    }
  }, []);

  setInterval(() => {
    if(modeProp !== "exam" || !answers || !ans_state) {
      return;
    }
    let states = [];
    states = ans_state
    answers.forEach((value, index) => {
      states[index] = value["answer"];
    });
    const stateObj = {"ans_state": states};
    const access = localStorage.getItem('access');
    (async () => {
      const response = await fetch(`http://localhost:8000/exams/${exam_id}/temp`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`
          },
          body: JSON.stringify(stateObj)
      });
      const _data = await response.json();
    })();

  }, 10000);

  return (
    <>
      <div>
        {data &&
        <form onChange={collectAnswers} ref={formRef} onSubmit={handleAnsSubmit}>
          {data.map((value, index) => {
            const type = value["type"];
            if(type === 'text') {
              return (<div className="question-list" key={index}>
              {mode === "view" && <div className="question-op">
                  <button onClick={(e) => selectQuestion(e, value)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
              </button>
              <button onClick={(e) => deleteQuestion(e, value.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              </div>}
              <div className="question">
                <p className="title">{value["title"]}</p>
                <div className="info">
                    {value.hasOwnProperty("complexity") && <span>Class {value["complexity"]}</span>}
                    <span>Short Answer</span>
                    <span>Score: {value["max_score"]}</span> 
                </div>
                <TextSubmit displayMode={true} item={value} id={index} value={!value.hasOwnProperty('correct_answers') || Array.isArray(value["correct_answers"]) ? "" : value["correct_answers"]}/>
              </div>
              </div>);
            } else if(type === 'image_upload') {
              return (<div className="question-list" key={index}>
              {mode === "view" && <div className="question-op">
                  <button onClick={(e) => selectQuestion(e, value)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
              </button>
              <button onClick={(e) => deleteQuestion(e, value.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              </div>}
              <div className="question">
                <p className="title">{value["title"]}</p>
                <div className="info">
                    {value.hasOwnProperty("complexity") && <span>Class {value["complexity"]}</span>}
                    <span>Long Answer</span>
                    <span>Score: {value["max_score"]}</span> 
                </div>
                <ImageUpload displayMode={true} item={value} id={index} exam_id={exam_id}/>
              </div>
              </div>);
            } else if(type === 'single_choice') {
              return (<div className="question-list" key={index}>
              {mode === "view" && <div className="question-op">
                  <button onClick={(e) => selectQuestion(e, value)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
              </button>
              <button onClick={(e) => deleteQuestion(e, value.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              </div>}
              <div className="question">
                <p className="title">{value["title"]}</p>
                <div className="info">
                    {value.hasOwnProperty("complexity") && <span>Class {value["complexity"]}</span>}
                    <span>Single Correct</span>
                    <span>Score: {value["max_score"]}</span> 
                </div>
                <SingleChoice displayMode={true} item={value} id={index} />
              </div>
              </div>);
            } else {
              return (<div className="question-list" key={index}>
              {mode === "view" && <div className="question-op">
                  <button onClick={(e) => selectQuestion(e, value)} type="button">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
              </button>
              <button onClick={(e) => deleteQuestion(e, value.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" >
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                </svg>
              </button>
              </div>}
              <div className="question">
                <p className="title">{value["title"]}</p>
                <div className="info">
                    {value.hasOwnProperty("complexity") && <span>Class {value["complexity"]}</span>}
                    <span>Multiple Correct</span>
                    <span>Score: {value["max_score"]}</span> 
                </div>
                <MultiChoice displayMode={true} item={value} id={index} />
              </div>
              </div>);
            }
          })}
          {mode === "parse" && valid === true && <button type="submit" onClick={addQuestions}>Save</button>}
          {mode === "parse" && <button type="button" onClick={() => {setMode("parse"); setData(null);}}>Cancel</button>}
          {mode === "view" && <button type="button" onClick={previewExam}>Preview</button>}
          {mode === "select" && <button type="button" onClick={() => setFormVisible("view")}>Create</button>}
          {mode === "exam" && ans_state && <button type="submit">Submit</button>}
          {mode === "select" && <button type="button" onClick={() => {setMode("view"); setFormVisible(""); getAllData();}}>Cancel</button>}
        </form>}
        {formVisible === "view" && <ExamForm exams={data} />}
      </div>
    </>
  )
}
