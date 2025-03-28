import { Router } from "express";
import QRRouter from "../qr/qr.route";

const router = Router();
router.use(QRRouter);

export default router;
