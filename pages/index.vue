<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <ClientOnly>
          <template v-if="pending">
            <ProductCard v-for="n in 8" :key="n" />
          </template>
          <template v-else-if="products?.length">
            <ProductCard
              v-for="product in products"
              :key="product.productId"
              :product="product"
            />
          </template>
          <template #fallback>
            <ProductCard v-for="n in 8" :key="n" />
          </template>
        </ClientOnly>
      </div>

      <div
        v-if="hasMore"
        ref="loadMoreTrigger"
        class="h-20 flex items-center justify-center mt-8"
      >
        <div v-if="loading" class="text-gray-600">Loading more products...</div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from '#app'

// SEO Meta Tags
useHead({
  title: 'Products - Your Store Name',
  meta: [
    { name: 'description', content: 'Browse our collection of high-quality accessories and products.' },
    { name: 'keywords', content: 'accessories, products, online store' },
    // Open Graph
    { property: 'og:title', content: 'Products - Your Store Name' },
    { property: 'og:description', content: 'Browse our collection of high-quality accessories and products.' },
    { property: 'og:type', content: 'website' },
    // Twitter
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Products - Your Store Name' },
    { name: 'twitter:description', content: 'Browse our collection of high-quality accessories and products.' }
  ]
})

const route = useRoute()
const loading = ref(false)
const hasMore = ref(true)
const loadMoreTrigger = ref(null)
const observer = ref(null)

const currentPage = ref(parseInt(String(route.query.page)) || 1)

// Server-side data fetching with proper state management
const { data: products, pending, refresh } = await useLazyAsyncData(
  'products',
  () => $fetch('/api/products', {
    params: {
      page: currentPage.value,
      slug: 'accessories'
    }
  }),
  {
    transform: (response) => response?.items || [],
    server: true,
    immediate: true
  }
)

const fetchNextPage = async () => {
  if (loading.value || !hasMore.value) return
  
  loading.value = true
  try {
    currentPage.value++
    
    const response = await $fetch('/api/products', {
      params: {
        page: currentPage.value,
        slug: 'accessories'
      }
    })
    
    const newItems = response?.items || []
    if (products.value) {
      products.value = [...products.value, ...newItems]
    }
    hasMore.value = newItems.length > 0
    
    // Update URL without causing a reload
    if (process.client) {
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set('page', currentPage.value.toString())
      window.history.pushState({}, '', newUrl)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

// Watch for manual page navigation
watch(
  () => route.query.page,
  async (newPage) => {
    if (newPage === '1') {
      currentPage.value = 1
      hasMore.value = true
      await refresh()
    }
  }
)

onMounted(() => {
  observer.value = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      fetchNextPage()
    }
  }, { threshold: 0.5 })

  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
})

onUnmounted(() => {
  if (observer.value && loadMoreTrigger.value) {
    observer.value.unobserve(loadMoreTrigger.value)
  }
})
</script>