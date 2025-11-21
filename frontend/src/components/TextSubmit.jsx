import { useState, useEffect } from 'react';

export default function TextSubmit({displayMode, item, id, value}) {
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
                <input className="text" type="text" id={`${data["id"]}`} name={`${data["id"]}_-1`} defaultValue={value} />
            </div>}
        </>
    );
}