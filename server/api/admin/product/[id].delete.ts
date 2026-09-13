import { phpApiFetch } from "@/server/utils/phpApi";

export default defineEventHandler((event) =>
  phpApiFetch(event, `/products/${event.context.params?.id}`, {
    method: "DELETE",
  }),
);
