import express from "express";
import stream from "./src/routers/stream";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static("public"));

app.use(stream);

app.listen(PORT, () => console.log("Server is running on port: " + PORT));