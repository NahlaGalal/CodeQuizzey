import React from "react";
import errorImage from "../images/error.svg";
import error500Image from "../images/error-500.svg";
import error401Image from "../images/error-401.svg";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";

const Error: React.FC<any> = ({ location, status }) => {
  const [, , removeCookie] = useCookies(["token"]);

  if (!status) {
    if (location.state) status = location.state.status;
    else status = 200;
  }

  const deleteCookie = () => {
    removeCookie("token");
  };

  return (
    <div className="Home__no-quiz">
      <img
        src={
          status === 404
            ? errorImage
            : status === 500
            ? error500Image
            : error401Image
        }
        alt="Error"
      />
      <h1> Sorry, </h1>
      {status === 404 ? (
        <p> Page Not Found</p>
      ) : status === 401 ? (
        <React.Fragment>
          <p> Unotherized User</p>
          <Link to="/auth">
            <button className="btn btn__solid" onClick={deleteCookie}>
              Go to Login
            </button>
          </Link>
        </React.Fragment>
      ) : status === 500 ? (
        <p>Internal Server Error</p>
      ) : (
        <p>Error</p>
      )}
    </div>
  );
};

export default Error;
