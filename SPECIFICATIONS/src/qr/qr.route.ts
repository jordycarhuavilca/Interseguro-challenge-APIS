import { Router } from "express";
import QrController from "./qr.controller";
const QRRouter = Router();

QRRouter.get("/specifications", QrController.getQRSpecifications);

export default QRRouter;
