require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./data-source";
import cors from "cors";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import { handleError } from "./middlewares/handleError";
import logger from "./config/winston";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter); // 🔹 Certifique-se de que essa linha está presente
app.use("/login", authRouter);

// Rota de teste para verificar se o servidor está rodando
app.get("/", (req, res) => {
  res.send("API está rodando!");
});

app.use(handleError);

AppDataSource.initialize()
  .then(() => {
    app.listen(process.env.PORT, () => {
      logger.info(`Servidor rodando em http://localhost:${process.env.PORT}`);
    });
  })
  .catch((error) => console.log(error));
