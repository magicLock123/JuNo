<template>
  <div class="dispatch-container">
    <ManagementLayout :data="filteredOrders" :loading="loading" :total="filteredOrders.length">

      <template #header-left>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <el-input v-model="searchOrder" placeholder="搜索单号..." class="w-full sm:!w-64" clearable />
          <el-select v-model="filterStatus" placeholder="状态" class="w-full sm:!w-32" clearable>
            <el-option label="待派单" value="pending" />
            <el-option label="双人补位中" value="pending_double" />
            <el-option label="打单中" value="ongoing" />
            <el-option label="已上号" value="ongoing_up" />
            <el-option label="待审核" value="pending_review" />
          </el-select>
        </div>
      </template>

      <template #header-right>
        <div class="flex items-center justify-end w-full sm:w-auto mt-2 sm:mt-0 gap-4">
          <div class="hidden sm:block text-gray-500 text-sm">
            待审核: <span class="text-orange-500 font-bold">{{ reviewCount }}</span>
            <el-divider direction="vertical" />
            待指派: <span class="text-red-500 font-bold">{{ pendingCount }}</span>
          </div>
          <el-button type="success" class="!rounded-lg font-bold w-full sm:w-auto" @click="openCreateDialog">
            <el-icon class="mr-1">
              <Plus />
            </el-icon>发布订单
          </el-button>
        </div>
      </template>

      <template #content="{ item }">
        <div class="hidden sm:block">
          <el-descriptions :column="3" border direction="horizontal">
            <el-descriptions-item label="订单编号">
              <span class="font-mono font-bold text-gray-800">{{ item.orderSn }}</span>
              <el-tag size="small" class="ml-2" effect="plain">{{ item.isDouble === '0' ? '单排' : '双排' }}</el-tag>
              <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark"
                class="ml-2 animate-pulse">曾取消</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="发起时间">{{ item.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <el-tag :type="getStatusTag(item.status)" effect="dark">{{ formatStatus(item.status) }}</el-tag>
            </el-descriptions-item>

            <el-descriptions-item label="负责打手">
              <span v-if="item.player || item.playerId2" class="text-brand font-bold">{{ getPlayerDisplay(item)
              }}</span>
              <span v-else class="text-gray-400 italic">等待指派</span>
            </el-descriptions-item>
            <el-descriptions-item label="订单类型">{{ getLevelName(item.orderType) }}</el-descriptions-item>
            <el-descriptions-item label="订单资金/备注" :span="2">
              <div class="flex flex-col gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-gray-500 text-sm">总:￥{{ (item.amount || 0).toFixed(2) }}</span>
                  <el-divider direction="vertical" />
                  <span class="text-orange-600 font-bold text-sm">佣金:￥{{ (item.playerAmount || 0).toFixed(2) }}</span>
                </div>

                <div v-if="item.isTransfered === 1 && item.transferReason"
                  class="mt-1 p-2 rounded bg-red-50 border border-red-100 text-xs text-red-700 w-fit">
                  <span class="font-bold">打手取消原因：</span>{{ item.transferReason }}
                </div>

                <span class="text-sm text-gray-500">{{ item.positionNote || '（无备注）' }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block sm:hidden bg-white p-3 rounded-xl border border-gray-100 shadow-sm mb-3">
          <div class="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-gray-800 text-sm">{{ item.orderSn }}</span>
              <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark"
                class="scale-90 animate-pulse">曾取消</el-tag>
            </div>
            <el-tag :type="getStatusTag(item.status)" size="small" effect="dark" class="!border-none">
              {{ formatStatus(item.status) }}
            </el-tag>
          </div>

          <div class="bg-[#f8fafc] rounded-lg p-2.5 text-xs text-gray-600 flex flex-col gap-2">
            <div class="flex justify-between items-center">
              <div><span class="text-gray-400">类型：</span>{{ getLevelName(item.orderType) }}</div>
              <div>
                <span class="text-gray-400">佣金：</span>
                <span class="text-orange-600 font-bold text-base font-mono">￥{{ (item.playerAmount || 0).toFixed(2)
                }}</span>
              </div>
            </div>
            <div class="flex items-center">
              <span class="text-gray-400">打手：</span>
              <span v-if="item.player || item.playerId2" class="text-brand font-bold">{{ getPlayerDisplay(item)
              }}</span>
              <span v-else class="text-gray-400 italic">等待指派</span>
            </div>

            <div class="pt-2 mt-1 border-t border-gray-100/80 space-y-1.5">
              <div v-if="item.isTransfered === 1 && item.transferReason"
                class="p-2 rounded bg-red-50 text-red-700 border border-red-100">
                <span class="font-bold">打手取消原因：</span>{{ item.transferReason }}
              </div>
              <div><span class="text-gray-400">备注：</span>{{ item.positionNote || '无' }}</div>
            </div>
          </div>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex flex-col gap-2 w-full">
          <template v-if="item.status === 'pending'">
            <el-button type="primary" class="w-full !m-0 !h-9 font-bold"
              @click="openDispatchDialog(item)">后台强指</el-button>
          </template>

          <template v-else-if="item.status === 'pending_review'">
            <el-button type="warning" class="w-full !m-0 !h-9 font-bold !text-white animate-pulse"
              @click="openReviewDialog(item)">确认完成</el-button>
          </template>

          <template v-else>
            <el-button type="info" plain class="w-full !m-0 !h-9" @click="handleViewRemark(item)">查看详情</el-button>
          </template>
        </div>
      </template>

    </ManagementLayout>

    <el-dialog v-model="dispatchVisible" title="强制指派打手" width="min(95vw, 500px)" class="!rounded-xl">
      <el-table :data="availablePlayers" highlight-current-row @current-change="handlePlayerSelect" class="w-full">
        <el-table-column label="选择" width="60" align="center">
          <template #default="{ row }">
            <el-radio :model-value="selectedPlayerId" :label="row.id" :value="row.id">{{ '' }}</el-radio>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="打手名称" min-width="120" />
      </el-table>
      <template #footer>
        <el-button @click="dispatchVisible = false">取消</el-button>
        <el-button type="primary" :disabled="!selectedPlayerId" @click="confirmDispatch">确认指派</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reviewVisible" title="结单审核 (进入押金期)" width="min(95vw, 400px)" class="!rounded-xl">
      <div v-if="currentReviewOrder" class="space-y-4">
        <el-alert title="确认老板已经验收完毕？操作后将进入7天押金期" type="warning" show-icon :closable="false"
          class="!bg-orange-50 !text-orange-600" />
      </div>
      <template #footer>
        <div class="flex justify-between w-full gap-4">
          <el-button type="success" class="flex-1 !ml-0" @click="submitReview">进入押金期</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="remarkVisible" title="备注详情" width="min(95vw, 350px)" class="!rounded-xl">
      <div v-if="currentRemarkOrder" class="p-4 bg-gray-50 rounded-lg text-gray-600 text-sm min-h-[80px]">
        {{ currentRemarkOrder.positionNote || '暂无相关备注信息' }}
      </div>
      <template #footer>
        <el-button class="w-full" @click="remarkVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="createVisible" title="发布新订单" width="min(95vw, 650px)" class="!rounded-xl" destroy-on-close>
      <el-form :model="createForm" :rules="createRules" ref="createFormRef" label-width="90px" class="mt-2 pr-4">
        <div class="flex flex-col sm:flex-row gap-x-6">
          <el-form-item label="游戏名称" prop="gameName" class="flex-1">
            <el-select v-model="createForm.gameName" placeholder="Select" class="w-full">
              <el-option label="三角洲行动" value="三角洲行动" />
              <el-option label="无畏契约" value="无畏契约" />
              <el-option label="洛克王国" value="洛克王国" />
            </el-select>
          </el-form-item>
          <el-form-item label="要求等级" prop="orderType" class="flex-1">
            <el-select v-model="createForm.orderType" class="w-full">
              <el-option label="娱乐" :value="0" />
              <el-option label="守卫" :value="1" />
              <el-option label="骑士" :value="2" />
              <el-option label="荣光骑士" :value="3" />
            </el-select>
          </el-form-item>
        </div>

        <div class="flex flex-col sm:flex-row gap-x-6">
          <el-form-item label="订单金额" prop="amount" class="flex-1">
            <el-input-number v-model="createForm.amount" :precision="2" :step="1" :min="0" class="!w-full"
              @change="handleAmountChange" />
          </el-form-item>
          <el-form-item label="打手佣金" prop="playerAmount" class="flex-1">
            <el-input-number v-model="createForm.playerAmount" :precision="2" :step="1" :min="0" class="!w-full" />
          </el-form-item>
        </div>

        <el-form-item label="是否双排">
          <el-switch v-model="createForm.isDouble" active-text="双排" inactive-text="单排" />
        </el-form-item>

        <el-form-item label="位置/备注" prop="positionNote">
          <el-input v-model="createForm.positionNote" type="textarea" :rows="3" placeholder="请输入具体的代练要求或注意事项..." />
        </el-form-item>
        <el-form-item label="指定打手" prop="playerId">
          <el-select v-model="createForm.playerId" placeholder="不指定 (默认发布至大厅)" clearable class="w-full">
            <el-option v-for="p in allPlayers" :key="p.id" :label="p.nickname || p.name" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-3 mt-2">
          <el-button class="!rounded-lg !px-6" @click="createVisible = false">取消</el-button>
          <el-button color="#4b5563" class="!rounded-lg !px-6 !text-white hover:!bg-gray-700" @click="submitCreate">
            {{ createForm.playerId ? '直接指派并发布' : '直接发布至大厅' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ManagementLayout from '@/components/ManagementLayout.vue'
import { ref, computed, onMounted, reactive } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { dispatchApi } from '@/api/dispatch'
import { playerApi } from '@/api/player'
import { useUserStore } from '@/store/user'
import request from '@/request'

const userStore = useUserStore()
const loading = ref(false)
const orderList = ref<any[]>([])
const allPlayers = ref<any[]>([])

const searchOrder = ref('')
const filterStatus = ref('')
const remarkVisible = ref(false)
const currentRemarkOrder = ref<any>(null)
const createFormRef = ref()

const handleViewRemark = (row: any) => {
  currentRemarkOrder.value = row
  remarkVisible.value = true
}

const formatStatus = (s: string) => {
  const map: Record<string, string> = {
    'pending': '待派单',
    'pending_double': '双人待补位',
    'ongoing': '打单中',
    'ongoing_up': '已上号',
    'pending_review': '待审核',
    'completed': '已结单',
    'deposit': '押金期',
    'pending_distribution': '待发工资',
    'after_sales': '售后中'
  }
  return map[s] || s
}

const initData = async () => {
  loading.value = true
  try {
    const orderRes = await dispatchApi.getList({ page: 1, size: 50 })
    if (orderRes.code === 200) {
      orderList.value = orderRes.data?.records || []
    }

    const playerRes = await playerApi.getList()
    if (playerRes.code === 200) {
      allPlayers.value = playerRes.data || []
    }
  } catch (error) {
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const filteredOrders = computed(() => {
  const targetStatuses = ['pending', 'ongoing', 'ongoing_up', 'pending_review', 'pending_double']

  return orderList.value.filter(o => {
    if (!targetStatuses.includes(o.status)) return false

    const matchSearch = (o.orderSn || '').toLowerCase().includes(searchOrder.value.toLowerCase())
    const matchStatus = filterStatus.value ? o.status === filterStatus.value : true
    return matchSearch && matchStatus
  })
})

const pendingCount = computed(() => orderList.value.filter(o => o.status === 'pending').length)
const reviewCount = computed(() => orderList.value.filter(o => o.status === 'pending_review').length)

const getStatusTag = (s: string) => {
  const map: any = {
    'pending': 'danger',
    'pending_double': 'danger',
    'ongoing': 'primary',
    'pending_review': 'warning',
    'completed': 'success',
    'deposit': 'info',
    'pending_distribution': 'warning'
  }
  return map[s] || 'info'
}

const handleAmountChange = (currentValue: number | undefined) => {
  if (currentValue !== undefined && currentValue !== null) {
    createForm.playerAmount = Number((currentValue * 0.8).toFixed(2))
  } else {
    createForm.playerAmount = 0.00
  }
}

const createVisible = ref(false)
const openCreateDialog = () => { createVisible.value = true }

const dispatchVisible = ref(false)
const selectedPlayerId = ref<number | null>(null)
const currentOrder = ref<any>(null)
const availablePlayers = computed(() => allPlayers.value)

const openDispatchDialog = (row: any) => {
  currentOrder.value = row
  selectedPlayerId.value = null
  dispatchVisible.value = true
}

const handlePlayerSelect = (val: any) => {
  if (val) selectedPlayerId.value = val.id
}

const confirmDispatch = async () => {
  if (!selectedPlayerId.value || !currentOrder.value) return
  try {
    const res = await dispatchApi.assignToPlayer(currentOrder.value.orderSn, selectedPlayerId.value)
    if (res.code === 200) {
      ElMessage.success('指派成功')
      dispatchVisible.value = false
      initData()
    } else {
      ElMessage.error(res.msg || res.message || '指派失败')
    }
  } catch (err) {
    ElMessage.error('指派请求异常')
  }
}

const reviewVisible = ref(false)
const currentReviewOrder = ref<any>(null)
const openReviewDialog = (row: any) => {
  currentReviewOrder.value = row
  reviewVisible.value = true
}

const submitReview = async () => {
  try {
    const res: any = await request.post('/manager/order/approve', { orderSn: currentReviewOrder.value.orderSn })
    if (res.code === 200) {
      ElMessage.success('已审核通过，进入押金期')
      reviewVisible.value = false
      initData()
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('请求异常')
  }
}

const createForm = reactive({
  gameName: '',
  projectContent: '',
  amount: 0.00,
  playerAmount: 0.00,
  positionNote: '',
  orderType: 1,
  isDouble: false,
  playerId: null as number | null
})

const createRules = reactive({
  gameName: [{ required: true, message: '请选择游戏', trigger: 'change' }],
  projectContent: [{ required: true, message: '请输入商品内容', trigger: 'blur' }],
  amount: [{ required: true, message: '请输入总金额', trigger: 'blur' }],
  playerAmount: [{ required: true, message: '请输入佣金', trigger: 'blur' }]
})

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' }
  return map[level] ?? '未知'
}

const getPlayerDisplay = (item: any) => {
  if (item.isDouble === '1') {
    const p1 = item.player?.nickname || '待定'
    const p2 = item.playerId2?.nickname || '待定'
    return `${p1} & ${p2}`
  }
  return item.player?.nickname || '等待指派'
}

const submitCreate = async () => {
  if (!createFormRef.value) return

  await createFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const payload = {
          gameName: createForm.gameName,
          projectContent: createForm.projectContent,
          amount: createForm.amount,
          playerAmount: createForm.playerAmount,
          positionNote: createForm.positionNote,
          orderType: createForm.orderType,
          isDouble: createForm.isDouble ? '1' : '0',
          csId: userStore.userInfo?.id,
          playerId: createForm.playerId
        }

        const res = await dispatchApi.createOrder(payload)

        if (res.code === 200) {
          if (createForm.playerId) {
            ElMessage.success('发布并指派成功，订单已进入打单中！')
          } else {
            ElMessage.success('需求发布成功，已推送至打手大厅！')
          }

          createVisible.value = false
          createFormRef.value.resetFields()
          createForm.playerId = null
          initData()
        } else {
          ElMessage.error(res.msg || res.message || '发布失败')
        }
      } catch (err) {
        ElMessage.error('发布请求异常')
      }
    } else {
      ElMessage.warning('请完善必填信息')
    }
  })
}

onMounted(initData)
</script>