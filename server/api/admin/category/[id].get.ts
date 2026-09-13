import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, `/categories/${event.context.params?.id}`, {
    query: getQuery(event),
  }),
);
