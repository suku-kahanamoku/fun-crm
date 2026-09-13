import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler(async (event) =>
  phpApiFetch(event, "/products", {
    method: "POST",
    body: await readBody(event),
  }),
);
