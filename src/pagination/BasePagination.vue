<template>
  <div class="mt-2">
    <nav>
      <ul class="pagination justify-content-center mb-0">
        <li v-for="(link, index) in links" class="page-item" :class="{active: link.active}" :key="index">
          <component :is="tag" class="page-link" :href="link.url || '#'" v-html="link.label"/>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "BasePagination",
  props: {
    links: Array,
    tag: {
      default: 'a'
    }
  },
}
</script>
