import { defineMiddleware } from "astro:middleware";
import { Api } from "./api";

export const onRequest = defineMiddleware((context, next) => {
  (context.locals as App.Locals).api = new Api(context);
  return next();
});
