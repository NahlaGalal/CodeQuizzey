import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import useQuery from "../utils/useQuery";
import AdminNav from "../components/AdminNav";
import Modal from "../components/Modal";
import IllustratedImage from "../images/add-circle.svg";

const AddCircle: React.FC<any> = ({ history }) => {
  const [circle, setCircle] = useState<string>("");
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
      case "/add-circle":
        if (data.isFailed) {
          setError(true);
          setServerErrors(data.errors);
        } else if (!data.isFailed && data.data && data.data.success) setSuccess(true);
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

  const submitCircle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!circle) setError(true);
    else
      setQuery({ url: "/add-circle", method: "post", data: { name: circle } });
  };

  const logout = () => {
    setQuery({ url: `/logout?token=${cookies.token}`, method: "get" });
  };

  return (
    <React.Fragment>
      <AdminNav logout={logout} />
      <main className="Add-circle">
        <h2>Add Circle</h2>
        <img src={IllustratedImage} alt="Illustrated svg of add circle" />
        <form onSubmit={(e) => submitCircle(e)}>
          <div className="text-input">
            <label htmlFor="name">Circle name</label>
            <input
              type="text"
              name="name"
              id="name"
              onChange={(e) => {
                setCircle(e.currentTarget.value);
                setServerErrors({});
              }}
            />
            {error && (!circle || serverErrors.circle) && (
              <p className="error">
                *{serverErrors.circle || "You must type circle name"}
              </p>
            )}
          </div>
          <button className="btn btn__outline" type="submit">
            Add
          </button>
        </form>

        {success && (
          <Modal
            data="You successfully add circle"
            action={() => history.push("/admin")}
          />
        )}
      </main>
    </React.Fragment>
  );
};

export default AddCircle;
