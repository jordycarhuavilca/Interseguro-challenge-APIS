import { HttpStatus } from "../common/constant/httpResponses";
import { HttpException } from "../common/exception/HttpExeption";
import { isValidMatrix } from "../common/utils/validate";
import { GetMatriz } from "./dto/matriz";

export class QrService {
  private static isDiagonal(matrix: number[][]) {
    return matrix.every((row, i) =>
      row.every((val, j) => (i !== j ? val === 0 : true))
    );
  }
  static getSpecifications(data: GetMatriz) {
    const { Q, R } = data;

    if (!isValidMatrix(Q) || !isValidMatrix(Q)) {
      throw new HttpException(
        "Invalid matrix format",
        HttpStatus.BAD_REQUEST.CODE
      );
    }

    const matrices = [Q, R];

    const allValues = matrices.flat().flat();
    const maxVal = Math.max(...allValues);
    const minVal = Math.min(...allValues);
    const sumTotal = allValues.reduce((sum, num) => sum + num, 0);
    const average = sumTotal / allValues.length;

    return {
      maxVal,
      minVal,
      average,
      sumTotal,
      isQDiagonal: QrService.isDiagonal(matrices[0]),
      isRDiagonal: QrService.isDiagonal(matrices[1]),
    };
  }
}
