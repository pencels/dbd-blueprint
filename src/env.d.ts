/// <reference types="astro/client" />

import type { Api } from "./api";

declare namespace App {
  interface Locals {
    api: Api;
  }
}
