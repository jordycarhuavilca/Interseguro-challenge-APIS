export function isValidMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.length > 0 &&
    matrix.every(
      (row) =>
        Array.isArray(row) &&
        row.length === matrix[0].length &&
        row.every((value) => typeof value === "number" && !isNaN(value))
    )
  );
}
