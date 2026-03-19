<template>
  <div class="hall-container">
    <ManagementLayout :data="sortedOrders" :loading="loading" :total="totalOrders">

      <template #header-left>
        <div class="flex items-center gap-3 flex-wrap">
          <h1 class="text-xl font-bold text-gray-800">抢单大厅</h1>
          <el-tag type="success" effect="plain" class="font-bold">实时余单: {{ totalOrders }}</el-tag>

          <el-select v-model="filterLevel" placeholder="所有等级" class="w-32" clearable @change="handleFilterChange">
            <el-option label="娱乐" :value="0" />
            <el-option label="守卫" :value="1" />
            <el-option label="骑士" :value="2" />
            <el-option label="荣光骑士" :value="3" />
          </el-select>

          <el-select v-model="filterZone" placeholder="所有分区" class="w-32" clearable @change="handleFilterChange">
            <el-option label="三角洲行动" value="三角洲行动" />
            <el-option label="无畏契约" value="无畏契约" />
            <el-option label="洛克王国" value="洛克王国" />
          </el-select>
        </div>
      </template>

      <template #header-right>
        <el-button type="primary" class="!bg-brand !border-none !text-white font-bold" :loading="loading"
          @click="handleRefresh">
          <el-icon class="mr-1">
            <Refresh />
          </el-icon>
          <span class="hidden sm:inline">刷新大厅</span>
          <span class="sm:hidden">刷新</span>
        </el-button>
      </template>

      <template #content="{ item }">
        <div class="hidden sm:block">
          <el-descriptions :column="2" border direction="horizontal">
            <el-descriptions-item label="关联单号">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-gray-800">{{ item.orderSn }}</span>
                <el-tag v-if="getWaitTime(item.createdAt) >= 5" type="danger" effect="dark" class="animate-pulse">
                  🔥 老板等待过长，优先处理
                </el-tag>
                <el-tag v-if="item.isDouble === '0'" type="info" size="small" class="ml-2">单人</el-tag>
                <el-tag v-if="item.isDouble === '1'" type="warning" size="small" class="ml-2">双排</el-tag>
                <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark"
                  class="ml-2 animate-pulse">曾取消</el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="已等待时间">
              <span :class="getWaitTime(item.createdAt) >= 5 ? 'text-red-600 font-bold' : 'text-gray-500'">
                {{ getWaitTime(item.createdAt) }} 分钟
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="游戏分区">{{ item.gameName }}</el-descriptions-item>
            <el-descriptions-item label="订单类型">
              <el-tag size="small" type="info" effect="dark">{{ getLevelName(item.orderType) }}</el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="到手金额 / 备注" :span="2">
              <div class="flex flex-col">
                <span class="text-orange-600 font-bold text-xl font-mono">￥{{ (item.playerAmount || 0).toFixed(2)
                  }}</span>

                <div v-if="item.isTransfered === 1 && item.transferReason"
                  class="mt-2 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-600 w-fit">
                  <span class="font-bold">前打手取消原因：</span>{{ item.transferReason }}
                </div>

                <span v-if="item.positionNote" class="text-sm text-gray-500 mt-1">
                  <span class="font-bold">备注：</span>{{ item.positionNote }}
                </span>
                <span v-else class="text-sm text-gray-400 mt-1 italic">备注：无</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block sm:hidden bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
          <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-gray-800 text-sm">{{ item.orderSn }}</span>
              <el-tag v-if="getWaitTime(item.createdAt) >= 5" type="danger" size="small" effect="dark">优先</el-tag>
              <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark"
                class="scale-90 animate-pulse">曾取消</el-tag>
            </div>
            <div class="flex gap-1">
              <el-tag v-if="item.isDouble === '0'" type="info" size="small" effect="plain"
                class="!border-gray-200">单人</el-tag>
              <el-tag v-if="item.isDouble === '1'" type="warning" size="small" effect="light"
                class="!border-none">双排</el-tag>
            </div>
          </div>

          <div class="bg-[#f8fafc] rounded-lg p-2.5 text-xs text-gray-600 flex flex-col gap-2">
            <div class="grid grid-cols-2 gap-2">
              <div><span class="text-gray-400">已等：</span><span
                  :class="getWaitTime(item.createdAt) >= 5 ? 'text-red-500 font-bold' : ''">{{
                    getWaitTime(item.createdAt) }}min</span></div>
              <div><span class="text-gray-400">类型：</span>{{ getLevelName(item.orderType) }}</div>
            </div>

            <div class="flex justify-between items-center">
              <div class="text-gray-400">{{ item.createdAt }}</div>
              <div>
                <span class="text-gray-400">佣金：</span>
                <span class="text-orange-600 font-bold text-base font-mono">￥{{ (item.playerAmount || 0).toFixed(2)
                  }}</span>
              </div>
            </div>

            <div class="pt-2 mt-1 border-t border-gray-100/80 space-y-2">
              <span v-if="item.positionNote" class="text-gray-500 line-clamp-2">
                <span class="font-bold">备注：</span>{{ item.positionNote }}
              </span>
              <span v-else class="text-gray-400 italic">备注：无</span>
            </div>
          </div>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex flex-col w-full gap-2">
          <div v-if="item.isDouble === '1'" class="w-full text-center py-1 rounded text-xs font-bold border"
            :class="item.status === 'pending_double' ? 'bg-pink-50 text-pink-500 border-pink-200' : 'bg-orange-50 text-orange-500 border-orange-200'">
            <span v-if="item.status === 'pending_double' && item.player?.id === userStore.userInfo?.id">⏳
              正在等待队友补位</span>
            <span v-else-if="item.status === 'pending_double'">1/2 缺人中</span>
            <span v-else-if="!item.player && !item.playerId2">0/2 双排空车</span>
          </div>

          <el-button type="primary"
            class="!bg-brand !border-none w-full !text-white !text-lg font-bold transition-all active:scale-95"
            style="height: 60px;"
            :disabled="item.orderType !== userStore.userInfo?.level || (item.status === 'pending_double' && item.player?.id === userStore.userInfo?.id)"
            @click="handleGrabClick(item)">

            <span v-if="item.orderType !== userStore.userInfo?.level" class="text-sm">等级不符</span>
            <span v-else-if="item.status === 'waiting' && item.player?.id === userStore.userInfo?.id">选择接单模式</span>
            <span
              v-else-if="item.status === 'pending_double' && (item.player?.id === userStore.userInfo?.id || item.playerId2?.id === userStore.userInfo?.id)">等待队友上车</span>
            <span v-else-if="item.status === 'pending_double'">补位接单</span>
            <span v-else>立即接单</span>

          </el-button>
        </div>
      </template>

      <template #pagination>
        <el-pagination v-model:current-page="currentPage" :page-size="pageSize" :total="totalOrders" background
          layout="total, prev, pager, next" @current-change="handlePageChange" />
      </template>
    </ManagementLayout>

    <el-dialog v-model="doubleModeDialogVisible" title="选择双人接单模式" width="min(95vw, 450px)" class="!rounded-xl"
      destroy-on-close>
      <div v-if="currentGrabOrder" class="space-y-4 sm:space-y-6">
        <div class="text-sm text-gray-600 bg-brand/5 p-3 rounded-lg border border-brand/20 text-center">
          当前单号：<span class="font-mono font-bold text-brand">{{ currentGrabOrder.orderSn }}</span>
        </div>

        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <div
            class="flex-1 border border-gray-200 p-4 rounded-xl bg-gray-50 hover:border-brand hover:bg-brand/5 cursor-pointer text-center transition-all group"
            @click="submitDoubleGrab('random')">
            <div class="text-xl font-bold text-gray-800 mb-1 sm:mb-2">🎲 随机匹配</div>
            <div class="text-xs text-gray-500 leading-relaxed">订单留在大厅<br>任何人均可补位加入</div>
          </div>

          <div
            class="flex-1 border border-gray-200 p-4 rounded-xl bg-gray-50 hover:border-brand hover:bg-brand/5 cursor-pointer text-center transition-all group"
            @click="submitDoubleGrab('partner')">
            <div class="text-xl font-bold text-gray-800 mb-1 sm:mb-2">🤝 搭档合作</div>
            <div class="text-xs text-gray-500 leading-relaxed">订单直接发车<br>系统自动指派给搭档</div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import ManagementLayout from '@/components/ManagementLayout.vue'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dashboardApi } from '@/api/dashboard'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()

const loading = ref(false)
const allOrders = ref<any[]>([])
const totalOrders = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const doubleModeDialogVisible = ref(false)
const currentGrabOrder = ref<any>(null)

const filterLevel = ref<number | ''>('')
const filterZone = ref<string>(userStore.userInfo?.gameZone || '')

// --- 新增：计时逻辑 ---
const now = ref(Date.now())
let timer: any = null

const getWaitTime = (createdAt: string) => {
  if (!createdAt) return 0
  const start = new Date(createdAt.replace(/-/g, '/')).getTime()
  return Math.floor((now.value - start) / 1000 / 60)
}

const sortedOrders = computed(() => {
  const list = [...allOrders.value]
  return list.sort((a, b) => {
    const waitA = getWaitTime(a.createdAt)
    const waitB = getWaitTime(b.createdAt)
    const isAPriority = (a.status === 'pending' || a.status === 'pending_double') && waitA >= 5
    const isBPriority = (b.status === 'pending' || b.status === 'pending_double') && waitB >= 5

    if (isAPriority && !isBPriority) return -1
    if (!isAPriority && isBPriority) return 1
    // 否则按时间倒序
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
})
// ----------------------

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' }
  return map[level] ?? '未知'
}

const handleFilterChange = () => {
  currentPage.value = 1
  fetchData()
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await dashboardApi.getHallOrders({
      page: currentPage.value,
      size: pageSize.value,
      level: filterLevel.value,
      gameZone: filterZone.value
    })
    if (res.code === 200) {
      allOrders.value = res.data.records || []
      totalOrders.value = res.data.total || 0
    }
  } catch (err) {
    console.error('获取大厅订单失败:', err)
  } finally {
    loading.value = false
  }
}

const handleGrabClick = (order: any) => {
  if (userStore.role === 'Dispatcher') {
    ElMessage.warning('客服账号无法接单，请使用打手账号')
    return
  }

  if (order.status === 'waiting' && order.player?.id === userStore.userInfo?.id) {
    currentGrabOrder.value = order
    doubleModeDialogVisible.value = true
    return
  }

  ElMessageBox.confirm(
    `确定接取订单 ${order.orderSn} 吗？`,
    '接单确认',
    { confirmButtonText: '确定抢单', cancelButtonText: '取消', type: 'success' }
  ).then(() => {
    submitDirectGrab(order)
  }).catch(() => { })
}

const submitDirectGrab = async (order: any) => {
  try {
    const isFreshDoubleOrder = order.isDouble === '1' && order.status === 'pending'
    const res: any = await request.post('/player/order/grab', { orderSn: order.orderSn })
    if (res.code === 200) {
      if (isFreshDoubleOrder) {
        ElMessage.success('已成功锁定订单！请进一步选择双人接单模式。')
        order.status = 'waiting'
        order.player = { id: userStore.userInfo?.id }
        currentGrabOrder.value = order
        doubleModeDialogVisible.value = true
      } else {
        ElMessage.success('接单成功，订单已正式发车！请前往个人中心查看')
        doubleModeDialogVisible.value = false
        fetchData()
      }
    } else {
      ElMessage.error(res.msg || '接单失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  }
}

const submitDoubleGrab = async (doubleType: 'random' | 'partner') => {
  if (!currentGrabOrder.value) return
  try {
    const partnerId = userStore.userInfo?.partnerId || null
    if (doubleType === 'partner' && !partnerId) {
      ElMessage.warning('您当前未绑定搭档，无法选择此模式')
      return
    }

    const actionType = doubleType === 'random' ? 'WAIT_OTHER' : 'ASSIGN_PARTNER'
    const payload = {
      orderSn: currentGrabOrder.value.orderSn,
      actionType: actionType,
      partnerId: actionType === 'ASSIGN_PARTNER' ? partnerId : null
    }

    const res: any = await request.post('/player/order/confirm-double', payload)
    if (res.code === 200) {
      ElMessage.success(doubleType === 'partner' ? '已成功指派搭档' : '已放回大厅等待他人补位')
      doubleModeDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('确认模式请求异常')
  }
}

const handleRefresh = () => {
  currentPage.value = 1
  fetchData()
  ElMessage.success('列表已刷新')
}

const handlePageChange = (val: number) => {
  currentPage.value = val
  fetchData()
}

onMounted(() => {
  fetchData()
  timer = setInterval(() => { now.value = Date.now() }, 60000) // 每分钟刷新一次时间
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
:deep(.el-descriptions__label) {
  background: #fcfcfc !important;
  font-weight: bold;
  color: #666;
  width: 100px;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: .5;
  }
}
</style>