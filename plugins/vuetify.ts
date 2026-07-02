// import this after install `@mdi/font` package
import "@mdi/font/css/materialdesignicons.css";
import { md3 } from "vuetify/blueprints";

import "vuetify/styles";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import { createVuetify } from "vuetify";
import colors from "vuetify/util/colors";

export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    ssr: true,
    blueprint: md3,
    theme: {
      defaultTheme: "dark",
      themes: {
        dark: {
          colors: {
            primary: colors.grey.darken4,
            secondary: colors.grey.lighten4,
            // Vuetify 4 dropped the Material color utility classes
            // (bg-red-accent-2, text-orange-darken-2, ...). Re-expose the ones
            // the templates use as theme colors so those classes are generated.
            "red-accent-2": colors.red.accent2,
            "red-accent-3": colors.red.accent3,
            "orange-darken-2": colors.orange.darken2,
            "grey-lighten-1": colors.grey.lighten1,
          },
        },
      },
    },
    icons: {
      defaultSet: "mdi",
      aliases,
      sets: {
        mdi,
      },
    },
  });
  app.vueApp.use(vuetify);
});
