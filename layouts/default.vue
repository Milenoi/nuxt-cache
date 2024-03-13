<script setup lang="ts">
const alertLabel = useState('alert-label');
const alertStatus = useState('alert-status');
const showAlert = useState('alert-show');

</script>

<template>
  <v-layout ref="app">
        <LayoutAppBar/>

        <Transition name="fade">
          <v-alert
              v-if=showAlert
              class="custom-alert"
              :color="alertStatus ? 'success' : 'error'"
              icon="$success"
              :text="alertLabel"
          >
          </v-alert>
        </Transition>

        <v-main class="d-flex align-center justify-center">
            <slot/>
        </v-main>

       <LayoutFooter/>
  </v-layout>
</template>

<style lang="scss" scoped>
.custom-alert {
    position: fixed;
    z-index: 10;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
}
</style>
