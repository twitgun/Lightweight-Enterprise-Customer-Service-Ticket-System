<template>
  <div class="page-card">
    <div class="list-head">
      <h3 class="page-title" style="margin: 0">{{ $t('manager.phrases') }}</h3>
      <el-button type="primary" @click="openCreate">{{ $t('manager.createPhrase') }}</el-button>
    </div>
    <el-table v-loading="loading" :data="list" class="mt16">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="content" label="内容" min-width="360" show-overflow-tooltip />
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

    <el-dialog v-model="dialog.visible" :title="dialog.id ? $t('common.edit') : $t('manager.createPhrase')" width="560px">
      <el-form :model="dialog.form" label-width="80px">
        <el-form-item label="内容" required>
          <el-input v-model="dialog.form.content" type="textarea" :rows="4" maxlength="2000" placeholder="请输入回复内容模板" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="dialog.form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" active-text="启用" inactive-text="停用" />
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

const list = ref([])
const loading = ref(false)
const saving = ref(false)
const dialog = reactive({ visible: false, id: null, form: { content: '', sort: 0, status: 1 } })

async function load() {
  loading.value = true
  try {
    list.value = await api.allPhrases()
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function openCreate() {
  dialog.id = null
  dialog.form = { content: '', sort: 0, status: 1 }
  dialog.visible = true
}

function openEdit(row) {
  dialog.id = row.id
  dialog.form = { content: row.content, sort: row.sort, status: row.status }
  dialog.visible = true
}

async function save() {
  if (!dialog.form.content.trim()) return ElMessage.warning('内容不能为空')
  saving.value = true
  try {
    if (dialog.id) await api.updatePhrase(dialog.id, dialog.form)
    else await api.createPhrase(dialog.form)
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
    await ElMessageBox.confirm('确认删除该快捷回复？', '提示', { type: 'warning' })
    await api.deletePhrase(row.id)
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
