<template>
  <div class="page-card">
    <div class="list-head">
      <h3 class="page-title" style="margin: 0">{{ pageTitle }}</h3>
      <el-button v-if="role === 'customer'" type="primary" @click="$router.push('/tickets/new')">{{ $t('ticket.submitNew') }}</el-button>
    </div>
    <el-form inline class="mt16">
      <el-form-item :label="$t('common.status')">
        <el-select v-model="query.status" :placeholder="$t('common.all')" clearable style="width: 140px" @change="load(1)">
          <el-option v-for="(v, k) in STATUS" :key="k" :label="$t(v.labelKey)" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('ticket.priority')">
        <el-select v-model="query.priority" :placeholder="$t('common.all')" clearable style="width: 120px" @change="load(1)">
          <el-option v-for="(v, k) in PRIORITY" :key="k" :label="$t(v.labelKey)" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('ticket.channel')">
        <el-select v-model="query.channel" :placeholder="$t('common.all')" clearable style="width: 120px" @change="load(1)">
          <el-option v-for="(v, k) in CHANNEL" :key="k" :label="v" :value="k" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="role !== 'customer'" label="超时">
        <el-select v-model="query.overdue" clearable style="width: 100px" @change="load(1)">
          <el-option label="仅看超时" value="1" />
        </el-select>
      </el-form-item>
      <el-form-item :label="$t('ticket.keyword')">
        <el-input
          v-model="query.keyword"
          :placeholder="$t('ticket.keyword')"
          clearable
          style="width: 200px"
          @keyup.enter="load(1)"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="load(1)">{{ $t('common.search') }}</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="list" style="cursor: pointer" @row-click="(row) => $router.push(`/tickets/${row.id}`)">
      <el-table-column prop="no" :label="$t('ticket.no')" width="175" />
      <el-table-column prop="title" :label="$t('ticket.title')" min-width="180" show-overflow-tooltip />
      <el-table-column :label="$t('ticket.priority')" width="90">
        <template #default="{ row }">
          <el-tag :type="PRIORITY[row.priority]?.type" size="small">{{ $t(PRIORITY[row.priority]?.labelKey) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ticket.channel')" width="90">
        <template #default="{ row }">{{ CHANNEL[row.channel] || row.channel }}</template>
      </el-table-column>
      <el-table-column prop="categoryName" :label="$t('ticket.category')" width="100" />
      <el-table-column v-if="role !== 'customer'" prop="customerName" :label="$t('ticket.customer')" width="100" />
      <el-table-column v-if="role === 'manager'" prop="staffName" :label="$t('ticket.staff')" width="100" />
      <el-table-column :label="$t('common.status')" width="120">
        <template #default="{ row }">
          <el-tag :type="STATUS[row.status]?.type" size="small">{{ $t(STATUS[row.status]?.labelKey) }}</el-tag>
          <el-tag v-if="row.overdue" type="danger" size="small" style="margin-left: 4px">{{ $t('status.overdue') }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('ticket.createdAt')" width="150">
        <template #default="{ row }">{{ fmtTime(row.createdAt) }}</template>
      </el-table-column>
    </el-table>
    <el-empty v-if="!loading && !list.length" :description="$t('common.empty')" :image-size="80" />
    <div class="pager">
      <el-pagination
        layout="total, prev, pager, next"
        :total="total"
        :page-size="query.size"
        :current-page="query.page"
        @current-change="load"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../api'
import { useAuthStore } from '../store/auth'
import { CHANNEL, PRIORITY, STATUS, fmtTime } from '../utils/status'

const route = useRoute()
const auth = useAuthStore()
const role = computed(() => auth.role)
const pageTitle = computed(() => route.meta.title || '工单列表')

const query = reactive({ status: '', priority: '', channel: '', overdue: '', keyword: '', page: 1, size: 10 })
const list = ref([])
const total = ref(0)
const loading = ref(false)

async function load(page) {
  query.page = page || 1
  loading.value = true
  try {
    const res = await api.tickets({ ...query })
    list.value = res.list
    total.value = res.total
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}

watch(
  () => route.query,
  () => {
    Object.assign(query, {
      status: route.query.status || '',
      overdue: route.query.overdue || '',
      priority: route.query.priority || '',
      channel: route.query.channel || '',
      keyword: route.query.keyword || ''
    })
    load(1)
  },
  { immediate: true }
)
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
