import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import AdminNav from "../components/AdminNav";
import QuestionCard from "../components/QuestionCard";
import useQuery from "../utils/useQuery";

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
  quizId: string;
  index: number;
}

interface IResponses {
  _id: string;
  name: string;
  email: string;
  solvedQuestions: {
    questionId: string;
    answer: string;
    quizId: string;
    circle: string;
    questionDetails: IQuestionDetails;
  }[];
}

const Standings: React.FC<any> = ({ match, history }) => {
  const [cookies, , removeCookie] = useCookies(["token"]);
  const [responses, setResponses] = useState<IResponses[]>();
  const [circles, setCircles] = useState<string[]>([]);
  const [questionCard, setQuestionCard] = useState<
    IQuestionDetails & { userAnswer: string }
  >({
    quizId: "",
    question: "",
    answers: [],
    _id: "",
    circleId: "",
    answerType: "Short text",
    index: 1,
    userAnswer: "",
  });
  const [showQuestionCard, setShowQuestionCard] = useState<boolean>(false);
  const [quiz, setQuiz] = useState<{ name: string; state: string }>({
    name: "",
    state: "",
  });
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
  }>({
    url: `/responses?quizId=${match.params.id}`,
    method: "get",
  });
  const { data } = useQuery({ url: query.url, method: query.method });

  useEffect(() => {
    if (!cookies.token) history.push("/auth");

    switch (query.url) {
      case `/responses?quizId=${match.params.id}`:
        if(data && data.data.responses && !data.isFailed) {
          setResponses(data.data.responses);
          const circles = new Set<string>();
          data.data.responses.map((res: IResponses) =>
            res.solvedQuestions.map((qu) => circles.add(qu.circle))
          );
          setCircles(Array.from(circles));
          setQuiz(data.data.quiz);
        }
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
  }, [cookies.token, match.params.id, history, data, removeCookie, query.url]);

  const showQuestion = (details: IQuestionDetails, userAnswer: string) => {
    setQuestionCard({ ...details, userAnswer });
    setShowQuestionCard(true);
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Standings">
        <header>
          <h2>{quiz.name}</h2>
          <p>{quiz.state}</p>
        </header>

        <div className="Standings__table">
          <table>
            <thead>
              <tr>
                <th className="id">Id</th>
                <th>Name</th>
                <th>Email</th>
                <th className="large">Circle</th>
                <th className="id">Question index</th>
                <th className="large">Question & answer</th>
              </tr>
            </thead>
            <tbody>
              {responses?.map((response, n) => {
                let user = false;
                return circles.map((circle) => {
                  let circleB = false;
                  let qusCircle = response.solvedQuestions.filter(
                    (qu) => qu.circle === circle
                  );
                  if (qusCircle) {
                    return qusCircle.map((qu) => {
                      if (!user) {
                        user = true;
                        circleB = true;
                        return (
                          <tr key={qu.questionId}>
                            <td rowSpan={response.solvedQuestions.length}>
                              {n + 1}
                            </td>
                            <td rowSpan={response.solvedQuestions.length}>
                              {response.name}
                            </td>
                            <td rowSpan={response.solvedQuestions.length}>
                              {response.email}
                            </td>
                            <td rowSpan={qusCircle.length}>{circle}</td>
                            <td>{qu.questionDetails.index}</td>
                            <td>
                              <button
                                className="btn btn__outline"
                                onClick={() =>
                                  showQuestion(qu.questionDetails, qu.answer)
                                }
                              >
                                View answer
                              </button>
                            </td>
                          </tr>
                        );
                      } else {
                        if (!circleB) {
                          circleB = true;
                          return (
                            <tr key={qu.questionId}>
                              <td rowSpan={qusCircle.length}>{circle}</td>
                              <td>{qu.questionDetails.index}</td>
                              <td>
                                <button
                                  className="btn btn__outline"
                                  onClick={() =>
                                    showQuestion(qu.questionDetails, qu.answer)
                                  }
                                >
                                  View answer
                                </button>
                              </td>
                            </tr>
                          );
                        } else {
                          return (
                            <tr key={qu.questionId}>
                              <td>{qu.questionDetails.index}</td>
                              <td>
                                <button
                                  className="btn btn__outline"
                                  onClick={() =>
                                    showQuestion(qu.questionDetails, qu.answer)
                                  }
                                >
                                  View answer
                                </button>
                              </td>
                            </tr>
                          );
                        }
                      }
                    });
                  }
                });
              })}
            </tbody>
          </table>
        </div>

        {showQuestionCard && (
          <div className="Standings__question">
            <button
              className="Standings__question__close"
              onClick={() => setShowQuestionCard(false)}
            >
              &times;
            </button>
            <QuestionCard
              question={questionCard.question}
              answerType={questionCard.answerType}
              index={questionCard.index}
              answers={questionCard.answers}
              overlayBox={true}
              uAnswer={questionCard.userAnswer}
            />
          </div>
        )}
      </main>
    </React.Fragment>
  );
};

export default Standings;
