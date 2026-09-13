import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, "/users", { query: getQuery(event) }),
);
