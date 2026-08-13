<template>
  <div class="page-card">
    <h3 class="page-title">{{ $t('menu.faqs') }}</h3>
    <el-collapse v-model="active">
      <el-collapse-item v-for="f in faqs" :key="f.id" :name="f.id">
        <template #title>
          <b>{{ f.question }}</b>
        </template>
        <div class="faq-answer" style="white-space: pre-wrap; line-height: 1.8">{{ f.answer }}</div>
      </el-collapse-item>
    </el-collapse>
    <el-empty v-if="!faqs.length" description="暂无常见问题" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'

const faqs = ref([])
const active = ref([])

onMounted(async () => {
  try {
    faqs.value = await api.faqs()
  } catch (e) {
    // 拦截器已提示
  }
})
</script>
