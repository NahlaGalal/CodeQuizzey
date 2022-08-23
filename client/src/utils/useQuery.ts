import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";

const useQuery = ({
  url,
  method = "get",
  data,
  options,
}: {
  url: string;
  method?: "get" | "post" | "delete";
  data?: any;
  options?: string;
}) => {
  const history = useHistory();
  const [apiData, setApiData] = useState<any>("");
  const [cookies] = useCookies(["token"]);

  useEffect(() => {
    if (!url) return;

    url = `api${url}`;

    (async () => {
      try {
        if (options === "No auth") {
          if (method === "get") {
            let res = await axios.get(url);
            setApiData(res.data);
          } else if (method === "delete") {
            let res = await axios.delete(url);
            setApiData(res.data);
          } else if (method === "post") {
            let res = await axios.post(url, data);
            setApiData(res.data);
          }
        } else {
          if (method === "get") {
            if (options === "download") {
              const res = await axios.get(url, {
                headers: {
                  Authorization: `Bearer ${cookies.token}`,
                  "Content-Type": "application/octet-stream",
                  "Content-Disposition": "attachment",
                  filename: "file.xlsx",
                },
                responseType: "blob",
              });
              setApiData(res.data);
            } else {
              let res = await axios.get(url, {
                headers: { Authorization: `Bearer ${cookies.token}` },
              });
              setApiData(res.data);
            }
          } else if (method === "delete") {
            let res = await axios.delete(url, {
              headers: { Authorization: `Bearer ${cookies.token}` },
            });
            setApiData(res.data);
          } else if (method === "post") {
            let res = await axios.post(url, data, {
              headers: { Authorization: `Bearer ${cookies.token}` },
            });
            setApiData(res.data);
          }
        }
      } catch(err) {
        if (
          (err as any).response.status === 404 ||
          (err as any).response.status === 401 ||
          (err as any).response.status === 500
        )
          history.replace(history.location.pathname, {
            errorStatusCode: (err as any).response.status,
          });
      }
    })();
  }, [url, cookies.token, history, method, data, options]);

  return { data: apiData };
};

export default useQuery;
