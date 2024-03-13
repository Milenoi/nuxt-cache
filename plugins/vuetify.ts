// import this after install `@mdi/font` package
import '@mdi/font/css/materialdesignicons.css'
import {md3} from 'vuetify/blueprints'

import 'vuetify/styles'
import {aliases, mdi} from 'vuetify/iconsets/mdi'
import {createVuetify} from 'vuetify'
import colors from 'vuetify/util/colors'

export default defineNuxtPlugin((app) => {
    const vuetify = createVuetify({
        ssr: true,
        blueprint: md3,
        theme: {
            defaultTheme: 'dark',
            themes: {
                dark: {
                    colors: {
                        primary: colors.grey.darken4,
                        secondary: colors.grey.lighten4,
                    },
                },
            },
        },
        icons: {
            defaultSet: 'mdi',
            aliases,
            sets: {
                mdi,
            },
        },
    })
    app.vueApp.use(vuetify)
})


