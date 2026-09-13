export default defineAppConfig({
  ui: {
    colors: {
      primary: "primary",
      secondary: "secondary",
      info: "blue",
      success: "green",
      warning: "amber",
      error: "red",
      neutral: "slate",
    },
    button: {
      slots: {
        base: "rounded-xl font-bold shadow-sm transition-all duration-200 active:scale-[0.98]",
      },
    },
    card: {
      slots: {
        root: "rounded-2xl border border-default/80 bg-default/90 shadow-sm ring-0 backdrop-blur-sm",
        header: "border-b border-default/70 px-5 py-4 sm:px-6",
        body: "px-5 py-5 sm:px-6",
        footer: "border-t border-default/70 px-5 py-4 sm:px-6",
      },
    },
    input: {
      slots: { root: "rounded-xl" },
    },
    select: {
      slots: { base: "rounded-xl" },
    },
  },
});
