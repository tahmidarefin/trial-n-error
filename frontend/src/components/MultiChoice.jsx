import { useState, useEffect } from 'react';

export default function MultiChoice({displayMode, item, id}) {
    if(!item.hasOwnProperty('id')) {
        item["id"] = id;
    }

    const [data, setData] = useState(null);
    
    useEffect(() => {
        setData(item);
    }, []);
    
    return (
        <>
            { data &&
                <div className="answer">
                    {Object.entries(JSON.parse(data["options"])).map(([_key, _value]) =>
                    (<label className="choice"  key={_key} htmlFor={`${data["id"]} ${_key}`}> {(data.hasOwnProperty('correct_answers') && data["correct_answers"].includes(_key) && displayMode === true ? 
                    <input type="checkbox" id={`${data["id"]}_${_key}`} name={`${data["id"]}_${_key}`} value={_key} defaultChecked /> :
                    <input type="checkbox" id={`${data["id"]}_${_key}`} name={`${data["id"]}_${_key}`} value={_key} />)}
                        {_value}</label>))}
                </div>}
        </>
    );
}