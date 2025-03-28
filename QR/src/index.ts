import app from "./app";

async function bootstrap() {
  const PORT = process.env.SERVER_PORT;
  app.listen(PORT, () => {
    console.log(`the server is running on the port ${PORT}`);
  });
}

bootstrap();
