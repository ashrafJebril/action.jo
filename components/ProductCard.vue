<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
    <div v-if="!product" class="animate-pulse">
      <div class="h-48 bg-gray-200"></div>
      <div class="p-4 space-y-3">
        <div class="h-4 bg-gray-200 rounded w-3/4"></div>
        <div class="h-4 bg-gray-200 rounded w-1/2"></div>
        <div class="h-6 bg-gray-200 rounded w-1/4"></div>
      </div>
    </div>
    <template v-else>
      <div class="relative h-48 overflow-hidden">
        <TransitionGroup 
          name="slide" 
          tag="div" 
          class="h-full"
        >
          <div 
            v-for="(image, index) in product.media?.gallery" 
            :key="image.id"
            v-show="currentSlide === index"
            class="absolute w-full h-full"
          >
            <NuxtImg 
              :src="image.src" 
              :alt="product.name"
              width="400"
              height="300"
              loading="lazy"
              format="webp"
              class="w-full h-full object-cover"
            />
          </div>
        </TransitionGroup>
        
        <div v-if="product.media?.gallery?.length > 1" class="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
          <button
            v-for="(_, index) in product.media.gallery"
            :key="index"
            @click="currentSlide = index"
            class="w-2 h-2 rounded-full transition-colors"
            :class="currentSlide === index ? 'bg-blue-600' : 'bg-white/70'"
          ></button>
        </div>

        <button 
          v-if="product.media?.gallery?.length > 1"
          @click="prevSlide"
          class="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-1 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          v-if="product.media?.gallery?.length > 1"
          @click="nextSlide"
          class="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 hover:bg-white/70 rounded-full p-1 z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div class="p-4">
        <h3 class="text-lg font-semibold text-gray-800">{{ product.name }}</h3>
        <p class="text-sm text-gray-600 mt-1 line-clamp-3" v-html="product.description"></p>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Brand:</span>
            <span class="text-sm font-medium">{{ product.brand }}</span>
          </div>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            View Details
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  product: {
    type: Object,
    default: null
  }
})

const currentSlide = ref(0)
let slideInterval = null

const nextSlide = () => {
  if (!props.product?.media?.gallery) return
  currentSlide.value = (currentSlide.value + 1) % props.product.media.gallery.length
}

const prevSlide = () => {
  if (!props.product?.media?.gallery) return
  currentSlide.value = currentSlide.value === 0 
    ? props.product.media.gallery.length - 1 
    : currentSlide.value - 1
}

onMounted(() => {
  if (props.product?.media?.gallery?.length > 1) {
    slideInterval = setInterval(nextSlide, 5000)
  }
})

onUnmounted(() => {
  if (slideInterval) {
    clearInterval(slideInterval)
  }
})
</script>

<style scoped>
.slide-move {
  transition: all 0.5s ease;
}

.slide-enter-active {
  transition: all 0.5s ease;
}

.slide-leave-active {
  transition: all 0.5s ease;
  position: absolute;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(-100%);
}
</style>