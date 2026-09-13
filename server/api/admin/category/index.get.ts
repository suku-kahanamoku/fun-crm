import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, "/categories", { query: getQuery(event) }),
);
