<template>
  <div class="page-card">
    <div class="list-head">
      <h3 class="page-title" style="margin: 0">{{ $t('manager.forms') }}</h3>
      <el-button type="primary" @click="openCreate">{{ $t('common.create') }}</el-button>
    </div>
    <el-table v-loading="loading" :data="list" class="mt16">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="label" :label="$t('manager.fieldLabel')" min-width="140" />
      <el-table-column :label="$t('manager.fieldType')" width="120">
        <template #default="{ row }">{{ typeText(row.type) }}</template>
      </el-table-column>
      <el-table-column :label="$t('manager.fieldRequired')" width="90">
        <template #default="{ row }">
          <el-tag :type="row.required ? 'danger' : 'info'" size="small">{{ row.required ? '是' : '否' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="options" label="选项" min-width="160" show-overflow-tooltip />
      <el-table-column prop="sort" :label="$t('manager.sort')" width="80" />
      <el-table-column :label="$t('common.status')" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '启用' : '停用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" width="150">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button link type="danger" @click="remove(row)">{{ $t('common.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialog.visible" :title="dialog.id ? $t('common.edit') : $t('common.create')" width="480px">
      <el-form :model="dialog.form" label-width="100px">
        <el-form-item :label="$t('manager.fieldLabel')" required>
          <el-input v-model="dialog.form.label" />
        </el-form-item>
        <el-form-item :label="$t('manager.fieldType')" required>
          <el-select v-model="dialog.form.type" style="width: 100%">
            <el-option :label="$t('manager.typeText')" value="text" />
            <el-option :label="$t('manager.typeTextarea')" value="textarea" />
            <el-option :label="$t('manager.typeSelect')" value="select" />
            <el-option :label="$t('manager.typeDate')" value="date" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('manager.fieldOptions')" v-if="dialog.form.type === 'select'">
          <el-input v-model="optionsText" placeholder="例如：一般,紧急,非常紧急" />
        </el-form-item>
        <el-form-item :label="$t('manager.fieldRequired')">
          <el-switch v-model="dialog.form.required" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item :label="$t('manager.sort')">
          <el-input-number v-model="dialog.form.sort" :min="0" />
        </el-form-item>
        <el-form-item :label="$t('common.status')">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">{{ $t('common.cancel') }}</el-button>
        <el-button type="primary" :loading="saving" @click="save">{{ $t('common.save') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api } from '../../api'

const typeTextMap = { text: '单行文本', textarea: '多行文本', select: '下拉选择', date: '日期' }
const typeText = (t) => typeTextMap[t] || t

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const optionsText = ref('')
const dialog = reactive({ visible: false, id: null, form: { label: '', type: 'text', required: 0, sort: 0, status: 1 } })

async function load() {
  loading.value = true
  try {
    list.value = await api.allFormFields()
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialog.id = null
  dialog.form = { label: '', type: 'text', required: 0, sort: 0, status: 1 }
  optionsText.value = ''
  dialog.visible = true
}

function openEdit(row) {
  dialog.id = row.id
  dialog.form = { label: row.label, type: row.type, required: row.required, sort: row.sort, status: row.status }
  optionsText.value = ''
  if (row.options) {
    try {
      optionsText.value = JSON.parse(row.options).join(',')
    } catch {
      optionsText.value = row.options
    }
  }
  dialog.visible = true
}

async function save() {
  if (!dialog.form.label.trim()) return ElMessage.warning('请填写字段名称')
  saving.value = true
  try {
    const payload = {
      ...dialog.form,
      options: dialog.form.type === 'select' ? optionsText.value.split(/[,，]/).map((s) => s.trim()).filter(Boolean) : []
    }
    if (dialog.id) await api.updateFormField(dialog.id, payload)
    else await api.createFormField(payload)
    ElMessage.success('保存成功')
    dialog.visible = false
    load()
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  try {
    await ElMessageBox.confirm(`确认删除字段「${row.label}」？`, '提示', { type: 'warning' })
    await api.deleteFormField(row.id)
    ElMessage.success('删除成功')
    load()
  } catch (e) {
    // 取消或失败
  }
}

onMounted(load)
</script>

<style scoped>
.list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mt16 {
  margin-top: 12px;
}
</style>
