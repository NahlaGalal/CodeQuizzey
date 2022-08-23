import React, { useEffect, useRef, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-csharp";
import "prismjs/components/prism-java";
import "prismjs/components/prism-python";
import "prismjs/components/prism-go";
import "prismjs/themes/prism-tomorrow.css";

interface IQuestion {
  question: string;
  index: number;
  userAnswer?: string;
  setUserAnswer: (answer: string) => void;
}

const Code: React.FC<IQuestion> = ({ question, index, userAnswer, setUserAnswer }) => {
  const [content, setContent] = useState<string>("");
  const [language, setLanguage] = useState<string>("js");
  const preRef = useRef<HTMLPreElement>(null);

  let timer: NodeJS.Timeout;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    let value = content,
      setStartPosition = e.currentTarget.selectionStart;

    if (e.key === "Tab") {
      value =
        value.substring(0, setStartPosition) +
        "    " +
        value.substring(setStartPosition);
      e.currentTarget.selectionStart = setStartPosition + 3;
      e.currentTarget.selectionEnd = setStartPosition + 4;
      e.preventDefault();
      setContent(value);
    }
  };

  useEffect(() => {
    Prism.highlightAll();
    if(userAnswer) setContent(userAnswer);
  }, [content, language, userAnswer]);

  const scrollCode = () => {
    clearTimeout(timer);
    if (preRef.current && preRef.current.classList.contains("disable-hover")) {
      preRef.current.classList.remove("disable-hover");
    }
    timer = setTimeout(
      () => preRef.current?.classList.add("disable-hover"),
      500
    );
  };

  return (
    <form className="code">
      <div className="code__header">
        <label> {index}- {question} </label>
        <select
          name="language"
          id="language"
          onChange={(e) => setLanguage(e.currentTarget.value)}
          defaultValue="js"
        >
          <option value="js">Javascript</option>
          <option value="ts">Typescript</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
          <option value="cs">C#</option>
          <option value="java">Java</option>
          <option value="python">Python</option>
          <option value="go">Go</option>
        </select>
      </div>
      <div className="code-edit-container line-numbers" onScroll={scrollCode}>
        <textarea
          className="code-input"
          name="code"
          id="code"
          value={content}
          onChange={(e) => {
            setContent(e.currentTarget.value);
            setUserAnswer(e.currentTarget.value);
            e.currentTarget.rows = e.currentTarget.value.split("\n").length;
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={userAnswer ? true : false}
        />
        <pre className="code-output disable-hover" ref={preRef}>
          <code className={`language-${language}`}>{content}</code>
        </pre>
      </div>
    </form>
  );
};

export default Code;
