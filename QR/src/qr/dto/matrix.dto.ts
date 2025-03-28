export interface MatrixDto {
  matrix: number[][];
}

export interface ResponseGetSpecification {
  maxVal: number;
  minVal: number;
  average: number;
  sumTotal: number;
  isQDiagonal: boolean;
  isRDiagonal: boolean;
}