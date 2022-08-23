import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { Link } from "react-router-dom";
import download from "downloadjs";
import axios from "../axiosInstance";
import useQuery from "../utils/useQuery";
import AdminNav from "../components/AdminNav";

type answerType =
  | "Multiple choice"
  | "File"
  | "Short text"
  | "Long text"
  | "One choice"
  | "Code";

interface IQuestionDetails {
  answers: string[];
  _id: string;
  circleId: string;
  question: string;
  answerType: answerType;
  index: number;
}

const Quiz: React.FC<any> = ({ history, match }) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const [circles, setCircles] = useState<{ name: string; _id: string }[]>([]);
  const [quiz, setQuiz] = useState<{ name: string; state: string }>({
    name: "",
    state: "",
  });
  const [questions, setQuestions] = useState<IQuestionDetails[]>([]);
  const [questionId, setQuestionId] = useState<string>("");
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
  }>({
    url: `/quiz?quizId=${match.params.id}`,
    method: "get",
  });
  const { data } = useQuery({ url: query.url, method: query.method });

  useEffect(() => {
    if (!cookies.token) history.push("/auth");

    switch (query.url) {
      case `/quiz?quizId=${match.params.id}`:
        if (data && !data.isFailed && data.data.quiz) {
          setCircles(data.data.circles);
          setQuestions(data.data.questions);
          setQuiz(data.data.quiz);
        }
        break;
      case `/delete-quiz?quizId=${match.params.id}`:
        if (!data.isFailed) history.push("/admin");
        break;
      case `/delete-question?questionId=${questionId}`:
        if (!data.isFailed && data.data.success)
          setQuery({ url: `/quiz?quizId=${match.params.id}`, method: "get" });
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
    match.params.id,
    data,
    query.url,
    questionId,
    removeCookie,
  ]);

  const downloadResponses = () => {
    (async () => {
      const res = await axios.get(`/download?quizId=${match.params.id}`, {
        headers: {
          Authorization: `Bearer ${cookies.token}`,
          "Content-Type": "application/octet-stream",
          "Content-Disposition": "attachment",
          filename: "file.xlsx",
        },
        responseType: "blob",
      });

      download(res.data, "file.xlsx");
    })();
  };

  const deleteQuiz = () => {
    setQuery({
      url: `/delete-quiz?quizId=${match.params.id}`,
      method: "delete",
    });
  };

  const deleteQuestion = (questionId: string) => {
    setQuestionId(questionId);
    setQuery({
      url: `/delete-question?questionId=${questionId}`,
      method: "delete",
    });
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Quiz">
        <header>
          <h2>{quiz?.name}</h2>
          <p>{quiz?.state}</p>
        </header>

        <section>
          <ul>
            {circles.map((circle) => (
              <li key={circle._id}>
                &gt; {circle.name}
                <ul>
                  {questions
                    .filter(
                      (question) =>
                        question.circleId.toString() === circle._id.toString()
                    )
                    .map((question) => (
                      <li key={question._id}>
                        {question.index}- {question.question}
                        {quiz.state === "Upcoming quiz" && (
                          <span>
                            <Link to={`/edit-question/${question._id}`}>
                              Edit question
                            </Link>
                            <button onClick={() => deleteQuestion(question._id)}>
                              Delete question
                            </button>
                          </span>
                        )}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>

        <footer>
          {quiz.state === "Upcoming quiz" ? (
            <React.Fragment>
              <Link to={`/add-question/${match.params.id}`}>
                <button className="btn btn__solid">Add question</button>
              </Link>
              <Link to={`/edit-quiz/${match.params.id}`}>
                <button className="btn btn__solid">Edit quiz</button>
              </Link>
              <button className="btn btn__solid" onClick={deleteQuiz}>
                Delete quiz
              </button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <Link to={`/standings/${match.params.id}`}>
                <button className="btn btn__solid">Show standings</button>
              </Link>
              <button className="btn btn__solid" onClick={downloadResponses}>
                Download responses
              </button>
            </React.Fragment>
          )}
        </footer>
      </main>
    </React.Fragment>
  );
};

export default Quiz;
