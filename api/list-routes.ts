import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  await app.init();
  
  const server = app.getHttpServer();
  const router = server._events.request._router;

  if (router && router.stack) {
    const availableRoutes = router.stack
      .map((layer: any) => {
        if (layer.route) {
          return {
            path: layer.route?.path,
            method: Object.keys(layer.route.methods)[0].toUpperCase(),
          };
        }
      })
      .filter((item: any) => item !== undefined);
    console.log(JSON.stringify(availableRoutes, null, 2));
  } else {
    // Try another way to get routes in NestJS
    const container = (app as any).container;
    const modules = container.getModules();
    modules.forEach((module: any) => {
      const controllers = module.controllers;
      controllers.forEach((controller: any) => {
        console.log(`Controller: ${controller.name}`);
      });
    });
  }
  process.exit(0);
}
bootstrap();
