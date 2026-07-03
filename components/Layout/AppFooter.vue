<template>
  <v-footer name="footer" height="48" app>
    <div class="footer-inner">
      <p class="footer-copy">
        {{ new Date().getFullYear() }} —
        <strong>Nuxt Cache</strong>
      </p>
      <LayoutHowItWorksDialog />
    </div>
  </v-footer>
</template>

<style lang="scss" scoped>
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1520px;
  margin-inline: auto;
}

.footer-copy {
  margin: 0;
}
</style>
