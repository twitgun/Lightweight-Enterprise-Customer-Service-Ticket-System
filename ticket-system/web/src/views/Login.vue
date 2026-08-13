<template>
  <div class="login-page">
    <div class="brand-panel">
      <div class="brand-inner">
        <div class="brand-logo">
          <div class="logo-mark"><el-icon :size="24"><Headset /></el-icon></div>
          <span>{{ $t('app.name') }}</span>
        </div>
        <div class="brand-slogan">
          <h1>Ticket OS</h1>
          <p>{{ $t('app.name') }}</p>
        </div>
        <div class="brand-features">
          <div v-for="f in features" :key="f" class="brand-feature">
            <span class="feat-dot"></span>{{ f }}
          </div>
        </div>
        <div class="brand-footer">Powered by Vue 3 · NestJS · MySQL</div>
      </div>
    </div>

    <div class="form-side">
      <div class="form-card panel-cut">
        <h2 class="form-title">{{ $t('login.title') }}</h2>
        <p class="form-sub">{{ $t('app.name') }}</p>
        <el-form :model="form" label-position="top" @keyup.enter="submit">
          <el-form-item :label="$t('login.account')">
            <el-input v-model="form.account" size="large" :placeholder="$t('login.account')" />
          </el-form-item>
          <el-form-item :label="$t('login.password')">
            <el-input v-model="form.password" type="password" size="large" show-password :placeholder="$t('login.password')" />
          </el-form-item>
          <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="submit">
            {{ $t('login.submit') }}
          </el-button>
        </el-form>
        <div class="form-footer">
          <el-button link type="primary" @click="$router.push('/register')">{{ $t('login.register') }}</el-button>
        </div>
        <el-alert type="info" :closable="false" class="demo-tip">
          <div>{{ $t('login.demo') }}：</div>
          <div>manager ｜ staff01 / staff02 ｜ customer01 / customer02</div>
        </el-alert>
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
const form = reactive({ account: '', password: '' })
const loading = ref(false)
const features = ['工单提交 · 客服处理 · 主管管控', 'AI 智能助手与知识库问答', '实时会话 · 满意度闭环']

async function submit() {
  if (!form.account || !form.password) return ElMessage.warning(i18n.global.t('login.account'))
  loading.value = true
  try {
    await auth.login({ ...form })
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
.login-page {
  height: 100%;
  display: flex;
  background: var(--app-bg);
}

/* 左侧品牌面板 */
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
.brand-panel::after {
  content: '';
  position: absolute;
  width: 420px;
  height: 420px;
  right: -120px;
  bottom: -140px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 65%);
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
  margin-bottom: 52px;
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
  letter-spacing: 1px;
  margin: 0 0 10px;
  font-family: var(--app-font-mono);
}
.brand-slogan p {
  font-size: 16px;
  opacity: 0.85;
  margin: 0 0 46px;
}
.brand-features {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.brand-feature {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  opacity: 0.92;
}
.feat-dot {
  width: 8px;
  height: 8px;
  background: #ffd166;
  transform: rotate(45deg);
  box-shadow: 0 0 10px rgba(255, 209, 102, 0.7);
}
.brand-footer {
  margin-top: 64px;
  font-family: var(--app-font-mono);
  font-size: 12px;
  opacity: 0.6;
}

/* 右侧表单 */
.form-side {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30px;
}
.form-card {
  width: 420px;
  background: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 14px;
  padding: 40px 36px 30px;
  box-shadow: var(--app-shadow-hover);
}
.form-title {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 900;
  color: var(--app-text);
}
.form-sub {
  margin: 0 0 26px;
  color: var(--app-text-secondary);
  font-size: 13px;
}
.submit-btn {
  width: 100%;
  margin-top: 6px;
}
.form-footer {
  text-align: center;
  margin-top: 14px;
}
.demo-tip {
  margin-top: 18px;
  line-height: 1.8;
  border-radius: 9px;
}
</style>
