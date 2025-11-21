import { useState, useEffect } from 'react'
import SingleChoice from './SingleChoice.jsx'
import MultiChoice from './MultiChoice.jsx'
import TextSubmit from './TextSubmit.jsx'
import ImageUpload from './ImageUpload.jsx'
import QuestionsList from './QuestionsList.jsx'

export default function ImportPreview() {
  const [data, setData] = useState([]);
  const [raw, setRaw] = useState([]);
  const [msgInvalid, setMsgInvalid] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if(file) {
      const _file = await file.arrayBuffer();
      const _workbook = XLSX.read(_file);
      const _data = XLSX.utils.sheet_to_json(_workbook.Sheets[_workbook.SheetNames[0]], {header: 1});
      setRaw(_data);
    }
  };

  const showPreview = (e) => {
    e.preventDefault();
    let invalidRows = [], _row = [];
    raw.forEach((value, index) => {
      const [title, complexity, type, options, answers, marks] = value;
        if(index !== 0) {
          if(!title) {
              invalidRows.push(index);
          } else if(typeof complexity !== "number") {
              invalidRows.push(index);
          } else if(!['text', 'image_upload', 'single_choice', 'multi_choice'].includes(type)) {
              invalidRows.push(index);
          } else if(String(answers).split(', ').find((x) => isNaN(+x))) {
              invalidRows.push(index);
          } else if(typeof marks !== 'number') {
              invalidRows.push(index);
          } else {
            try {
              JSON.parse(options);
              const obj = {
                "title": title, 
                "complexity": complexity, 
                "type": type, 
                "options": options, 
                "correct_answers": String(answers).split(', '), 
                "max_score": marks
              }
              _row.push(obj);
            } catch(e) {
              invalidRows.push(index);
            }
          }
        }
      });
      if(invalidRows.length > 0) {
        setMsgInvalid(`Invalid row no - ${String(invalidRows)}`);
      }
      setData(_row);
  }

  const handleSubmit = (e) => {
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
    // const formdata = new FormData(e.target);
    // const _formdata = Object.fromEntries(formdata.entries());
    // let ans = {}, answer = {};
    // for(const [_key, _value] of Object.entries(_formdata)) {
    //   const [id, type] = _key.split(" ");
    //   if(!answer[id]) {
    //     ans = {};
    //   }
    //   if(type === "0") {
    //     ans["type"] = "single_choice";
    //     ans["choice"] = [];
    //     ans["choice"].push(_value);
    //   } else if(type === "-1") {
    //     ans["type"] = "text";
    //     ans['text'] = _value;
    //   } else if(type >= "1" && type <= "4") {
    //     ans["type"] = "multi_choice";
    //     if(!answer[id]) {
    //       ans['choice'] = [];
    //     }
    //     ans["choice"].push(_value);
    //   } else {
    //     ans["type"] = "image";
    //     ans["image_url"] = "url_url";
    //   }
    //   answer[id] = ans;
    // }
    // console.log(answer);
  }

  return (
    <>
      <div>
        <form onSubmit={showPreview}>
          <input type="file" onChange={handleFileChange} accept=".xlsx"></input>
          <button type="submit">Preview</button>
        </form>
        { msgInvalid }
        {data.length > 0 &&
        <QuestionsList questions={data} valid={msgInvalid === ""} modeProp={"parse"} /> }
      </div>
    </>
  )
}
