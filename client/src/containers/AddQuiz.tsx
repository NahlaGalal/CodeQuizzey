import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import AdminNav from "../components/AdminNav";
import Modal from "../components/Modal";
import IllustratedImage from "../images/add-circle.svg";
import { padStart } from "lodash";

const AddQuiz: React.FC<any> = ({ history, match }) => {
  const [quiz, setQuiz] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    data?: any;
  }>({
    url: ``,
    method: "get",
  });
  const [cookies, , removeCookie] = useCookies(["token"]);
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
  });

  const path = match.path === "/edit-quiz/:id" ? "edit" : "add";

  const formatDate = (date: string) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${padStart(
      `${d.getMonth() + 1}`,
      2,
      "0"
    )}-${padStart(`${d.getDate()}`, 2, "0")}T${padStart(
      `${d.getHours()}`,
      2,
      "0"
    )}:${padStart(`${d.getMinutes()}`, 2, "0")}`;
  };

  useEffect(() => {
    if (!cookies.token) history.push("/auth");

    if (path === "edit")
      setQuery({ url: `/edit-quiz?quizId=${match.params.id}`, method: "get" });
    else {
      setQuiz("");
      setStartDate("");
      setEndDate("");
    }

    switch (query.url) {
      case `/edit-quiz?quizId=${match.params.id}`:
        if (data && !data.isFailed && data.data.name) {
          setQuiz(data.data.name);
          setStartDate(formatDate(data.data.startDate));
          setEndDate(formatDate(data.data.endDate));
        }
        break;
      case "/add-quiz":
        if (data.isFailed) {
          setServerErrors(data.errors);
          setError(true);
        } else setSuccess(true);
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
    path,
    match.params.id,
    data,
    query.url,
    removeCookie,
  ]);

  const addQuiz = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!quiz || !startDate || !endDate) setError(true);

    const data =
      path === "add"
        ? { name: quiz, startDate, endDate }
        : { name: quiz, startDate, endDate, quizId: match.params.id };

    setQuery({ url: "/add-quiz", method: "post", data });
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Add-circle">
        <h2>{path === "edit" ? "Edit" : "Add"} Quiz</h2>
        <img src={IllustratedImage} alt="Illustrated svg of add quiz" />
        <form onSubmit={(e) => addQuiz(e)}>
          <div className="text-input">
            <label htmlFor="name">Quiz name</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={(e) => {
                setQuiz(e.currentTarget.value);
                setServerErrors({});
              }}
              defaultValue={quiz}
            />
            {error && (!quiz || serverErrors.quiz) && (
              <p className="error">
                *{serverErrors.quiz || "You must type quiz name"}
              </p>
            )}
          </div>
          <div className="text-input">
            <label htmlFor="start">Start date</label>
            <input
              type="datetime-local"
              name="start"
              id="start"
              onChange={(e) => {
                setStartDate(e.currentTarget.value);
                setServerErrors({});
              }}
              min={new Date().toISOString().split(":").splice(0, 2).join(":")}
              defaultValue={startDate}
            />
            {error && (!startDate || serverErrors.startDate) && (
              <p className="error">
                *{serverErrors.startDate || "You must choose start date"}
              </p>
            )}
          </div>
          <div className="text-input">
            <label htmlFor="end">End date</label>
            <input
              type="datetime-local"
              name="end"
              id="end"
              onChange={(e) => {
                setEndDate(e.currentTarget.value);
                setServerErrors({});
              }}
              value={endDate}
              min={
                startDate
                  ? startDate
                  : new Date().toISOString().split(":").splice(0, 2).join(":")
              }
            />
            {error && (!endDate || serverErrors.endDate) && (
              <p className="error">
                *{serverErrors.endDate || "You must choose end date"}
              </p>
            )}
          </div>
          <button className="btn btn__outline" type="submit">
            {path === "add" ? "Add" : "Edit"}
          </button>
        </form>

        {success && (
          <Modal
            data={`You successfully ${path === "add" ? "add" : "edit"} quiz`}
            action={() => history.push("/admin")}
          />
        )}
      </main>
    </React.Fragment>
  );
};

export default AddQuiz;
