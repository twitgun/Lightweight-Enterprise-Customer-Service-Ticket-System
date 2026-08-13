<template>
  <div class="page-card create-card">
    <h3 class="page-title">{{ $t('menu.newTicket') }}</h3>
    <el-form :model="form" label-width="100px" style="max-width: 720px">
      <el-form-item :label="$t('ticket.title')" required>
        <el-input v-model="form.title" maxlength="128" show-word-limit :placeholder="$t('ticket.title')" />
      </el-form-item>
      <el-form-item :label="$t('ticket.category')" required>
        <el-select v-model="form.categoryId" :placeholder="$t('ticket.category')" style="width: 100%">
          <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('ticket.priority')">
        <el-radio-group v-model="form.priority">
          <el-radio-button v-for="(v, k) in PRIORITY" :key="k" :value="k">{{ $t(v.labelKey) }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item v-for="f in fields" :key="f.id" :label="f.label" :required="!!f.required">
        <el-input v-if="f.type === 'text'" v-model="fieldValues[f.label]" :placeholder="f.label" />
        <el-input v-else-if="f.type === 'textarea'" v-model="fieldValues[f.label]" type="textarea" :rows="3" :placeholder="f.label" />
        <el-select v-else-if="f.type === 'select'" v-model="fieldValues[f.label]" :placeholder="f.label" style="width: 100%">
          <el-option v-for="opt in (f.options || [])" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-date-picker v-else-if="f.type === 'date'" v-model="fieldValues[f.label]" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="$t('ticket.description')" required>
        <el-input
          v-model="form.content"
          type="textarea"
          :rows="6"
          maxlength="2000"
          show-word-limit
          :placeholder="$t('ticket.description')"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="large" :loading="loading" @click="submit">{{ $t('common.submit') }}</el-button>
        <el-button size="large" @click="$router.back()">{{ $t('common.cancel') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../../api'
import { PRIORITY } from '../../utils/status'

const router = useRouter()
const form = reactive({ title: '', categoryId: null, priority: 'normal', content: '' })
const fieldValues = reactive({})
const categories = ref([])
const fields = ref([])
const loading = ref(false)

onMounted(async () => {
  try {
    const [cats, fs] = await Promise.all([api.categories(), api.formFields()])
    categories.value = cats
    fields.value = fs.map((f) => {
      let options = []
      if (f.options) {
        try {
          options = JSON.parse(f.options)
        } catch {
          options = []
        }
      }
      return { ...f, options }
    })
  } catch (e) {
    // 拦截器已提示
  }
})

async function submit() {
  if (!form.title.trim()) return ElMessage.warning('请填写工单标题')
  if (!form.categoryId) return ElMessage.warning('请选择问题分类')
  if (!form.content.trim()) return ElMessage.warning('请填写问题描述')
  for (const f of fields.value) {
    if (f.required && !fieldValues[f.label]) return ElMessage.warning(`请填写「${f.label}」`)
  }
  loading.value = true
  try {
    const data = await api.createTicket({ ...form, fieldValues: { ...fieldValues } })
    ElMessage.success('工单提交成功')
    router.push(`/tickets/${data.ticket.id}`)
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-card {
  max-width: 860px;
}
</style>
