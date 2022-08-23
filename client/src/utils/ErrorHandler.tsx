import React from "react";
import { useLocation } from "react-router-dom";
import { get } from "lodash";
import Error from "../containers/Error";

// The top level component that will wrap our app's core features
const ErrorHandler: React.FC<any> = ({ children }) => {
  const location = useLocation();

  switch (get(location.state, "errorStatusCode")) {
    case 404:
      return <Error status={404} />;
    case 500:
      return <Error status={500} />;
    case 401:
      return <Error status={401} />;
    default:
      return children;
  }
};

export default ErrorHandler;
