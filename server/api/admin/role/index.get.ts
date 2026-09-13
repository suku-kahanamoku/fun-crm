import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, "/roles", { query: getQuery(event) }),
);
