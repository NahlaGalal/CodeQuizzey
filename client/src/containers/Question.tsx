import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import Navbar from "../components/Navbar";
import QuestionCard from "../components/QuestionCard";

type answerType =
  | "Multiple choice"
  | "File"
  | "Short text"
  | "Long text"
  | "One choice"
  | "Code";

interface IQuestionsSchema {
  _id: string;
  question: string;
  answerType: answerType;
  answers?: string[];
  circleId: string;
  index: number;
}

const Question: React.FC<any> = ({ location, history }) => {
  const [qu, setQu] = useState<IQuestionsSchema>({
    question: "",
    _id: "",
    answerType: "Short text",
    circleId: "",
    answers: [],
    index: 1,
  });
  const [cookies] = useCookies(["email", "circles", "quiz"]);
  const [activeCircle, setActiveCircle] = useState<string>("");
  const [lastQuestion, setLastQuestion] = useState<boolean>(false);
  // To forbid showing questions when user ends the quiz or solve all questions
  const [end, setEnd] = useState<boolean>(false);

  const getLinkAPI = (cId?: string, index?: string) => {
    if (!cookies.email) history.push("/");

    let circleId: string =
      cId || (new URLSearchParams(location.search).get("circleId") as string);
    let quNo: string =
      index !== undefined
        ? index
        : (new URLSearchParams(location.search).get("quNo") as string);
    let linkAPI = circleId
      ? quNo
        ? `/question?circle=${circleId}&quNo=${quNo}&email=${cookies.email}&quizId=${cookies.quiz.id}`
        : `/question?circle=${circleId}&email=${cookies.email}&quizId=${cookies.quiz.id}`
      : !quNo
      ? `/question?email=${cookies.email}&quizId=${cookies.quiz.id}`
      : "/error";
    return [linkAPI, circleId];
  };

  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    options?: string;
    data?: any;
  }>({
    url: getLinkAPI()[0],
    method: "get",
    options: "No auth",
  });
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
    options: query.options,
  });

  useEffect(() => {
    if (!cookies.email) history.push("/");

    setEnd(false);
    const [linkApi, circleId] = getLinkAPI();

    switch (query.url) {
      case linkApi:
        if (query.method === "get") {
          setActiveCircle(
            circleId ||
              cookies.circles.find(
                (c: { name: string; id: string }) => c.name === "Non-technical"
              ).id
          );
          if (data) {
            if (!data.isFailed && data.data.question) {
              setQu(data.data.question);
              if (data.data.lastQuestion) setLastQuestion(true);
              else setLastQuestion(false);
            } else if (data.isFailed && data.errors.data) {
              const err = data.errors.data;
              if (err.startsWith("Question") && err.endsWith("solved")) {
                setQu({
                  question: "",
                  _id: "",
                  answerType: "Short text",
                  circleId,
                  answers: [],
                  index: +err.split(" ")[1],
                });
                setLastQuestion(data.errors.lastQuestion);
              } else if (err === "Wrong Circle id" || err === "Missing data") {
                history.push("/error");
              } else if (err === "All questions solved") {
                setEnd(true);
              }
            }
          }
        }
        break;
      case "/question":
        if (query.method === "post") {
          if (data.isFailed) history.push("/error");
          else {
            if (lastQuestion)
              setQuery({ url: getLinkAPI(qu.circleId)[0], method: "get" });
            else {
              history.push({
                pathname: "/question",
                search: `?circleId=${qu.circleId}&quNo=${qu.index + 1}`,
              });
              setQuery({
                url: getLinkAPI(qu.circleId, `${qu.index + 1}`)[0],
                method: "get",
                options: "No auth",
              });
            }
          }
        }
        break;
      case `/end-quiz?circle=${activeCircle}&email=${cookies.email}&quizId=${cookies.quiz.id}`:
        if (!data.isFailed) setEnd(true);
        else history.push("/error");
        break;
      default:
        break;
    }
  }, [location.search, cookies.email, cookies.circles, history, data]);

  const nextQuestion = () => {
    history.push({
      pathname: "/question",
      search: `?circleId=${qu.circleId}&quNo=${qu.index + 1}`,
    });
    setQuery({
      url: getLinkAPI(qu.circleId, `${qu.index + 1}`)[0],
      method: "get",
      options: "No auth",
    });
  };

  const prevQuestion = () => {
    history.push({
      pathname: "/question",
      search: `?circleId=${qu.circleId}&quNo=${qu.index - 1}`,
    });
    setQuery({
      url: getLinkAPI(qu.circleId, `${qu.index - 1}`)[0],
      method: "get",
      options: "No auth",
    });
  };

  const submitQuestion = (userAnswer: string | File | null) => {
    const data = new FormData();
    data.append("answer", userAnswer as string);
    data.append("questionId", qu._id);
    data.append("email", cookies.email);
    data.append("quizId", cookies.quiz.id);
    setQuery({ url: "/question", method: "post", data, options: "No auth" });
  };

  const changeCircle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    history.push({
      pathname: "/question",
      search: `?circleId=${e.currentTarget.dataset.id}`,
    });
    setQuery({
      url: getLinkAPI(e.currentTarget.dataset.id, "")[0],
      method: "get",
      options: "No auth",
    });
  };

  const endQuiz = () => {
    setQuery({
      url: `/end-quiz?circle=${activeCircle}&email=${cookies.email}&quizId=${cookies.quiz.id}`,
      method: "get",
      options: "No auth",
    });
  };

  return cookies.email ? (
    <React.Fragment>
      <Navbar logoOnly={true} name={cookies.quiz.name} />
      <main className="Question">
        <header className="Question__btns">
          {cookies.circles?.map((circle: { id: string; name: string }) => (
            <button
              data-id={circle.id}
              key={circle.id}
              onClick={changeCircle}
              className={`${activeCircle === circle.id && "active"}`}
            >
              {circle.name} Questions
            </button>
          ))}
        </header>

        {!end ? (
          <React.Fragment>
            <QuestionCard
              question={qu.question}
              index={qu.index}
              answerType={qu.answerType}
              answers={qu.answers}
              lastQuestion={lastQuestion}
              prevQuestion={prevQuestion}
              nextQuestion={nextQuestion}
              submitQuestion={(userAnswer) => submitQuestion(userAnswer)}
            />

            <footer>
              <button className="btn btn__solid" onClick={endQuiz}>
                End{" "}
                {cookies.circles?.find(
                  (circle: { name: string; id: string }) =>
                    circle.id === activeCircle
                )?.name || "Non-technical"}{" "}
                Quiz
              </button>
            </footer>
          </React.Fragment>
        ) : (
          <p className="end-quiz"> This quiz ended </p>
        )}
      </main>
    </React.Fragment>
  ) : (
    <p> </p>
  );
};

export default Question;
