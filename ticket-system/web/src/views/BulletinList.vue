<template>
  <div class="page-card">
    <h3 class="page-title">{{ $t('menu.bulletins') }}</h3>
    <el-timeline>
      <el-timeline-item v-for="b in bulletins" :key="b.id" :timestamp="fmtTime(b.createdAt)" placement="top">
        <el-card shadow="never">
          <b>{{ b.title }}</b>
          <div class="bulletin-content" style="white-space: pre-wrap; line-height: 1.8; margin-top: 8px; color: #606266">{{ b.content }}</div>
        </el-card>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-if="!bulletins.length" description="暂无公告" />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../api'
import { fmtTime } from '../utils/status'

const bulletins = ref([])

onMounted(async () => {
  try {
    bulletins.value = await api.bulletins()
  } catch (e) {
    // 拦截器已提示
  }
})
</script>
