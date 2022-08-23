import React, { useEffect, useState } from "react";

interface IQuestion {
  question: string;
  index: number;
  userAnswer?: string;
  setUserAnswer: (answer: null | File) => void;
}

const File: React.FC<IQuestion> = ({
  question,
  index,
  userAnswer,
  setUserAnswer,
}) => {
  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (userAnswer) setFileName(userAnswer);
    else setFileName("");
  }, [userAnswer]);

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    let file = e.currentTarget.files && e.currentTarget.files[0];
    setFileName(file!.name);
    setUserAnswer(file);
  };

  return (
    <div className="file-group">
      <label
        dangerouslySetInnerHTML={{ __html: `${index}- ${question}` }}
      ></label>
      <div className="file-group__input">
        <input
          type="file"
          accept=".zip,.rar,.7zip"
          name="answer"
          id="answer"
          onChange={(e) => uploadFile(e)}
          disabled={userAnswer ? true : false}
        />
        <label htmlFor="answer">
          {userAnswer ? (
            <a href={`http://localhost:4000/${userAnswer}`}>Download a file</a>
          ) : (
            "Upload a file"
          )}
        </label>
        <p>{fileName}</p>
      </div>
      <span>
        Allowed files are .zip files only. i.e. please zip your files before
        uploading them
      </span>
    </div>
  );
};

export default File;
