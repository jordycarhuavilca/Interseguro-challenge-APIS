import { Request, Response } from "express";
import { HttpStatus } from "../common/constant/httpResponses";
import { ResponseDefault } from "../common/interface/response";
import { MatrixDto } from "./dto";
import { QrService } from "./qr.service";
import { HttpException } from "../common/exception";

export default class QrController {
  static async factorization(req: Request, res: Response) {
    const responseDefault = { value: null } as {
      value: ResponseDefault<object | null> | null;
    };
    responseDefault.value = {
      data: null,
      message: "Error processing QR factorization",
      statusCode: HttpStatus.BAD_REQUEST.CODE,
      success: false,
    };

    try {
      const matrix = req.body as MatrixDto;

      if (!matrix || matrix?.matrix === undefined) {
        responseDefault.value.message = "El campo matrix es requerido";
        res.status(HttpStatus.OK.CODE).json(responseDefault.value);
        return;
      }

      const result = await QrService.factorization(matrix);

      responseDefault.value = {
        data: result,
        message: HttpStatus.OK.MESSAGE,
        statusCode: HttpStatus.OK.CODE,
        success: true,
      };

      res.status(HttpStatus.OK.CODE).json(responseDefault.value);
    } catch (error) {
      console.log("message", error.message);

      if (error instanceof HttpException) {
        responseDefault.value.message = error.message;
        responseDefault.value.statusCode = error.code;
      }

      res.status(HttpStatus.BAD_REQUEST.CODE).json(responseDefault);
    }
  }
}
