import { Request, Response } from "express";
import { HttpStatus } from "../common/constant/httpResponses";
import { ResponseDefault } from "../common/interface/response";
import { QrService } from "./qr.service";
import { GetMatriz } from "./dto/matriz";

class QrController {
  static getQRSpecifications(req: Request, res: Response) {
    const responseDefault = { value: null } as {
      value: ResponseDefault<object | null> | null;
    };

    try {
      const data = req.body as GetMatriz;

      const specifications = QrService.getSpecifications(data);

      responseDefault.value = {
        data: specifications,
        message: HttpStatus.OK.MESSAGE,
        statusCode: HttpStatus.OK.CODE,
        success: true,
      };

      return res.status(HttpStatus.OK.CODE).json(responseDefault.value);
    } catch (error) {
      responseDefault.value = {
        data: null,
        message: "Error processing QR factorization",
        statusCode: HttpStatus.BAD_REQUEST.CODE,
        success: false,
      };

      return res.status(HttpStatus.BAD_REQUEST.CODE).json({
        error: "Error processing QR factorization",
      });
    }
  }
}
export default QrController;
