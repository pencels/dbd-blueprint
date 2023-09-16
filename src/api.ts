const endpoint = "http://localhost:8080/v1/";

class ApiClient {
  public get(uri: string): Promise<Response> {
    return fetch(endpoint + uri);
  }
}
