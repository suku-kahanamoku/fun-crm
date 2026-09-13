import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler(async (event) =>
  phpApiFetch(event, "/files/commit", {
    method: "POST",
    body: await readBody(event),
  }),
);
