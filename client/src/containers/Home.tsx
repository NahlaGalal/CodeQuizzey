import React, { useEffect, useRef, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import IllustratedImage from "../images/undraw_Choose_bwbs.svg";
import noQuiz from "../images/no-quiz.svg";
import Navbar from "../components/Navbar";

interface ICircle {
  name: string;
  _id: string;
}

const Home: React.FC<any> = ({ history }) => {
  const [circles, setCircles] = useState<ICircle[]>([]);
  const [quiz, setQuiz] = useState<{ name: string; id: string }>({
    name: "",
    id: "",
  });
  const [circlesChecked, setCirclesChecked] = useState<
    { name: string; id: string }[]
  >([]);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<any>({});
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    options?: string;
    data?: any;
  }>({
    url: "/",
    method: "get",
    options: "No auth"
  });
  const [cookies, setCookies] = useCookies(["email", "circles", "quiz"]);
  const unmounted = useRef(false);
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
    options: query.options,
  });

  useEffect(() => {
    if (cookies.email) history.push("/question");

    switch (query.url) {
      case "/":
        if (query.method === "get") {
          if (data && data.isFailed) {
            setCircles([]);
            setQuiz({ name: "", id: "" });
          } else if (data && !data.isFailed) {
            setCircles(data.data.circles);
            setQuiz({ name: data.data.quizName, id: data.data.quizId });
          }
          break;
        } else {
          if (data.isFailed) setServerErrors(data.error);
          else {
            setCookies("circles", [
              ...circlesChecked,
              { name: "Non-technical", id: data.data.nonTech },
            ]);
            setCookies("email", email);
            setCookies("quiz", quiz);
            history.push("/question");
          }
        }
        break;
      default:
        break;
    }

    if (!unmounted.current) {
      setQuery({ url: "/", method: "get", options: "No auth" });
    }

    return () => {
      unmounted.current = true;
    };
  }, [cookies.email, history, data, circlesChecked, email]);

  const checkCircle = (e: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
    let circle: { name: string; id: string } = {
      id: e.currentTarget.id,
      name: e.currentTarget.dataset.name as string,
    };
    setServerErrors({});
    if (e.currentTarget.checked) {
      if (circlesChecked.length === 2) e.preventDefault();
      else setCirclesChecked([...circlesChecked, circle]);
    } else {
      let circlesCheckedCopy = [...circlesChecked];
      let circleIndex = circlesCheckedCopy.findIndex((c) => c === circle);
      circlesCheckedCopy.splice(circleIndex, 1);
      setCirclesChecked([...circlesCheckedCopy]);
    }
  };

  const submitBasicData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(true);
    if (name && email && circlesChecked.length) {
      setQuery({
        url: "/",
        method: "post",
        data: {
          name,
          email,
          circles: [...circlesChecked.map((circle) => circle.id)],
        },
        options: "No auth",
      });
    }
  };

  return (
    <React.Fragment>
      {quiz.id ? (
        <React.Fragment>
          <Navbar name={quiz.name} />
          <main className="Home">
            <img src={IllustratedImage} alt="Illustrated svg" />
            <form onSubmit={(e) => submitBasicData(e)}>
              <div className="text-input">
                <label htmlFor="name">Your name</label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  onChange={(e) => {
                    setName(e.currentTarget.value);
                    setServerErrors({});
                  }}
                />
                {error && (!name || serverErrors.name) && (
                  <p className="error">
                    *{serverErrors.name || "You must type your name"}
                  </p>
                )}
              </div>
              <div className="text-input">
                <label htmlFor="email">Your email</label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  onChange={(e) => {
                    setEmail(e.currentTarget.value);
                    setServerErrors({});
                  }}
                />
                {error && (!email || serverErrors.email) && (
                  <p className="error">
                    *{serverErrors.email || "You must type your email"}
                  </p>
                )}
              </div>
              <div className="checkbox-group">
                <label>Technical circles</label>
                <span>You can choose one or two circles only</span>
                {circles.map((circle: ICircle) => (
                  <div className="checkbox-group__input" key={circle._id}>
                    <input
                      type="checkbox"
                      name="circle"
                      id={circle._id}
                      data-name={circle.name}
                      onClick={(e) => checkCircle(e)}
                    />
                    <label htmlFor={circle._id}>
                      <span></span>
                      {circle.name}
                    </label>
                  </div>
                ))}
                {error && (!circlesChecked.length || serverErrors.circle) && (
                  <p className="error">
                    *
                    {serverErrors.circle ||
                      "You must choose one or two circles"}
                  </p>
                )}
              </div>
              <button className="btn btn__outline" type="submit">
                Next
              </button>
            </form>
          </main>
        </React.Fragment>
      ) : (
        <div className="Home__no-quiz">
          <img src={noQuiz} alt="No quizzes" />
          <h1> Sorry, </h1>
          <p> No quizzes available </p>
        </div>
      )}
    </React.Fragment>
  );
};

export default Home;
