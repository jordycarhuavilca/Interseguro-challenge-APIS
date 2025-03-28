import express from "express";
import router from "./routes";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import { HttpException } from "./common/exception";
import { HttpStatus } from "./common/constant/httpResponses";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", router);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  const defaultHttpCode = HttpStatus.INTERNAL_SERVER_ERROR.CODE;
  const status = err instanceof HttpException ? err.code : defaultHttpCode;
  const message = err.message;

  res.status(status).json({
    error: message,
  });
  next();
});

export default app;
