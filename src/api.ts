import type { APIContext, AstroGlobal } from "astro";

const endpoint = "http://localhost:8080/v1/";

export class Api {
  context: APIContext;

  constructor(context: APIContext) {
    this.context = context;
  }

  get(uri: string): Promise<Response> {
    return fetch(endpoint + uri, {
      mode: "cors",
      credentials: "include",
      headers: {
        Cookie: this.context.request.headers.get("Cookie")!,
      },
    });
  }
}
