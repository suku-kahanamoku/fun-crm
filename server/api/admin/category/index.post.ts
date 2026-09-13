import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler(async (event) =>
  phpApiFetch(event, "/categories", {
    method: "POST",
    body: await readBody(event),
  }),
);
