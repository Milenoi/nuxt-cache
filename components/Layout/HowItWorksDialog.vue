<script setup lang="ts">
import { common } from "~/assets/json/static-text.json";
</script>

<template>
  <v-dialog max-width="640" scrollable transition="fade-transition">
    <template #activator="{ props: activatorProps }">
      <button type="button" class="how-link" v-bind="activatorProps">
        {{ common.howItWorks }}
      </button>
    </template>

    <template #default="{ isActive }">
      <v-card class="how-card">
        <v-card-title class="how-title">How this cache demo works</v-card-title>

        <v-card-text class="how-body">
          <p>
            Two independent cache layers sit between you and NASA. The badges on
            the image show where the current data came from.
          </p>

          <h3>The two layers</h3>
          <ul>
            <li>
              <strong>Redis (server):</strong> shared server cache, 24&nbsp;h.
              Responses are tagged, so the badge shows <em>redis</em> (cached) or
              <em>nasa</em> (fresh).
            </li>
            <li>
              <strong>TanStack Query (client):</strong> a cache in your browser.
              When its badge shows, the current view is held there.
            </li>
          </ul>

          <h3>The buttons</h3>
          <ul>
            <li>
              <strong>Vue Query: Invalidate Cache</strong> — marks the browser
              cache stale and refetches: from Redis if it's filled, otherwise
              NASA. The message shows which, plus the fetch time.
            </li>
            <li>
              <strong>Redis Database: Clear Cache</strong> — empties only the
              server cache. The image stays (browser cache), but the badge flips
              to <em>nasa</em> for the next real fetch.
            </li>
          </ul>

          <h3>Try it</h3>
          <ol>
            <li>Clear Redis → badge shows <em>nasa</em>, image stays.</li>
            <li>Invalidate → loader shows NASA (Redis empty), see the message.</li>
            <li>Invalidate again → Redis refilled, now it's Redis — much faster.</li>
          </ol>

          <p class="how-note">
            You can also just reload the page. Right after clearing Redis the
            reload takes noticeably longer, because the server has to fetch from
            NASA again before it can cache and render — reload once more and it's
            instant from Redis.
          </p>
        </v-card-text>

        <v-card-actions class="how-actions">
          <v-spacer />
          <v-btn variant="text" @click="isActive.value = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </v-dialog>
</template>

<style lang="scss" scoped>
.how-link {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  background: none;
  border: 0;
  padding: 0;
  font: inherit;

  &:hover {
    opacity: 0.75;
  }
}

.how-card {
  max-height: 69vh;
  min-height: 300px;
}

.how-title {
  padding: 20px 24px 14px !important;
  white-space: normal;
  line-height: 1.3;
}

.how-actions {
  padding: 8px 16px 12px !important;
}

.how-body {
  padding-top: 0;

  > :first-child {
    margin-top: 0;
  }

  > :last-child {
    margin-bottom: 0;
  }

  p {
    margin-bottom: 0.5rem;
  }

  .how-note {
    margin-top: 0.85rem;
    opacity: 0.85;
  }

  h3 {
    margin-top: 0.85rem;
    margin-bottom: 0.35rem;
    font-size: 0.95rem;
  }

  ul,
  ol {
    padding-left: 1.25rem;

    li {
      margin-bottom: 0.3rem;
    }
  }

  code {
    font-size: 0.85em;
    padding: 1px 5px;
    border-radius: 4px;
    background: rgb(255 255 255 / 10%);
  }
}
</style>
