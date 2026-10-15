//import dns from "node:dns/promises";
//dns.setServers(["1.1.1.1", "8.8.8.8"]);



import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  //await app.listen(process.env.PORT ?? 3000);
  await app.listen(3000, '0.0.0.0');
  console.log('Server is running and MongoDB Connected!');
}
bootstrap();
