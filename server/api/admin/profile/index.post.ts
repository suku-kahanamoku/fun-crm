import { phpApiFetch } from "@/server/utils/phpApi";
export default defineEventHandler(async (event) => phpApiFetch(event, "/customer-profiles", { method: "POST", body: await readBody(event) }));
