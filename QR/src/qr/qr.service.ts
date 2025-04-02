import { qr } from "mathjs";
import { MatrixDto } from "./dto";
import { HttpException } from "../common/exception";
import { HttpStatus } from "../common/constant/httpResponses";
import { QrProvider } from "./qr.provider";
import { isValidMatrix } from "../common/utils/validate";

export class QrService {
  static async factorization({ matrix }: MatrixDto) {
    if (!isValidMatrix(matrix)) {
      throw new HttpException(
        "Invalid matrix format",
        HttpStatus.BAD_REQUEST.CODE
      );
    }

    const { Q, R } = qr(matrix);
    const specifications = await QrProvider.getQrSpecifications({
      Q,
      R,
    } as any);

    const result = {
      qr: { Q, R },
      specifications,
    };

    return result;
  }
}
