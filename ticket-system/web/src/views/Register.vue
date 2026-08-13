<template>
  <div class="register-page">
    <div class="brand-panel">
      <div class="brand-inner">
        <div class="brand-logo">
          <div class="logo-mark"><el-icon :size="24"><Headset /></el-icon></div>
          <span>{{ $t('app.name') }}</span>
        </div>
        <div class="brand-slogan">
          <h1>Join Us</h1>
          <p>客户自助注册，快速发起售后工单</p>
        </div>
      </div>
    </div>
    <div class="form-side">
      <div class="form-card panel-cut">
        <h2 class="form-title">{{ $t('register.title') }}</h2>
        <el-form :model="form" label-position="top">
          <el-form-item :label="$t('register.account')" required>
            <el-input v-model="form.account" placeholder="customer01" />
          </el-form-item>
          <el-form-item :label="$t('register.name')" required>
            <el-input v-model="form.name" :placeholder="$t('register.name')" />
          </el-form-item>
          <el-form-item :label="$t('register.password')" required>
            <el-input v-model="form.password" type="password" show-password :placeholder="$t('register.password')" />
          </el-form-item>
          <el-form-item :label="$t('register.confirm')" required>
            <el-input v-model="form.confirm" type="password" show-password :placeholder="$t('register.confirm')" />
          </el-form-item>
          <el-form-item :label="$t('register.company')">
            <el-input v-model="form.company" :placeholder="$t('register.company')" />
          </el-form-item>
          <el-form-item :label="$t('register.phone')">
            <el-input v-model="form.phone" :placeholder="$t('register.phone')" />
          </el-form-item>
          <el-button type="primary" class="submit-btn" :loading="loading" @click="submit">{{ $t('register.submit') }}</el-button>
        </el-form>
        <div class="back-login">
          <el-button link type="primary" @click="$router.push('/login')">{{ $t('register.toLogin') }}</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import i18n from '../i18n'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const auth = useAuthStore()
const form = reactive({ account: '', name: '', password: '', confirm: '', company: '', phone: '' })
const loading = ref(false)

async function submit() {
  if (!form.account || !form.name || !form.password) return ElMessage.warning(i18n.global.t('register.account'))
  if (form.password !== form.confirm) return ElMessage.warning(i18n.global.t('register.confirm'))
  loading.value = true
  try {
    await auth.register({
      account: form.account,
      name: form.name,
      password: form.password,
      company: form.company,
      phone: form.phone
    })
    ElMessage.success(i18n.global.t('login.success'))
    router.push('/home')
  } catch (e) {
    // 拦截器已提示
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100%;
  display: flex;
  background: var(--app-bg);
}
.brand-panel {
  flex: 1.15;
  position: relative;
  overflow: hidden;
  background: linear-gradient(150deg, #4c5ce0 0%, #5b6cf0 42%, #7a6ce8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand-panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 34px 34px;
  opacity: 0.55;
}
.brand-inner {
  position: relative;
  z-index: 1;
  color: #fff;
  width: 460px;
  padding: 0 30px;
}
.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 800;
  margin-bottom: 60px;
}
.logo-mark {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.35);
  clip-path: polygon(0 0, calc(100% - 11px) 0, 100% 11px, 100% 100%, 0 100%);
}
.brand-slogan h1 {
  font-size: 44px;
  font-weight: 900;
  margin: 0 0 10px;
  font-family: var(--app-font-mono);
}
.brand-slogan p {
  font-size: 16px;
  opacity: 0.85;
  margin: 0;
}
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
.form-card {
  width: 440px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 34px 36px 26px;
  box-shadow: var(--app-shadow-hover);
}
.form-title {
  margin: 0 0 22px;
  font-size: 22px;
  font-weight: 900;
  color: var(--app-text);
}
.submit-btn {
  width: 100%;
}
.back-login {
  text-align: center;
  margin-top: 14px;
}
</style>
