import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import AdminNav from "../components/AdminNav";
import Modal from "../components/Modal";
import IllustratedImage from "../images/add-question.svg";

type answerType =
  | "Multiple choice"
  | "File"
  | "Short text"
  | "Long text"
  | "One choice"
  | "Code";

const AddQuestion: React.FC<any> = ({ history, match }) => {
  const [question, setQuestion] = useState<string>("");
  const [circle, setCircle] = useState<{ name: string; _id: string }>({
    name: "",
    _id: "",
  });
  const [answerType, setAnswerType] = useState<answerType>("Short text");
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [index, setIndex] = useState<number>();
  const [circles, setCircles] = useState<{ name: string; _id: string }[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    data?: any;
  }>({
    url: "/add-question",
    method: "get",
  });
  const [cookies, , removeCookie] = useCookies(["token"]);
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
  });

  const path = match.path === "/edit-question/:id" ? "edit" : "add";

  useEffect(() => {
    if (!cookies.token) history.push("/auth");

    switch (query.url) {
      case "/add-question":
      case "/edit-question":
        if (query.method === "get") {
          if (data && !data.isFailed) {
            setCircles(data.data);
          }
          if (path === "edit")
            setQuery({
              url: `/edit-question?questionId=${match.params.id}`,
              method: "get",
            });
        } else {
          if (data.isFailed) setServerErrors(data.errors);
          else setSuccess(true);
        }
        break;
      case `/edit-question?questionId=${match.params.id}`:
        if (data.data && data.data.question && !data.isFailed) {
          setCircle(data.data.circle);
          setQuestion(data.data.question.question);
          setAnswerType(data.data.question.answerType);
          setIndex(data.data.question.index);
          if (data.data.question.answers)
            setAnswers(data.data.question.answers);
          else setAnswers(["", "", "", ""]);
        } else if (data.data && !data.isFailed) {
          setCircles(data.data);
        }
        break;
      case `/get-Index?quizId=${match.params.id}&circleId=${circle._id}`:
        if (!data.isFailed) setIndex(data.data.index);
        break;
      case `/logout?token=${cookies.token}`:
        if (!data.isFailed) {
          removeCookie("token");
          history.push("/auth");
        }
        break;
      default:
        break;
    }
  }, [
    cookies.token,
    history,
    data,
    circle._id,
    match.params.id,
    path,
    query.url,
    removeCookie,
    query.method,
  ]);

  const getIndex = (circleId: string) => {
    setQuery({
      url: `/get-Index?quizId=${match.params.id}&circleId=${circleId}`,
      method: "get",
    });
  };

  const addQuestion = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const quAnswers = answers.filter((answer) => answer !== "");
    if (
      !question ||
      !circle ||
      !answerType ||
      !index ||
      ((answerType === "Multiple choice" || answerType === "One choice") &&
        quAnswers.length < 2)
    )
      setError(true);
    else {
      if (path === "add") {
        let data: {
          quizId: string;
          question: string;
          circleId: string;
          answerType: answerType;
          index: number;
          answers?: string[];
        } = {
          quizId: match.params.id,
          question,
          circleId: circle._id,
          answerType,
          index,
        };
        if (
          quAnswers.length &&
          (answerType === "Multiple choice" || answerType === "One choice")
        )
          data.answers = quAnswers;
        setQuery({ url: "/add-question", method: "post", data });
      } else {
        let data: {
          questionId: string;
          question: string;
          answerType: answerType;
          answers?: string[];
        } = {
          questionId: match.params.id,
          question,
          answerType,
        };
        if (
          quAnswers.length &&
          (answerType === "Multiple choice" || answerType === "One choice")
        )
          data.answers = quAnswers;
        setQuery({ url: "/edit-question", method: "post", data });
      }
    }
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Add-circle">
        <h2>{path === "edit" ? "Edit" : "Add"} Question</h2>
        <img src={IllustratedImage} alt="Illustrated svg of add question" />
        <form onSubmit={(e) => addQuestion(e)}>
          {/* Select circle */}
          <div className="select-input">
            <label htmlFor="circle">Circle</label>
            <select
              name="circle"
              id="circle"
              onChange={(e) => {
                getIndex(e.currentTarget.value);
                setCircle({
                  _id: e.currentTarget.value,
                  name: e.currentTarget.selectedOptions[0].textContent || "",
                });
                setServerErrors({});
              }}
              value={circle._id}
              disabled={path === "edit" ? true : false}
            >
              <option value="" disabled>
                Choose circle
              </option>
              {circles.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            {error && (!circle._id || serverErrors.circle) && (
              <p className="error">
                *{serverErrors.circle || "You must choose circle name"}
              </p>
            )}
          </div>

          {/* Index */}
          <div className="read-only-input">
            <label htmlFor="index">Index</label>
            <p className="input">{index}</p>
            {error && (!index || serverErrors.index) && (
              <p className="error">
                *
                {serverErrors.index ||
                  "You must choose circle name to specify index"}
              </p>
            )}
          </div>

          {/* Question */}
          <div className="text-input">
            <label htmlFor="question">Question</label>
            <input
              type="text"
              name="question"
              id="question"
              onChange={(e) => {
                setQuestion(e.currentTarget.value);
                setServerErrors({});
              }}
              defaultValue={question}
            />
            {error && (!question || serverErrors.question) && (
              <p className="error">
                *{serverErrors.question || "You must type question"}
              </p>
            )}
          </div>

          {/* Answer type */}
          <div className="select-input">
            <label htmlFor="type">Answer type</label>
            <select
              name="type"
              id="type"
              onChange={(e) => {
                setAnswerType(e.currentTarget.value as answerType);
                setServerErrors({});
              }}
              value={answerType}
            >
              <option value="" disabled defaultChecked>
                Choose answer type
              </option>
              <option value="Multiple choice">Multiple choice</option>
              <option value="One choice">One choice</option>
              <option value="Short text">Short text</option>
              <option value="Long text">Long text</option>
              <option value="File">File</option>
              <option value="Code">Code</option>
            </select>
            {error && (!answerType || serverErrors.answerType) && (
              <p className="error">
                *{serverErrors.answerType || "You must choode answer type"}
              </p>
            )}
          </div>

          {/* Answers */}
          {(answerType === "Multiple choice" ||
            answerType === "One choice") && (
            <div className="text-input">
              <label htmlFor="answer1">
                Answers<span>You must type at least two answers</span>
              </label>
              <input
                type="text"
                name="answer1"
                id="answer1"
                onChange={(e) => {
                  let answersCopy = [...answers];
                  answersCopy[0] = e.currentTarget.value;
                  setAnswers(answersCopy);
                  setServerErrors({});
                }}
                defaultValue={answers[0]}
              />
              <input
                type="text"
                name="answer2"
                id="answer2"
                onChange={(e) => {
                  let answersCopy = [...answers];
                  answersCopy[1] = e.currentTarget.value;
                  setAnswers(answersCopy);
                  setServerErrors({});
                }}
                defaultValue={answers[1]}
              />
              <input
                type="text"
                name="answer3"
                id="answer3"
                onChange={(e) => {
                  let answersCopy = [...answers];
                  answersCopy[2] = e.currentTarget.value;
                  setAnswers(answersCopy);
                  setServerErrors({});
                }}
                defaultValue={answers[2]}
              />
              <input
                type="text"
                name="answer4"
                id="answer4"
                onChange={(e) => {
                  let answersCopy = [...answers];
                  answersCopy[3] = e.currentTarget.value;
                  setAnswers(answersCopy);
                  setServerErrors({});
                }}
                defaultValue={answers[3]}
              />
              {error &&
                (answers.filter((ans) => ans !== "").length < 2 ||
                  serverErrors.answers) && (
                  <p className="error">
                    *
                    {serverErrors.answers ||
                      "You must type answers or change answer type"}
                  </p>
                )}
            </div>
          )}

          <button className="btn btn__outline" type="submit">
            {path === "add" ? "Add" : "Edit"}
          </button>
        </form>

        {success && (
          <Modal
            data={
              path === "add"
                ? "You successfully add question"
                : "You successfully edit question"
            }
            action={() => history.push("/admin")}
          />
        )}
      </main>
    </React.Fragment>
  );
};

export default AddQuestion;
