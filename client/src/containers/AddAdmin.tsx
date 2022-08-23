import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import AdminNav from "../components/AdminNav";
import Modal from "../components/Modal";
import IllustratedImage from "../images/add-circle.svg";

const AddAdmin: React.FC<any> = ({ history }) => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<any>({});
  const [success, setSuccess] = useState(false);
  const [query, setQuery] = useState<{
    url: string;
    method: "get" | "post" | "delete";
    data?: any;
  }>({
    url: "",
    method: "get",
  });
  const [cookies, , removeCookie] = useCookies(["token"]);
  const { data } = useQuery({
    url: query.url,
    method: query.method,
    data: query.data,
  });

  useEffect(() => {
    if (!cookies.token) history.push("/auth");

    switch (query.url) {
      case "/add-admin":
        if (data.isFailed) {
          setError(true);
          setServerErrors(data.errors);
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
  }, [cookies.token, history, data, query.url, removeCookie]);

  const addAdmin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !email || !password) setError(true);
    else
      setQuery({
        url: "/add-admin",
        method: "post",
        data: { name, email, password },
      });
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Add-circle">
        <h2>Add Admin</h2>
        <img src={IllustratedImage} alt="Illustrated svg of add admin" />
        <form onSubmit={(e) => addAdmin(e)}>
          <div className="text-input">
            <label htmlFor="name">Admin name</label>
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
                *{serverErrors.name || "You must type quiz name"}
              </p>
            )}
          </div>
          <div className="text-input">
            <label htmlFor="email">Admin email</label>
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
                *{serverErrors.email || "You must choose start date"}
              </p>
            )}
          </div>
          <div className="text-input">
            <label htmlFor="password">Admin password</label>
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
                *{serverErrors.password || "You must choose end date"}
              </p>
            )}
          </div>
          <button className="btn btn__outline" type="submit">
            Add
          </button>
        </form>

        {success && (
          <Modal
            data="You successfully add admin"
            action={() => history.push("/admin")}
          />
        )}
      </main>
    </React.Fragment>
  );
};

export default AddAdmin;
