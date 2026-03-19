<template>
  <div class="min-h-screen bg-bg flex flex-col">
    <header
      class="hidden md:flex bg-brand text-white shadow-lg h-16 items-center px-8 justify-between sticky top-0 z-50">
      <div class="flex items-center space-x-8">
        <h1 class="text-xl font-black tracking-tighter italic">JUNO电竞</h1>
        <nav class="flex space-x-6 text-sm font-medium">
          <router-link v-if="['Admin', 'Mercenary'].includes(userStore.role)" to="/hall"
            class="nav-item">抢单大厅</router-link>
          <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/dispatch"
            class="nav-item">派单中心</router-link>
          <router-link v-if="userStore.role === 'Admin'" to="/player-management" class="nav-item">打手管理</router-link>
          <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/history"
            class="nav-item">历史订单</router-link>
          <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/after-sales"
            class="nav-item">售后处理</router-link>
          <router-link v-if="userStore.role === 'Admin'" to="/finance" class="nav-item">财务看板</router-link>
          <router-link to="/profile" class="nav-item">个人中心</router-link>
        </nav>
      </div>

      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-3 border-l border-white/20 pl-6">
          <el-tag effect="plain" class="!bg-transparent !text-white !border-white/40" size="small">{{ roleNameDisplay
            }}</el-tag>
          <span class="text-sm font-medium">{{ userStore.username || "未登录用户" }}</span>
        </div>
      </div>
    </header>

    <header
      class="md:hidden bg-brand text-white shadow-sm h-14 flex items-center px-4 justify-between sticky top-0 z-50">
      <h1 class="text-lg font-black tracking-tighter italic">JUNO</h1>
      <div class="flex items-center gap-2">
        <el-tag effect="dark" size="small" type="warning" @click="mobileDebugVisible = true">{{ roleNameDisplay
          }}</el-tag>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-[#f5f7fa] pb-20 md:pb-6">
      <div class="max-w-7xl mx-auto h-full">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <nav
      class="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-md flex justify-around items-center h-16 z-50 pb-safe">
      <router-link to="/hall" class="mobile-tab-item"><el-icon class="text-xl mb-1">
          <HomeFilled />
        </el-icon><span>大厅</span></router-link>
      <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/dispatch"
        class="mobile-tab-item"><el-icon class="text-xl mb-1">
          <DocumentCopy />
        </el-icon><span>派单</span></router-link>
      <router-link v-if="userStore.role === 'Admin'" to="/player-management" class="mobile-tab-item"><el-icon
          class="text-xl mb-1">
          <UserFilled />
        </el-icon><span>打手</span></router-link>
      <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/history" class="mobile-tab-item"><el-icon
          class="text-xl mb-1">
          <List />
        </el-icon><span>历史</span></router-link>
      <router-link v-if="['Admin', 'Dispatcher'].includes(userStore.role)" to="/after-sales"
        class="mobile-tab-item"><el-icon class="text-xl mb-1">
          <Service />
        </el-icon><span>售后</span></router-link>
      <router-link to="/profile" class="mobile-tab-item"><el-icon class="text-xl mb-1">
          <Avatar />
        </el-icon><span>我的</span></router-link>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserStore } from "@/store/user";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { HomeFilled, DocumentCopy, UserFilled, Avatar, List, Service } from "@element-plus/icons-vue";

const userStore = useUserStore();
const router = useRouter();
const mobileDebugVisible = ref(false);

const roleNameDisplay = computed(() => {
  const map: Record<string, string> = { Admin: "系统管理员", Dispatcher: "派单客服", Mercenary: "电竞打手" };
  return map[userStore.role] || userStore.role;
});

</script>

<style scoped>
.nav-item {
  opacity: 0.7;
  transition: all 0.2s ease;
  padding: 0.5rem 0.25rem;
  position: relative;
  text-decoration: none;
  color: inherit;
}

.nav-item:hover {
  opacity: 1;
}

.nav-item.router-link-active {
  opacity: 1;
  font-weight: bold;
}

.nav-item.router-link-active::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: white;
  border-radius: 9999px;
}

.mobile-tab-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9ca3af;
  transition: color 0.2s ease;
  font-size: 10px;
  text-decoration: none;
}

.mobile-tab-item.router-link-active {
  color: var(--el-color-primary);
  font-weight: bold;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom);
}

@supports (padding-bottom: env(safe-area-inset-bottom)) {
  nav.pb-safe {
    height: calc(4rem + env(safe-area-inset-bottom));
  }
}
</style>