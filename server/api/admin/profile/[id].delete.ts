import { phpApiFetch } from "@/server/utils/phpApi";
export default defineEventHandler((event) => phpApiFetch(event, `/customer-profiles/${event.context.params?.id}`, { method: "DELETE" }));
