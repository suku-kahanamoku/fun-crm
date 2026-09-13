export default defineNuxtConfig({
  compatibilityDate: "2026-05-04",
  ssr: true,

  site: {
    url: process.env.FRONTEND_HOST,
    name: "FAnn CRM",
    trailingSlash: false,
  },

  devtools: { enabled: process.env.NODE_ENV !== "production" },

  hooks: {
    "components:extend": (components) => {
      queueMicrotask(() => {
        for (let index = components.length - 1; index >= 0; index -= 1) {
          if (components[index]?.pascalName === "NuxtPicture") {
            components.splice(index, 1);
          }
        }
      });
    },
  },

  colorMode: {
    classSuffix: "",
    preference: "light",
    fallback: "light",
  },

  modules: [
    "@nuxt/image",
    "nuxt-site-config",
    "@suku-kahanamoku/seo-module",
    "@suku-kahanamoku/auth-module",
    "@suku-kahanamoku/menu-module",
    "@suku-kahanamoku/form-module",
    "@suku-kahanamoku/ui-module",
    "@suku-kahanamoku/lang-module",
    "@suku-kahanamoku/common-module",
  ],

  authModule: {
    protectedPages: ["/admin"],
  },

  seoModule: {
    fontaineEnabled: false,
  },

  css: ["@/assets/css/main.css"],

  ui: {
    prefix: "U",
  },

  runtimeConfig: {
    internalApiKey: process.env.INTERNAL_API_KEY,
    phpApiBaseUrl:
      process.env.PHP_API_BASE_URL || "http://127.0.0.1/php/php-core/api",
    phpFileRoot:
      process.env.PHP_FILE_ROOT || "/home/suku/Workspace/php/php-core",
    public: {
      frontendHost: process.env.FRONTEND_HOST || "http://fun.localhost:3000",
    },
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },

  pwa: {
    registerType: "autoUpdate",
    workbox: {
      navigateFallback: undefined,
    },
  },

  i18n: {
    defaultLocale: "cs",
    langDir: "locales/",
    locales: [
      {
        code: "cs",
        language: "cs-CZ",
        icon: "emojione:flag-for-czechia",
        file: "./cs.json",
      },
      {
        code: "en",
        language: "en-US",
        icon: "emojione:flag-for-united-kingdom",
        file: "./en.json",
      },
    ],
  },
});
