<template>
  <div class="page-card">
    <h3 class="page-title">{{ $t('ask.title') }}</h3>
    <div class="ask-box">
      <el-input
        v-model="question"
        size="large"
        :placeholder="$t('ask.placeholder')"
        clearable
        @keyup.enter="ask"
      />
      <el-button type="primary" size="large" :loading="loading" @click="ask">{{ $t('ask.search') }}</el-button>
    </div>

    <template v-if="result">
      <el-alert v-if="result.answer" type="success" :closable="false" class="answer-box">
        <template #title>
          <div class="answer-head">
            <b>{{ $t('ask.matched') }}</b>
            <el-tag size="small" :type="result.source === 'llm' ? 'warning' : 'info'">
              {{ result.source === 'llm' ? $t('ask.sourceLlm') : $t('ask.sourceKb') }}
            </el-tag>
          </div>
        </template>
        <div class="answer-text">{{ result.answer }}</div>
      </el-alert>

      <div v-if="result.matches && result.matches.length" class="mt16">
        <el-collapse>
          <el-collapse-item v-for="m in result.matches" :key="m.id" :name="m.id">
            <template #title><b>{{ m.question }}</b></template>
            <div style="white-space: pre-wrap">{{ m.answer }}</div>
          </el-collapse-item>
        </el-collapse>
      </div>

      <div v-if="result.suggestTicket" class="mt16">
        <el-empty :description="$t('ask.noMatch')" :image-size="80">
          <el-button type="primary" @click="$router.push('/tickets/new')">{{ $t('ask.submitTicket') }}</el-button>
        </el-empty>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { api } from '../api'

const question = ref('')
const result = ref(null)
const loading = ref(false)

async function ask() {
  if (!question.value.trim()) return
  loading.value = true
  try {
    result.value = await api.aiAsk(question.value.trim())
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ask-box {
  display: flex;
  gap: 10px;
}
.answer-box {
  margin-top: 16px;
}
.answer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.answer-text {
  white-space: pre-wrap;
  line-height: 1.8;
  color: #303133;
}
.mt16 {
  margin-top: 16px;
}
</style>
