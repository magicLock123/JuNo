<template>
  <div class="history-container">
    <ManagementLayout :data="filteredOrders" :loading="loading" :total="filteredOrders.length">

      <template #header-left>
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-bold text-gray-800 hidden sm:block mr-2">历史记录</h2>

          <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
            end-placeholder="结束日期" class="!w-64" size="default" />

          <el-input v-model="searchKeyword" placeholder="搜索单号/打手/客户" class="!w-48" clearable>
            <template #prefix><el-icon>
                <Search />
              </el-icon></template>
          </el-input>

          <el-select v-model="filterStatus" placeholder="所有状态" class="!w-32" clearable>
            <el-option label="7天押金" value="deposit" />
            <el-option label="待发工资" value="pending_distribution" />
            <el-option label="售后处理完毕" value="resolved" />
            <el-option label="售后中" value="after_sales" />
            <el-option label="已完成" value="completed" />
            <el-option label="已取消" value="cancelled" />
          </el-select>
        </div>
      </template>

      <template #content="{ item }">
        <div class="hidden sm:block">
          <el-descriptions :column="4" border direction="horizontal">
            <el-descriptions-item label="订单编号">
              <div class="flex items-center gap-2">
                <span class="font-mono font-bold text-gray-800">{{ item.orderSn }}</span>
                <el-tag v-if="item.hasAfterSales" type="danger" size="small" effect="light">已售后</el-tag>
                <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark" class="animate-pulse">曾取消</el-tag>
              </div>
            </el-descriptions-item>
            <el-descriptions-item label="结单时间">{{ item.finishedAt || item.createdAt }}</el-descriptions-item>
            <el-descriptions-item label="最终状态">
              <el-tag :type="getStatusTag(item.status)" effect="dark" size="small">{{ formatStatus(item.status)
                }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="负责打手">
              <span class="text-brand font-bold">{{ getPlayerDisplay(item) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="游戏/类型">{{ item.gameName }} - {{ getLevelName(item.orderType)
              }}</el-descriptions-item>
            <el-descriptions-item label="派单客服">{{ item.cs?.nickname || '未知' }}</el-descriptions-item>

            <el-descriptions-item label="订单总资金" :span="1">
              <div v-if="item.hasAfterSales">
                <div class="text-blue-600 font-bold text-lg font-mono leading-none">￥{{ (item.finalAmount ||
                  0).toFixed(2) }}</div>
                <div class="text-gray-400 text-xs line-through mt-1">原总计: ￥{{ (item.amount || 0).toFixed(2) }}</div>
              </div>
              <div v-else>
                <span class="text-blue-600 font-bold text-lg font-mono">￥{{ (item.amount || 0).toFixed(2) }}</span>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="打手佣金" :span="1">
              <div v-if="item.hasAfterSales">
                <div class="text-orange-600 font-bold text-lg font-mono leading-none">￥{{ (item.finalPlayerAmount ||
                  0).toFixed(2) }}</div>
                <div class="text-gray-400 text-xs line-through mt-1">原佣金: ￥{{ (item.playerAmount || 0).toFixed(2) }}
                </div>
              </div>
              <div v-else>
                <span class="text-orange-600 font-bold text-lg font-mono">￥{{ (item.playerAmount || 0).toFixed(2)
                  }}</span>
              </div>
            </el-descriptions-item>

            <el-descriptions-item label="备注说明" :span="4">
              <div class="flex flex-col gap-1">
                 <div v-if="item.isTransfered === 1 && item.transferReason" class="p-1.5 rounded bg-red-50 border border-red-100 text-xs text-red-700 leading-tight w-fit">
                    <span class="font-bold">取消原因：</span>{{ item.transferReason }}
                 </div>
                 <span class="text-xs text-gray-500">{{ item.positionNote || '无备注' }}</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="block sm:hidden bg-white p-3 rounded-xl border border-gray-100 shadow-sm w-full">
          <div class="flex justify-between items-start mb-2 border-b border-gray-50 pb-2">
            <div>
              <div class="flex items-center gap-1">
                <span class="font-mono font-bold text-gray-800 text-sm">{{ item.orderSn }}</span>
                <el-tag v-if="item.hasAfterSales" type="danger" size="small">已售后</el-tag>
                <el-tag v-if="item.isTransfered === 1" type="danger" size="small" effect="dark" class="scale-90 animate-pulse">曾取消</el-tag>
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ item.finishedAt || item.createdAt }}</div>
            </div>
            <el-tag :type="getStatusTag(item.status)" size="small" effect="dark">{{ formatStatus(item.status)
              }}</el-tag>
          </div>

          <div class="grid grid-cols-2 gap-y-2 text-xs text-gray-500 mt-2">
            <div>类型：{{ getLevelName(item.orderType) }}</div>
            <div class="text-right">打手：<span class="text-brand font-bold">{{ item.player?.nickname || '未知' }}</span>
            </div>

            <div class="col-span-2 flex justify-between items-center bg-gray-50 p-2 rounded mt-1">
              <span>订单总资金</span>
              <div class="text-right">
                <div v-if="item.hasAfterSales" class="text-gray-400 text-[10px] line-through">原定: ￥{{ (item.amount ||
                  0).toFixed(2) }}</div>
                <div class="text-blue-600 font-bold text-sm">￥{{ item.hasAfterSales ? (item.finalAmount || 0).toFixed(2)
                  : (item.amount || 0).toFixed(2) }}</div>
              </div>
            </div>

            <div class="col-span-2 flex justify-between items-center bg-orange-50 p-2 rounded mt-1">
              <span>打手佣金</span>
              <div class="text-right">
                <div v-if="item.hasAfterSales" class="text-gray-400 text-[10px] line-through">原定: ￥{{ (item.playerAmount
                  || 0).toFixed(2) }}</div>
                <div class="text-orange-600 font-bold text-sm">￥{{ item.hasAfterSales ? (item.finalPlayerAmount ||
                  0).toFixed(2) : (item.playerAmount || 0).toFixed(2) }}</div>
              </div>
            </div>

            <div v-if="item.isTransfered === 1 && item.transferReason" class="col-span-2 mt-1 p-2 rounded bg-red-50/50 text-red-500 border border-red-500/20 text-xs">
              <span class="font-bold text-red-400">取消原因：</span>{{ item.transferReason }}
            </div>
          </div>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex flex-col gap-2 w-full">
          <el-button type="info" plain class="w-full !m-0 font-bold" @click="handleViewDetail(item)">查看快照</el-button>

          <el-button v-if="item.status === 'completed' && userStore.role === 'Admin'" type="danger" plain
            class="w-full !m-0" @click="handleReopen(item)">
            重启订单
          </el-button>

          <el-button v-if="item.status === 'pending_distribution' && userStore.role === 'Admin'" type="success"
            class="w-full !m-0 font-bold !text-white" @click="handleDistribute(item)">
            发放工资
          </el-button>

          <el-button v-if="item.status === 'deposit'" type="info" disabled class="w-full !m-0 font-bold !text-white">
            冷静期中
          </el-button>

          <el-button v-if="item.status === 'deposit'" type="danger" plain class="w-full !m-0 font-bold"
            @click="handleOpenAfterSales(item)">
            申请售后
          </el-button>
        </div>
      </template>

    </ManagementLayout>

    <el-dialog v-model="detailVisible" title="历史订单快照" width="min(95vw, 500px)" class="!rounded-xl">
      <div v-if="currentOrder" class="p-4 bg-gray-50 rounded-lg text-sm text-gray-600 space-y-3">
        <p><strong>单号：</strong> <span class="font-mono text-gray-800">{{ currentOrder.orderSn }}</span></p>
        <p><strong>完结时间：</strong> {{ currentOrder.finishedAt || currentOrder.createdAt }}</p>
        <div class="border-t border-gray-200 pt-2 mt-2">
          <strong>处理备注：</strong>
          <p class="mt-1 italic text-gray-500">{{ currentOrder.positionNote || '无异常记录，正常结单。' }}</p>
        </div>
      </div>
      <template #footer>
        <el-button class="w-full" @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="afterSalesVisible" title="发起售后申请" width="min(95vw, 400px)" class="!rounded-xl">
      <el-form :model="afterSalesForm" label-width="80px" class="mt-4">
        <el-form-item label="关联订单">
          <el-input v-model="afterSalesForm.orderNo" disabled class="font-mono" />
        </el-form-item>
        <el-form-item label="涉及金额">
          <el-input-number v-model="afterSalesForm.amount" :min="0" :precision="2" :step="10" class="!w-full" />
        </el-form-item>
        <el-form-item label="售后原因" required>
          <el-input v-model="afterSalesForm.reason" type="textarea" :rows="3" placeholder="请详细描述客户的售后诉求或打手违规情况..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="flex gap-3">
          <el-button class="flex-1" @click="afterSalesVisible = false">取消</el-button>
          <el-button type="warning" class="flex-1" :loading="submittingAfterSales"
            @click="submitAfterSales">提交工单</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ManagementLayout from '@/components/ManagementLayout.vue'
import { ref, computed, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'
import { dispatchApi } from '@/api/dispatch'
import request from '@/request'

const userStore = useUserStore()

const loading = ref(false)
const historyList = ref<any[]>([])

const dateRange = ref<[Date, Date] | null>(null)
const searchKeyword = ref('')
const filterStatus = ref('')
const afterSalesVisible = ref(false)
const submittingAfterSales = ref(false)
const afterSalesForm = ref({
  orderNo: '',
  amount: 0,
  reason: ''
})

const handleOpenAfterSales = (row: any) => {
  afterSalesForm.value = {
    orderNo: row.orderSn,
    amount: row.amount || 0, 
    reason: ''
  }
  afterSalesVisible.value = true
}

const submitAfterSales = async () => {
  if (!afterSalesForm.value.reason.trim()) {
    return ElMessage.warning('请填写售后原因')
  }

  submittingAfterSales.value = true
  try {
    const payload = { ...afterSalesForm.value }
    const res: any = await request.post('/manager/after-sales/create', payload)

    if (res.code === 200) {
      ElMessage.success('售后申请已提交，订单已锁定')
      afterSalesVisible.value = false
      initData() 
    } else {
      ElMessage.error(res.msg || '提交失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  } finally {
    submittingAfterSales.value = false
  }
}

const handleDistribute = async (row: any) => {
  ElMessageBox.confirm(`确认该订单不出售后，为打手结算工资吗？`, '结算确认', { type: 'warning' })
    .then(async () => {
      const res: any = await request.post('/manager/order/distribute', { orderSn: row.orderSn })
      if (res.code === 200) {
        ElMessage.success('工资已结算，该订单彻底完结')
        initData() 
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    })
}

const initData = async () => {
  loading.value = true
  try {
    const res = await dispatchApi.getList({ page: 1, size: 500 })
    if (res.code === 200) {
      const targetStatuses = ['deposit', 'pending_distribution', 'after_sales', 'resolved', 'completed', 'cancelled']
      historyList.value = (res.data?.records || []).filter((o: any) => targetStatuses.includes(o.status))
    } else {
      ElMessage.error(res.message || '获取历史记录失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' }
  return map[level] ?? '默认'
}

const getPlayerDisplay = (item: any) => {
  if (item.isDouble === '1') {
    const p1 = item.player?.nickname || '待定'
    const p2 = item.playerId2?.nickname || '待定'
    return `${p1} & ${p2}`
  }
  return item.player?.nickname || '等待指派'
}

const formatStatus = (s: string) => {
  const map: Record<string, string> = {
    'deposit': '7天押金',
    'pending_distribution': '待发工资',
    'resolved': '售后处理完毕',
    'after_sales': '售后中',
    'completed': '已完成',
    'cancelled': '已取消'
  }
  return map[s] || s
}

const getStatusTag = (s: string) => {
  const map: Record<string, string> = {
    'deposit': 'info',
    'pending_distribution': 'warning',
    'resolved': 'success',
    'completed': 'success',
    'cancelled': 'info',
    'after_sales': 'danger'
  }
  return map[s] || 'info'
}

const filteredOrders = computed(() => {
  return historyList.value.filter(o => {
    const keyword = searchKeyword.value.toLowerCase()
    const matchSearch = (o.orderSn || '').toLowerCase().includes(keyword) ||
      (o.player?.nickname || '').toLowerCase().includes(keyword) ||
      (o.playerId2?.nickname || '').toLowerCase().includes(keyword) ||
      (o.cs?.nickname || '').toLowerCase().includes(keyword)

    const matchStatus = filterStatus.value ? o.status === filterStatus.value : true

    let matchDate = true
    if (dateRange.value && dateRange.value.length === 2) {
      const timeStr = o.finishedAt || o.createdAt
      if (timeStr) {
        const safeTimeStr = timeStr.replace(/-/g, '/')
        const orderDate = new Date(safeTimeStr).getTime()
        const start = dateRange.value[0].getTime()
        const end = dateRange.value[1].getTime() + 86400000
        matchDate = orderDate >= start && orderDate <= end
      }
    }

    return matchSearch && matchStatus && matchDate
  })
})

const detailVisible = ref(false)
const currentOrder = ref<any>(null)

const handleViewDetail = (row: any) => {
  currentOrder.value = row
  detailVisible.value = true
}

const handleReopen = (row: any) => {
  ElMessageBox.confirm(`确定要重启单号 ${row.orderSn} 吗？订单将退回待派单池。`, '高危操作', { type: 'error' })
    .then(async () => {
      ElMessage.success('订单已重启，请前往派单中心查看')
      historyList.value = historyList.value.filter(o => o.id !== row.id)
    })
    .catch(() => { })
}

onMounted(initData)
</script>