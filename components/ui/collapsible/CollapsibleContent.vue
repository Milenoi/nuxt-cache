<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { CollapsibleContent, type CollapsibleContentProps, useForwardProps } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<CollapsibleContentProps & { class?: HTMLAttributes["class"] }>()

const forwarded = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <CollapsibleContent
    data-slot="collapsible-content"
    v-bind="useForwardProps(forwarded)"
    :class="
      cn(
        'overflow-hidden data-[state=open]:[animation:collapsible-down_0.22s_ease-out] data-[state=closed]:[animation:collapsible-up_0.22s_ease-out]',
        props.class,
      )
    "
  >
    <slot />
  </CollapsibleContent>
</template>
