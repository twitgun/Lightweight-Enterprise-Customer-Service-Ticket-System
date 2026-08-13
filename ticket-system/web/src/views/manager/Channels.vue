<template>
  <div class="page-card">
    <h3 class="page-title">{{ $t('manager.channels') }}</h3>
    <el-alert type="info" :closable="false" class="mb16">
      渠道入站通过 webhook 接收（微信/企业微信/邮件真实接入时在此配置凭证并开启），未启用时无法创建外来工单。
    </el-alert>
    <el-table v-loading="loading" :data="list">
      <el-table-column prop="type" label="类型" width="120" />
      <el-table-column prop="name" :label="$t('manager.channelName')" min-width="140" />
      <el-table-column :label="$t('manager.channelEnabled')" width="110">
        <template #default="{ row }">
          <el-switch v-model="row.enabled" :active-value="1" :inactive-value="0" @change="save(row)" />
        </template>
      </el-table-column>
      <el-table-column :label="$t('manager.channelConfig')" min-width="220">
        <template #default="{ row }">
          <span class="text-muted">{{ row.config || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button link type="success" :disabled="row.enabled !== 1" @click="testInbound(row)">{{ $t('manager.testInbound') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.visible" :title="`${dialog.row?.name || ''} - 配置`" width="520px">
      <el-form label-width="80px">
        <el-form-item :label="$t('manager.channelName')">
          <el-input v-model="dialog.row.name" />
        </el-form-item>
        <el-form-item :label="$t('manager.channelConfig')">
          <el-input v-model="dialog.configText" type="textarea" :rows="5" placeholder='{"appId":"","appSecret":""}' />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" @click="save(dialog.row)">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../../api'

const list = ref([])
const loading = ref(false)
const dialog = reactive({ visible: false, row: null, configText: '' })

async function load() {
  loading.value = true
  try {
    list.value = await api.channels()
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function parseConfig(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function openEdit(row) {
  dialog.row = row
  dialog.configText = row.config || ''
  dialog.visible = true
}

async function save(row) {
  try {
    const config = dialog.visible && dialog.row === row ? parseConfig(dialog.configText) : parseConfig(row.config)
    await api.updateChannel(row.type, { name: row.name, enabled: row.enabled, config })
    dialog.visible = false
    ElMessage.success('渠道配置已保存')
    load()
  } catch (e) {
    // 拦截器已提示
  }
}

async function testInbound(row) {
  try {
    const res = await api.channelInbound(row.type, {
      from: '测试用户',
      content: `这是来自${row.name}的测试消息，请忽略。`
    })
    ElMessage.success(`已创建测试工单：${res.no}`)
  } catch (e) {
    // 拦截器已提示
  }
}

onMounted(load)
</script>

<style scoped>
.mb16 {
  margin-bottom: 16px;
}
</style>
