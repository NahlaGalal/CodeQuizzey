import axios from "axios";

export default axios.create({
  // baseURL: "http://localhost:5000/",
  baseURL: "https://codequizzey.azurewebsites.net/",
  //"http://192.168.1.5:4000/"
});
