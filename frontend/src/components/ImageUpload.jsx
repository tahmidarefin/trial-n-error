import { useState, useEffect, useContext } from 'react';
import { UserContext } from './AuthProvider.jsx';

export default function ImageUpload({displayMode, item, id, exam_id, img_url}) {
    const [img, setImg] = useState(null);
    const [data, setData] = useState(null);
    const [file, setFile] = useState(null);
    const {user} = useContext(UserContext);
    
    if(!item.hasOwnProperty('id')) {
        item["id"] = id;
    }
    
    const handleChange = (e) => {
        e.preventDefault();
        setImg(e.target.files[0])
    }

    const handleUpload = (e) => {
        e.preventDefault();
        setFile(URL.createObjectURL(img));
        const _data = new FormData();
        _data.append("file", img, `${user.id}_${exam_id}_${item.id}.${img.name.split('.').pop()}`); // key, value, new_name
        (async () => {
            const response = await fetch('http://localhost:8000/upload', {
                method: "POST",
                body: _data
            });
            const data = await response.json();
            console.log(data);
        })();
    }

    useEffect(() => {
        setData(item);
    }, []);

    return (
        <>
        { data &&
            <div className="answer">
                <div className="image">
                    <input type="file" id={`${data["id"]}`} onChange={handleChange} name={`${data["id"]}`} accept=".jpg" />
                    <button onClick={handleUpload} type="button">Upload</button>
                </div>
                <div>
                    { (file || img_url) && <img src={img_url ? img_url : file} alt="preview" width="200" />}
                </div>
            </div> }
        </>
    );
}