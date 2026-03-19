<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 relative overflow-hidden">
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-brand rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

    <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 z-10 relative">
      
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-brand rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform cursor-pointer">
          <img src="../../img/logo/logo.jpg" style="border-radius:0.75rem"/>
        </div>
        <h2 class="text-2xl font-bold text-white tracking-wider">JUNO电竞系统</h2>
        <p class="text-gray-400 text-sm mt-2">后台管理与派单中心</p>
      </div>

      <el-form 
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        size="large"
        class="space-y-6"
        @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入账号" 
            :prefix-icon="User"
            class="custom-input"
            clearable
          />
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码" 
            :prefix-icon="Lock"
            show-password
            class="custom-input"
          />
        </el-form-item>

        <el-button 
          type="primary" 
          class="w-full !bg-brand !border-none !h-12 text-lg font-bold rounded-xl shadow-lg hover:shadow-brand/50 transition-all active:scale-95"
          :loading="loading"
          @click="handleLogin"
        >
          {{ loading ? '登录中...' : '立即登录' }}
        </el-button>
      </el-form>
      
      <div class="mt-6 text-center text-xs text-gray-500">
        内部系统，非授权人员请勿登录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/store/user'
import { authApi } from '@/api/auth'

const router = useRouter()
const loginFormRef = ref()
const loading = ref(false)
const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }, 
    { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  await loginFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      loading.value = true
      try {
        const res = await authApi.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        if (res.code === 200 && res.data) {
          userStore.loginSuccess(res.data)
          ElMessage.success(`欢迎回来，${res.data.userInfo?.nickname || '用户'}！`)
          router.push('/profile') 
        } else {
          ElMessage.error(res.msg || res.message || '登录失败，请检查账号密码')
        }
      } catch (error: any) {
        const errorMsg = error?.response?.data?.msg || '网络异常，请稍后重试'
        ElMessage.error(errorMsg)
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
:deep(.custom-input .el-input__wrapper) { background-color: rgba(255, 255, 255, 0.05) !important; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1) inset !important; height: 48px; border-radius: 0.75rem; }
:deep(.custom-input .el-input__inner) { color: white !important; }
:deep(.custom-input .el-input__inner::placeholder) { color: #9ca3af !important; }
:deep(.custom-input:hover .el-input__wrapper), :deep(.custom-input.is-focus .el-input__wrapper) { box-shadow: 0 0 0 1px #409eff inset !important; }
@keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
.animate-blob { animation: blob 7s infinite; }
.animation-delay-2000 { animation-delay: 2s; }
</style>