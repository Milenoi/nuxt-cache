<script setup lang="ts">
import { AppWindow } from "@lucide/vue";
import type { Component } from "vue";
import { how } from "~/assets/json/static-text.json";

useSeoMeta({
  title: "How it works - Nuxt Cache",
  description:
    "How three caches — Redis, TanStack Vue Query and the browser — sit between you and NASA's APOD API to make it feel instant.",
  ogTitle: "How it works — Nuxt Cache",
  ogDescription:
    "The caching architecture behind Nuxt Cache: NASA APOD → Redis (server) → Vue Query (client) → your browser.",
  twitterTitle: "How it works — Nuxt Cache",
  twitterDescription:
    "The caching architecture behind Nuxt Cache: NASA APOD → Redis (server) → Vue Query (client) → your browser.",
});

type StepMeta = {
  img?: string;
  icon?: Component;
  nodeBorder: string;
  roleClass: string;
};

// Visual bits per timeline step; copy lives in static-text.json.
const stepMeta: StepMeta[] = [
  { img: "/svg/marks/nasa.svg", nodeBorder: "border-white/[0.14]", roleClass: "text-white/65" },
  { img: "/svg/marks/redis.svg", nodeBorder: "border-[rgba(248,113,113,0.35)]", roleClass: "text-redis" },
  { img: "/svg/marks/query.svg", nodeBorder: "border-[rgba(56,189,248,0.35)]", roleClass: "text-tanstack" },
  { icon: AppWindow, nodeBorder: "border-white/[0.14]", roleClass: "text-text-muted" },
];

const steps = how.steps.map((step, i) => ({
  ...step,
  meta: stepMeta[i] as StepMeta,
}));
</script>

<template>
  <section
    class="mx-auto min-h-screen max-w-3xl px-5 pb-40 pt-32 md:px-8 [animation:fadeUp_0.4s_ease]"
  >
    <div class="text-center">
      <div class="mb-3 text-[15px] font-medium tracking-[0.01em] text-text-muted">
        {{ how.tagline }}
      </div>
      <h1
        class="m-0 mb-5 font-serif text-[clamp(46px,6vw,72px)] font-normal leading-none tracking-tight"
      >
        {{ how.heading }}
      </h1>
      <p class="mx-auto mb-12 max-w-[54ch] text-base leading-relaxed text-text-secondary">
        {{ how.leadBefore
        }}<span class="text-text-strong">{{ how.leadHighlight }}</span
        >{{ how.leadAfter }}
      </p>

      <ol class="mx-auto flex max-w-md list-none flex-col text-left">
        <li v-for="(step, i) in steps" :key="step.name" class="flex gap-5">
          <!-- node + connector -->
          <div class="flex flex-col items-center">
            <div
              class="grid size-[50px] flex-none place-items-center rounded-full border bg-surface-panel"
              :class="step.meta.nodeBorder"
            >
              <img
                v-if="step.meta.img"
                :src="step.meta.img"
                alt=""
                class="h-4 w-auto"
              >
              <component
                :is="step.meta.icon"
                v-else
                class="h-5 w-5 text-text-secondary"
              />
            </div>
            <div
              v-if="i < steps.length - 1"
              class="my-2.5 w-px flex-1 bg-white/10"
            />
          </div>
          <!-- text -->
          <div class="pb-8">
            <div class="mb-1.5 flex items-center gap-3">
              <span class="text-[17px] font-medium">{{ step.name }}</span>
              <span class="text-[11px]" :class="step.meta.roleClass">
                {{ step.role }}
              </span>
            </div>
            <p
              class="m-0 max-w-[48ch] text-[14.5px] leading-relaxed text-text-secondary"
            >
              {{ step.desc }}
            </p>
          </div>
        </li>
      </ol>

      <!-- Usage guide: what the cache controls do -->
      <div class="mt-20 border-t border-white/[0.08] pt-14 text-center">
        <h2 class="m-0 font-serif text-[clamp(28px,3.4vw,40px)] font-normal tracking-tight">
          {{ how.guideHeading }}
        </h2>
        <p class="mx-auto mt-3 max-w-[52ch] text-[15px] leading-relaxed text-text-secondary">
          {{ how.guideLead }}
        </p>

        <div class="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
          <div
            v-for="tip in how.guide"
            :key="tip.title"
            class="rounded-2xl border border-[#17171a] bg-surface-card p-6 text-left"
          >
            <div class="mb-2 text-[15px] font-medium text-foreground">
              {{ tip.title }}
            </div>
            <p class="m-0 text-sm leading-relaxed text-text-secondary">
              {{ tip.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
