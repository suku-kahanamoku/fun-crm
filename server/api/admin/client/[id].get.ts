import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, `/users/${event.context.params?.id}`, {
    query: getQuery(event),
  }),
);
