import React, { useState } from "react";

interface IQuestion {
  question: string;
  answers: string[];
  index: number;
  userAnswer?: string;
  setUserAnswer: (answer: string) => void;
}

const Checkbox: React.FC<IQuestion> = ({
  question,
  answers,
  index,
  userAnswer,
  setUserAnswer,
}) => {
  const [answersChecked, setAnswersChecked] = useState<string[]>([]);

  const checkAnswer = (
    e: React.ChangeEvent<HTMLInputElement>,
    answer: string
  ) => {
    const answersCopy = [...answersChecked];

    if (e.currentTarget.checked) answersCopy.push(answer);
    else {
      const answerId = answersCopy.findIndex((ans) => ans === answer);
      answersCopy.splice(answerId, 1);
    }

    setAnswersChecked(answersCopy);
    setUserAnswer(answersCopy.join(","));
  };

  return (
    <div className="checkbox-group">
      <label>
        {" "}
        {index}- {question}{" "}
      </label>
      {answers.map((answer, i) => (
        <div className="checkbox-group__input" key={answer}>
          <input
            type="checkbox"
            name="circle"
            id={`${i}`}
            onChange={(e) => checkAnswer(e, answer)}
            defaultChecked={
              userAnswer && userAnswer.split(",").find((a) => a === answer)
                ? true
                : false
            }
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

export default Checkbox;
