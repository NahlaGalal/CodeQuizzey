import React from "react";

interface IQuestion {
  question: string;
  index: number;
  userAnswer?: string;
  setUserAnswer: (answer: string) => void;
}

const LongText: React.FC<IQuestion> = ({
  question,
  index,
  userAnswer,
  setUserAnswer,
}) => {
  return (
    <div className="long-text-group">
      <label htmlFor="answer">
        {index}- {question}
      </label>
      <textarea
        name="answer"
        id="answer"
        placeholder="Answer..."
        onChange={(e) => setUserAnswer(e.currentTarget.value)}
        disabled={userAnswer ? true : false}
      >
        {userAnswer}
      </textarea>
    </div>
  );
};

export default LongText;
