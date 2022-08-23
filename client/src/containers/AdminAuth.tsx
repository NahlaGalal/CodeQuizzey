import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import IllustratedImage from "../images/undraw_Choose_bwbs.svg";
import useQuery from "../utils/useQuery";
import { useCookies } from "react-cookie";

const AdminAuth: React.FC<any> = ({ history }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<any>({});
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    options?: string;
    data?: any;
  }>({
    url: "",
    method: "get",
  });
  const [cookies, setCookies] = useCookies();
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
    options: query.options,
  });

  useEffect(() => {
    if (cookies.token) history.push("/admin");
    
    if (query.url === "/auth") {
      if(data) {
        if (data.isFailed) setServerErrors(data.errors);
        else {
          setCookies("token", data.data.token);
          history.push("/admin");
        }
      }
    }
  }, [cookies.token, history, data, query.url, setCookies]);

  const submitBasicData = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(true);
    if (email && password) {
      setQuery({
        url: "/auth",
        method: "post",
        data: { email, password },
        options: "No auth",
      });
    }
  };

  return (
    <React.Fragment>
      <Navbar name="CodeQuizzey" />
      <main className="Home">
        <img src={IllustratedImage} alt="Illustrated svg" />
        <form onSubmit={(e) => submitBasicData(e)}>
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
            {error && (!email || serverErrors?.email) && (
              <p className="error">
                *{serverErrors.email || "You must type your email"}
              </p>
            )}
          </div>
          <div className="text-input">
            <label htmlFor="password">Your password</label>
            <input
              type="password"
              name="password"
              id="password"
              onChange={(e) => {
                setPassword(e.currentTarget.value);
                setServerErrors({});
              }}
            />
            {error && (!password || serverErrors.password) && (
              <p className="error">
                *{serverErrors.password || "You must type your email"}
              </p>
            )}
          </div>
          <button className="btn btn__outline" type="submit">
            Login
          </button>
        </form>
      </main>
    </React.Fragment>
  );
};

export default AdminAuth;
