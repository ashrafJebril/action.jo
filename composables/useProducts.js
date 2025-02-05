export const useProducts = () => {
  const config = useRuntimeConfig()
  const products = ref([])
  const loading = ref(false)
  const page = ref(1)
  const hasMore = ref(true)

  const fetchProducts = async () => {
    if (loading.value || !hasMore.value) return
    
    loading.value = true
    try {
      const response = await fetch(
        `${config.public.apiBase}/products?slug=accessories&page=${page.value}`,
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data || !data.items) {
        throw new Error('Invalid response format')
      }

      products.value = [...products.value, ...data.items]
      hasMore.value = data.items.length > 0
      page.value++
    } catch (error) {
      console.error('Error fetching products:', error.message)
      hasMore.value = false
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    products.value = []
    page.value = 1
    hasMore.value = true
  }

  return {
    products,
    loading,
    hasMore,
    fetchProducts,
    reset
  }
}