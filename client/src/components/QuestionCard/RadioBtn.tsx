import React from "react";

interface IQuestion {
  question: string;
  answers: string[];
  index: number;
  setUserAnswer: (answer: string) => void;
  userAnswer?: string
}

const RadioBtn: React.FC<IQuestion> = ({
  question,
  answers,
  index,
  setUserAnswer,
  userAnswer
}) => {
  return (
    <div className="radio-group">
      <label>
        {" "}
        {index}- {question}{" "}
      </label>
      {answers.map((answer, i) => (
        <div className="radio-group__input" key={answer}>
          <input
            type="radio"
            name="circle"
            id={`${i}`}
            onChange={() => setUserAnswer(answer)}
            defaultChecked={userAnswer && answer === userAnswer ? true : false}
            disabled={userAnswer ? true : false}
          />
          <label htmlFor={`${i}`}>
            <span></span>
            {answer}
          </label>
        </div>
      ))}
    </div>
  );
};

export default RadioBtn;
