import axios from "axios";

const mainAPI = axios.create({
  baseURL: "https://api.mensageiroweb.com",
});

export default mainAPI;
