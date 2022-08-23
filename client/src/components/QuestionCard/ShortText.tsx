import React from "react";

interface IQuestion {
  question: string;
  index: number;
  userAnswer?: string;
  setUserAnswer: (answer: string) => void;
}

const ShortText: React.FC<IQuestion> = ({ question, index, userAnswer, setUserAnswer }) => {
  return (
    <div className="text-input">
      <label htmlFor="answer">
        {index}- {question}
      </label>
      <input
        type="text"
        name="answer"
        id="answer"
        onChange={(e) => setUserAnswer(e.currentTarget.value)}
        disabled={userAnswer ? true : false}
        defaultValue={userAnswer}
      />
    </div>
  );
};

export default ShortText;
