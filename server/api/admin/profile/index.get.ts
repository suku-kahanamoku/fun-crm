import { phpApiFetch } from "@/server/utils/phpApi";
export default defineEventHandler((event) => phpApiFetch(event, "/customer-profiles", { query: getQuery(event) }));
