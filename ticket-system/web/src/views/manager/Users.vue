<template>
  <div class="page-card">
    <div class="list-head">
      <h3 class="page-title" style="margin: 0">{{ $t('manager.users') }}</h3>
      <el-button type="primary" @click="openCreate">{{ $t('manager.createUser') }}</el-button>
    </div>
    <el-form inline class="mt16">
      <el-form-item :label="$t('manager.role')">
        <el-radio-group v-model="query.role" @change="load(1)">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="customer">客户</el-radio-button>
          <el-radio-button value="staff">客服</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" placeholder="账号/姓名/手机" clearable style="width: 200px" @keyup.enter="load(1)" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="load(1)">{{ $t('common.search') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="account" label="账号" width="130" />
      <el-table-column prop="name" :label="$t('manager.name')" width="120" />
      <el-table-column :label="$t('manager.role')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.role === 'manager' ? 'danger' : row.role === 'staff' ? 'success' : 'primary'" size="small">
            {{ roleText(row.role) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="phone" :label="$t('manager.phone')" width="130" />
      <el-table-column prop="company" :label="$t('manager.company')" min-width="140" show-overflow-tooltip />
      <el-table-column :label="$t('common.status')" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">{{ row.status === 1 ? '正常' : '禁用' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('common.action')" width="170" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="openEdit(row)">{{ $t('common.edit') }}</el-button>
          <el-button v-if="row.role !== 'manager'" link :type="row.status === 1 ? 'danger' : 'success'" @click="toggleStatus(row)">
            {{ row.status === 1 ? '禁用' : '启用' }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination layout="total, prev, pager, next" :total="total" :page-size="query.size" :current-page="query.page" @current-change="load" />
    </div>

    <el-dialog v-model="dialog.visible" :title="dialog.id ? $t('manager.editUser') : $t('manager.createUser')" width="480px">
      <el-form :model="dialog.form" label-width="80px">
        <el-form-item label="账号" required>
          <el-input v-model="dialog.form.account" :disabled="!!dialog.id" placeholder="3-32 位字母/数字/下划线" />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model="dialog.form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="角色" required>
          <el-select v-model="dialog.form.role" :disabled="!!dialog.id" style="width: 100%">
            <el-option label="客户" value="customer" />
            <el-option label="客服专员" value="staff" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="dialog.form.phone" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="dialog.form.company" />
        </el-form-item>
        <el-form-item :label="dialog.id ? '重置密码' : '密码'">
          <el-input v-model="dialog.form.password" type="password" show-password :placeholder="dialog.id ? '留空则不修改' : '默认 123456'" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" active-text="正常" inactive-text="禁用" />
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

const roleTextMap = { customer: '客户', staff: '客服专员', manager: '客服主管' }
const roleText = (r) => roleTextMap[r] || r

const query = reactive({ role: '', keyword: '', page: 1, size: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)
const saving = ref(false)
const dialog = reactive({
  visible: false,
  id: null,
  form: { account: '', name: '', role: 'customer', phone: '', company: '', password: '', status: 1 }
})

async function load(page) {
  query.page = page || 1
  loading.value = true
  try {
    const res = await api.users({ role: query.role || undefined, keyword: query.keyword || undefined, page: query.page, size: query.size })
    list.value = res.list || res
    total.value = res.total ?? res.length
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

function resetForm() {
  dialog.id = null
  dialog.form = { account: '', name: '', role: 'customer', phone: '', company: '', password: '', status: 1 }
}

function openCreate() {
  resetForm()
  dialog.visible = true
}

function openEdit(row) {
  dialog.id = row.id
  dialog.form = {
    account: row.account,
    name: row.name,
    role: row.role,
    phone: row.phone || '',
    company: row.company || '',
    password: '',
    status: row.status
  }
  dialog.visible = true
}

async function save() {
  const f = dialog.form
  if (!f.account || !f.name) return ElMessage.warning('账号和姓名不能为空')
  saving.value = true
  try {
    if (dialog.id) {
      const payload = { name: f.name, phone: f.phone, company: f.company, status: f.status }
      if (f.password) payload.password = f.password
      await api.updateUser(dialog.id, payload)
    } else {
      await api.createUser(f)
    }
    ElMessage.success('保存成功')
    dialog.visible = false
    load()
  } catch (e) {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

async function toggleStatus(row) {
  const next = row.status === 1 ? 0 : 1
  try {
    await ElMessageBox.confirm(`确认${next === 0 ? '禁用' : '启用'}账号 ${row.account}？`, '提示', { type: 'warning' })
    await api.updateUser(row.id, { status: next })
    ElMessage.success('操作成功')
    load()
  } catch (e) {
    // 取消或失败
  }
}

onMounted(() => load(1))
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
.pager {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
