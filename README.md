# Documentación Técnica del Proyecto API-QR

## 1. Introducción

Este documento proporciona una descripción detallada de la arquitectura, el diseño y la funcionalidad de la API-QR. El objetivo es ofrecer una visión completa para que una consultora externa comprenda el alcance del proyecto y pueda realizar evaluaciones y análisis pertinentes.

## 2. Resumen del Proyecto

La API-QR es una aplicación construida con Node.js y Express que permite realizar la factorización QR de una matriz numérica. Además, proporciona funcionalidades para obtener especificaciones estadísticas básicas sobre las matrices resultantes (Q y R). La API está diseñada siguiendo principios de REST y utiliza contenedores Docker para su despliegue.

## 3. Arquitectura General

El proyecto sigue una arquitectura modular, dividida en las siguientes capas principales:

*   **Capa de Presentación (Routes/Controllers):**  Recibe las peticiones HTTP, las valida y las delega a la capa de negocio.
*   **Capa de Negocio (Services):** Contiene la lógica principal de la aplicación, incluyendo la factorización QR y el cálculo de especificaciones.
*   **Capa de Integración (Providers/RequestService):**  Se encarga de realizar peticiones a servicios externos, en este caso, a una API de "operations" para obtener especificaciones de las matrices.
*   **Capa de Excepciones (Exceptions):** Define las excepciones personalizadas que se utilizan para el manejo de errores.
*   **Capa de Configuración (Env):** Permite leer las variables de entorno, necesarios para la ejecucion del programa.

## 4. Componentes del Proyecto

### 4.1. Archivos de Configuración

*   **.env:** Define las variables de entorno necesarias para la ejecución de la aplicación (ej. `SERVER_PORT`, `OPERATIONS_BASE_URL`).
*   **docker-compose.yml:**  Define la configuración del contenedor Docker, incluyendo la imagen a construir, las variables de entorno, el mapeo de puertos y las redes.
    ```yaml
    version: "3.8"
    services:
      app:
        build:
          context: .
        container_name: API-QR
        networks:
          - app_network
        environment:
          - SERVER_PORT=${SERVER_PORT}
          - OPERATIONS_BASE_URL=${OPERATIONS_BASE_URL}
        ports:
          - ":"
    networks:
      app_network:
        driver: bridge
    ```

### 4.2. Dockerfile

El `Dockerfile` se utiliza para construir la imagen Docker de la aplicación.  Se compone de dos etapas:

*   **Etapa de Construcción (builder):** Instala las dependencias, copia el código fuente y compila la aplicación.
*   **Etapa de Ejecución:**  Copia los artefactos compilados y las dependencias necesarias desde la etapa de construcción y define el comando para ejecutar la aplicación.

    ```dockerfile
    # Etapa 1: Construcción
    FROM node:22 AS builder

    # Establecer directorio de trabajo en el contenedor
    WORKDIR /app

    # Copiar package.json y package-lock.json
    COPY package*.json ./

    # Instalar dependencias
    RUN npm install

    # Copiar el resto de los archivos de la aplicación
    COPY . .

    # Compilar la aplicación
    RUN npm run build

    # Etapa 2: Ejecución
    FROM node:22

    # Establecer directorio de trabajo en el contenedor
    WORKDIR /app

    # Copiar las dependencias instaladas desde la etapa de construcción
    COPY --from=builder /app/node_modules ./node_modules

    # Copiar el código compilado desde la etapa de construcción
    COPY --from=builder /app/dist ./dist

    # Copiar archivos de configuración necesarios (opcional)
    COPY --from=builder /app/package*.json ./

    # Comando para ejecutar la aplicación
    # CMD ["/bin/bash", "-c", "node /app/dist/index.js"]
    CMD ["tail", "-f", "/dev/null"]
    ```

### 4.3. Archivos de la Aplicación (Node.js/Express)

*   **index.ts (Archivo principal):** Inicializa la aplicación Express, configura los middlewares y define el puerto de escucha.

    ```typescript
    import express from "express";
    import router from "./routes";
    import cors from "cors";
    import { Request, Response, NextFunction } from "express";
    import { HttpException } from "./common/exception";
    import { HttpStatus } from "./common/constant/httpResponses";

    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use("/api", router);

    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
      const defaultHttpCode = HttpStatus.INTERNAL_SERVER_ERROR.CODE;
      const status = err instanceof HttpException ? err.code : defaultHttpCode;
      const message = err.message;

      res.status(status).json({
        error: message,
      });
      next();
    });

    export default app;
    ```

*   **server.ts:**  Arranca el servidor Express en el puerto especificado en la variable de entorno `SERVER_PORT`.

    ```typescript
    import app from "./app";

    async function bootstrap() {
      const PORT = process.env.SERVER_PORT;

      app.listen(PORT, () => {
        console.log(`the server is running on the port ${PORT}`);
      });
    }

    bootstrap();
    ```

*   **routes/index.ts:** Define las rutas principales de la API.

    ```typescript
    import { Router } from "express";
    import QRRouter from "../qr/qr.route";

    const router = Router();
    router.use(QRRouter);

    export default router;
    ```

*   **qr/qr.route.ts:** Define las rutas específicas para la funcionalidad QR (ej. `/qr/factorization`).

    ```typescript
    import { Router } from "express";
    import QrController from "./qr.controller";
    const QRRouter = Router();

    QRRouter.post("/qr/factorization", QrController.factorization);

    export default QRRouter;
    ```

*   **qr/qr.controller.ts:**  Implementa los controladores para las rutas QR. Recibe la petición, invoca el servicio correspondiente y devuelve la respuesta al cliente.

    ```typescript
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
    ```

*   **qr/qr.service.ts:** Implementa la lógica de negocio para la factorización QR. Utiliza la biblioteca `mathjs` para realizar la factorización y llama al `QrProvider` para obtener especificaciones adicionales.

    ```typescript
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
        const specifications = await QrProvider.getQrSpecifications({ Q, R } as any);

        const result = {
          qr: { Q, R },
          specifications,
        };

        return result;
      }
    }
    ```

*   **qr/qr.provider.ts:** Se encarga de interactuar con la API externa de "operations" para obtener especificaciones de las matrices Q y R.

    ```typescript
    import axios from "axios";
    import { ResponseGetSpecification } from "./dto";

    export class QrProvider {
      private static baseUrl: string = process.env.OPERATIONS_BASE_URL;

      static async getQrSpecifications(incomeData: {
        Q: [][];
        R: [][];
      }): Promise<ResponseGetSpecification> {
        const url = `${QrProvider.baseUrl}/specifications`;
        const { data } = await axios.get(url, {
          data: incomeData,
        });

        const result = data.data;

        return result;
      }
    }
    ```

*   **common/exception/HttpExeption.ts:**  Define la clase `HttpException` para manejar errores HTTP personalizados.

    ```typescript
    export class HttpException extends Error {
      private _code: number;
      constructor(message: string, code: number) {
        super(message);
      }
      get code() {
        return this._code;
      }
    }
    ```

*   **common/constant/httpResponses.ts:** Define constantes para los códigos y mensajes de respuesta HTTP.

    ```typescript
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
    ```

*   **common/utils/validate.ts:**  Contiene funciones de utilidad, como `isValidMatrix`, para validar el formato de la matriz de entrada.

    ```typescript
    export function isValidMatrix(matrix) {
      return (
        Array.isArray(matrix) &&
        matrix.length > 0 &&
        matrix.every(
          (row) =>
            Array.isArray(row) &&
            row.length === matrix[0].length &&
            row.every((value) => typeof value === "number" && !isNaN(value))
        );
    }
    ```

*   **qr/dto/index.ts:** Exporta todos los Data Transfer Objects (DTOs) relacionados con el módulo QR.

*   **qr/dto/matrix.dto.ts:** Define el DTO `MatrixDto` para la estructura de la matriz de entrada.

    ```typescript
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
    ```
*   **common/interface/response.ts:** Define la estructura de respuesta estandar de la API.
    ```typescript
    export interface ResponseDefault<T> {
      data: T;
      message?: string;
      success?: boolean;
      statusCode?: number;
    }
    ```

### 5. Flujo de Ejecución (Factorización QR)

1.  **Petición del Cliente:** El cliente envía una petición POST a la ruta `/api/qr/factorization` con una matriz numérica en el cuerpo de la petición.

2.  **Validación y Enrutamiento:**  La petición es recibida por el `Router` y dirigida al controlador `QrController.factorization`.

3.  **Procesamiento en el Controlador:**
    *   El controlador extrae la matriz del cuerpo de la petición.
    *   Valida si el campo `matrix` existe.
    *   Invoca el método `QrService.factorization` para realizar la factorización QR.
    *   Construye la respuesta con los resultados obtenidos del servicio.
    *   Envía la respuesta al cliente con un código de estado HTTP apropiado.

4.  **Factorización QR en el Servicio:**
    *   El servicio `QrService.factorization` recibe la matriz.
    *   Valida si la matriz tiene un formato válido utilizando la función `isValidMatrix`.
    *   Utiliza la función `qr` de la biblioteca `mathjs` para realizar la factorización QR, obteniendo las matrices Q y R.
    *   Invoca el método `QrProvider.getQrSpecifications` para obtener especificaciones adicionales de las matrices Q y R desde la API externa.
    *   Construye un objeto con las matrices Q y R, y las especificaciones obtenidas.
    *   Retorna el resultado al controlador.

5.  **Obtención de Especificaciones (QrProvider):**
    *   El `QrProvider.getQrSpecifications` recibe las matrices Q y R.
    *   Construye la URL de la API externa utilizando la variable de entorno `OPERATIONS_BASE_URL`.
    *   Realiza una petición GET a la API externa, enviando las matrices Q y R en el cuerpo de la petición.
    *   Recibe la respuesta de la API externa con las especificaciones.
    *   Retorna las especificaciones al servicio.

6.  **Respuesta al Cliente:** El controlador recibe el resultado del servicio y construye una respuesta JSON con la siguiente estructura:

        {
      "data": {
        "qr": {
          "Q": [
            [...],
            [...]
          ],
          "R": [
            [...],
            [...]
          ]
        },
        "specifications": {
          "maxVal": ...,
          "minVal": ...,
          "average": ...,
          "sumTotal": ...,
          "isQDiagonal": ...,
          "isRDiagonal": ...
        }
      },
      "message": "Ok",
      "statusCode": 200,
      "success": true
    }
    ```

## 6. Manejo de Errores

La API utiliza excepciones personalizadas (`HttpException`) para manejar errores de manera consistente.  Cuando ocurre un error, se lanza una excepción que es capturada por el middleware de manejo de errores global.  Este middleware formatea la respuesta de error con un código de estado HTTP apropiado y un mensaje descriptivo.

## 7. Consideraciones Adicionales

*   **Seguridad:** Actualmente, la API no implementa mecanismos de autenticación o autorización. Se recomienda implementar medidas de seguridad para proteger los endpoints y los datos.
*   **Logging:** Se sugiere implementar un sistema de logging robusto para facilitar la depuración y el monitoreo de la aplicación.
*   **Pruebas:**  Es crucial implementar pruebas unitarias e integración para asegurar la calidad y la estabilidad de la API.
*   **Escalabilidad:** La arquitectura actual permite una escalabilidad horizontal sencilla utilizando un balanceador de carga y múltiples instancias del contenedor Docker.

## 8. Conclusión

Este documento proporciona una visión general de la arquitectura y la funcionalidad de la API-QR. Se espera que esta información sea útil para que la consultora externa realice una evaluación completa del proyecto y proporcione recomendaciones para su mejora.
