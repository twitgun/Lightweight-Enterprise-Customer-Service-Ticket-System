<template>
  <div>
    <div class="page-card">
      <h3 class="page-title">{{ $t('manager.aiConfig') }}</h3>
      <el-form :model="aiForm" label-width="160px" style="max-width: 640px">
        <el-form-item :label="$t('manager.aiEnabled')">
          <el-switch v-model="aiForm.enabled" />
        </el-form-item>
        <el-form-item :label="$t('manager.autoAssign')">
          <el-switch v-model="aiForm.autoAssign" />
        </el-form-item>
        <el-form-item :label="$t('manager.aiProvider')">
          <el-input v-model="aiForm.provider" placeholder="openai / deepseek / 任意兼容接口" />
        </el-form-item>
        <el-form-item :label="$t('manager.aiApiUrl')">
          <el-input v-model="aiForm.apiUrl" placeholder="https://api.openai.com/v1" />
        </el-form-item>
        <el-form-item :label="$t('manager.aiApiKey')">
          <el-input v-model="aiForm.apiKey" type="password" show-password placeholder="sk-..." />
        </el-form-item>
        <el-form-item :label="$t('manager.aiModel')">
          <el-input v-model="aiForm.model" placeholder="gpt-4o-mini" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="saving" @click="saveAi">{{ $t('common.save') }}</el-button>
          <span class="text-muted" style="margin-left: 12px">未配置 API Key 时，AI 功能自动使用本地规则兜底</span>
        </el-form-item>
      </el-form>
    </div>

    <div class="page-card mt16">
      <h3 class="page-title">{{ $t('manager.slaConfig') }}</h3>
      <el-table :data="slaList" size="small">
        <el-table-column label="优先级" width="120">
          <template #default="{ row }">
            <el-tag :type="PRIORITY[row.priority]?.type" size="small">{{ $t(PRIORITY[row.priority]?.labelKey) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('manager.responseHours')" width="220">
          <template #default="{ row }">
            <el-input-number v-model="row.responseHours" :min="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('manager.resolveHours')" width="220">
          <template #default="{ row }">
            <el-input-number v-model="row.resolveHours" :min="1" size="small" />
          </template>
        </el-table-column>
        <el-table-column :label="$t('common.action')">
          <template #default="{ row }">
            <el-button link type="primary" @click="saveSla(row)">{{ $t('common.save') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../../api'
import { PRIORITY } from '../../utils/status'

const aiForm = reactive({ enabled: false, autoAssign: false, provider: 'openai', apiUrl: '', apiKey: '', model: '' })
const slaList = ref([])
const saving = ref(false)

async function load() {
  try {
    const [cfg, sla] = await Promise.all([api.aiConfig(), api.slaPolicies()])
    Object.assign(aiForm, cfg)
    slaList.value = sla
  } catch (e) {
    // 拦截器已提示
  }
}

async function saveAi() {
  saving.value = true
  try {
    await api.saveAiConfig({ ...aiForm })
    ElMessage.success('AI 配置已保存')
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

async function saveSla(row) {
  try {
    await api.updateSla(row.priority, { responseHours: row.responseHours, resolveHours: row.resolveHours })
    ElMessage.success('SLA 已保存')
  } catch (e) {
    // 拦截器已提示
  }
}

onMounted(load)
</script>

<style scoped>
.mt16 {
  margin-top: 16px;
}
</style>
