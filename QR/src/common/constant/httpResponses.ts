export type Response = {
  success: boolean;
  data: any;
  message: string;
};

type HttpStatusBodyStructure = {
  CODE: number;
  MESSAGE: string;
};

type HTTP_RESPONSE = {
  OK: HttpStatusBodyStructure;
  CREATED: HttpStatusBodyStructure;
  NOT_FOUND: HttpStatusBodyStructure;
  BAD_REQUEST: HttpStatusBodyStructure;
  UNEXPECTED_ERROR: HttpStatusBodyStructure;
  INTERNAL_SERVER_ERROR: HttpStatusBodyStructure;
  UNAUTHORIZED: HttpStatusBodyStructure;
};

export const HttpStatus: HTTP_RESPONSE = {
  OK: {
    CODE: 200,
    MESSAGE: "Ok",
  },
  CREATED: {
    CODE: 201,
    MESSAGE: "Created",
  },
  NOT_FOUND: {
    CODE: 404,
    MESSAGE: "Not Found",
  },
  BAD_REQUEST: {
    CODE: 400,
    MESSAGE: "Bad Request",
  },
  UNEXPECTED_ERROR: {
    CODE: 400,
    MESSAGE: "An error occurred",
  },
  UNAUTHORIZED: {
    CODE: 401,
    MESSAGE: "Unauthorized",
  },
  INTERNAL_SERVER_ERROR: {
    CODE: 500,
    MESSAGE: "Internal Server Error",
  },
};
