import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler(async (event) =>
  phpApiFetch(event, `/users/${event.context.params?.id}`, {
    method: "PATCH",
    body: await readBody(event),
  }),
);
