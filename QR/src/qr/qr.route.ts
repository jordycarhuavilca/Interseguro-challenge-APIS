import { Router } from "express";
import QrController from "./qr.controller";
const QRRouter = Router();

QRRouter.post("/qr/factorization", QrController.factorization);

export default QRRouter;
