import express from "express";
import cors from "cors";
import { AppDataSource } from "./data-source";
import userRouter from "./routes/user.routes";
import authRouter from "./routes/auth.routes";
import { handleError } from "./middlewares/handleError";
import logger from "./config/winston";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/users", userRouter);
app.use("/login", authRouter);

app.get("/", (req, res) => {
  res.send("API está rodando!");
});

app.use(handleError);

AppDataSource.initialize()
  .then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Servidor rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Erro ao conectar ao banco de dados:", error);
  });

export default app;
