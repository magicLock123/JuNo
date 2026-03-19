<template>
  <div class="space-y-4 p-4 sm:p-6 bg-[#f5f7fa] min-h-screen pb-20">
    <div
      class="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <el-input v-model="searchQuery" placeholder="搜索单号或申诉人..." class="!w-full md:!w-64" clearable>
          <template #prefix><el-icon>
              <Search />
            </el-icon></template>
        </el-input>

        <el-radio-group v-model="activeTab" class="w-full md:w-auto flex-nowrap overflow-x-auto" size="small">
          <el-radio-button value="pending">待处理</el-radio-button>
          <el-radio-button value="processing">处理中</el-radio-button>
          <el-radio-button value="resolved">已完结</el-radio-button>
        </el-radio-group>
      </div>
      <el-button type="primary" class="!bg-brand !border-none !text-white w-full md:w-auto font-bold" @click="fetchData"
        :loading="loading">
        刷新工单
      </el-button>
    </div>

    <div v-loading="loading" class="space-y-4">

      <div class="hidden md:block space-y-4">
        <div v-for="(row, index) in filteredTickets" :key="row.id || index"
          class="bg-white rounded-xl shadow-sm p-4 flex flex-col md:flex-row border border-gray-100 hover:border-brand/30 transition-all duration-300">
          <div class="flex-grow">
            <el-descriptions :column="3" border direction="horizontal">
              <el-descriptions-item label="售后单号" min-width="150">
                <span class="font-mono text-gray-500">{{ row.ticketNo }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="关联订单">
                <span class="font-mono font-bold text-brand">{{ row.orderNo }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="工单状态">
                <el-tag :type="getStatusTag(row.status)" effect="dark">{{ getStatusLabel(row.status) }}</el-tag>
              </el-descriptions-item>

              <el-descriptions-item label="申诉发起人">
                {{ row.initiator }} ({{ row.initiatorType === 'client' ? '客户申诉' : '打手申诉' }})
              </el-descriptions-item>
              <el-descriptions-item label="发起时间">{{ row.createTime }}</el-descriptions-item>
              
              <el-descriptions-item label="原定总资金">
                <span class="text-blue-600 font-bold font-mono">￥{{ row.amount.toFixed(2) }}</span>
              </el-descriptions-item>

              <el-descriptions-item label="申诉理由" :span="3">
                <div class="text-gray-600 italic">“ {{ row.reason }} ”</div>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <div class="md:ml-6 flex flex-col justify-center py-1 md:w-36 w-full mt-4 md:mt-0 gap-3">
            <el-button type="primary" class="w-full !ml-0 !rounded-lg font-bold !text-white !bg-brand !border-none"
              @click="openProcessDialog(row)">
              {{ row.status === 'resolved' ? '查看详情' : '处理工单' }}
            </el-button>

            <div class="text-[10px] text-gray-400 text-center uppercase font-bold tracking-tighter"
              v-if="row.status === 'resolved'">
              处理人: {{ row.processorName || '未知' }}
            </div>
          </div>
        </div>
      </div>

      <div class="md:hidden space-y-3">
        <div v-for="row in filteredTickets" :key="'mobile-' + row.id"
          class="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col gap-3">
          <div class="flex justify-between items-center border-b border-gray-50 pb-2">
            <span class="font-mono font-bold text-gray-800 text-sm">{{ row.orderNo }}</span>
            <el-tag :type="getStatusTag(row.status)" effect="dark" size="small">{{ getStatusLabel(row.status)
            }}</el-tag>
          </div>

          <div class="grid grid-cols-2 gap-y-2 text-sm">
            <div class="text-gray-600">
              <span class="text-gray-400">申诉方：</span>
              <span class="font-bold">{{ row.initiator }}</span>
            </div>
            
            <div class="text-right text-gray-600">
              <span class="text-gray-400">原定总资金：</span>
              <span class="font-mono font-bold text-blue-600">￥{{ row.amount.toFixed(2) }}</span>
            </div>
            
            <div class="col-span-2 text-gray-600 mt-1 bg-gray-50 p-2 rounded text-xs leading-relaxed">
              <span class="text-gray-400 font-bold">理由：</span>{{ row.reason }}
            </div>
          </div>

          <div class="text-[11px] text-green-700 font-bold text-center bg-green-50 py-1.5 rounded mt-2 border border-green-100"
            v-if="row.status === 'resolved'">
            原定: ￥{{ (row.amount || 0).toFixed(2) }} | 终总: ￥{{ (row.finalOrderAmount || 0).toFixed(2) }} | 终佣: ￥{{ (row.finalPlayerAmount || 0).toFixed(2) }}
          </div>

          <div class="flex justify-between items-center pt-3 border-t border-gray-50 mt-1">
            <span class="text-xs text-gray-400 font-mono">{{ row.createTime.split(' ')[0] }}</span>
            <el-button size="small" type="primary" class="!text-white !bg-brand !border-none !rounded-lg px-4 font-bold"
              @click="openProcessDialog(row)">
              {{ row.status === 'resolved' ? '查看详情' : '立即处理' }}
            </el-button>
          </div>
        </div>
      </div>

      <el-empty v-if="filteredTickets.length === 0" description="暂无相关售后记录" />
    </div>

    <el-dialog v-model="processVisible" :title="currentTicket?.status === 'resolved' ? '工单结案详情' : '售后裁定处理'" width="90%"
      class="max-w-md" destroy-on-close>
      <div v-if="currentTicket" class="space-y-4">

        <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm">
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">售后单号：</span>
            <span class="font-mono">{{ currentTicket.ticketNo }}</span>
          </div>
          <div class="flex justify-between mb-2">
            <span class="text-gray-500">关联订单：</span>
            <span class="font-mono font-bold">{{ currentTicket.orderNo }}</span>
          </div>
          <el-divider border-style="dashed" class="!my-3" />
          <div class="text-gray-700 leading-relaxed italic text-xs">
            "{{ currentTicket.reason }}"
          </div>
        </div>

        <el-form v-if="currentTicket.status !== 'resolved'" :model="processForm" label-position="top">
          <el-form-item label="裁定责任归属" required>
            <el-radio-group v-model="processForm.responsibility" class="flex flex-col gap-2">
              <el-radio value="player">打手违规 (扣除部分/全部佣金)</el-radio>
              <el-radio value="client">老板无理 (驳回并原价结算)</el-radio>
              <el-radio value="platform">平台补贴 (额外奖励打手)</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="最终订单总资金" prop="finalOrderAmount" v-if="processForm.responsibility !== 'client'">
            <el-input-number v-model="processForm.finalOrderAmount" :min="0" :precision="2" :step="10"
              class="!w-full" />
            <div class="text-[10px] text-gray-400 mt-1 leading-tight">退款后，该订单最终保留的实际总资金</div>
          </el-form-item>

          <el-form-item label="最终打手佣金" prop="finalPlayerAmount" v-if="processForm.responsibility !== 'client'">
            <el-input-number v-model="processForm.finalPlayerAmount" :min="0" :precision="2" :step="10"
              class="!w-full" />
            <div class="text-[10px] text-orange-400 mt-1 leading-tight">裁定后，打手最终应得的实际佣金</div>
          </el-form-item>

          <el-form-item label="裁定备注">
            <el-input v-model="processForm.remark" type="textarea" :rows="3" placeholder="请填写详细的处理方案..." />
          </el-form-item>
        </el-form>

        <div v-else class="bg-green-50 p-4 rounded-lg border border-green-200 text-sm">
          <div class="font-bold text-green-700 mb-2 flex items-center gap-1">
            <el-icon>
              <CircleCheckFilled />
            </el-icon> 结案结算详情：
          </div>
          <div class="text-green-700 mb-3 font-bold text-xs leading-relaxed">
            原定总资金: ￥{{ currentTicket.amount || 0 }}<br />最终总资金: ￥{{ currentTicket.finalOrderAmount || 0 }}<br />原定总资金: ￥{{ currentTicket.amount || 0 }}<br />最终打手佣金: ￥{{ currentTicket.finalPlayerAmount || 0 }}
          </div>
          <div class="text-gray-600"><span class="font-bold text-gray-500">处理意见：</span>{{ currentTicket.processRemark }}
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="processVisible = false">取消</el-button>
          <el-button v-if="currentTicket?.status !== 'resolved'" type="primary"
            class="!text-white !bg-brand !border-none font-bold" @click="submitProcess" :loading="submitting">
            确认裁定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import request from '@/request'
import { ref, reactive, computed, onMounted } from 'vue'
import { Search, CircleCheckFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const activeTab = ref('pending')
const tickets = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await request.get('/manager/after-sales/list')
    if (res.code === 200) {
      tickets.value = res.data || []
    }
  } finally {
    loading.value = false
  }
}

const filteredTickets = computed(() => {
  return tickets.value.filter(t => {
    const matchStatus = t.status === activeTab.value
    const matchSearch = t.orderNo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      t.initiator.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchStatus && matchSearch
  })
})

const getStatusTag = (s: string) => {
  const map: any = { 'pending': 'danger', 'processing': 'warning', 'resolved': 'success' }
  return map[s] || 'info'
}
const getStatusLabel = (s: string) => {
  const map: any = { 'pending': '待处理', 'processing': '处理中', 'resolved': '已完结' }
  return map[s] || s
}

const processVisible = ref(false)
const currentTicket = ref<any>(null)

const processForm = reactive({ responsibility: 'player', finalOrderAmount: 0, finalPlayerAmount: 0, remark: '' })

const openProcessDialog = (row: any) => {
  currentTicket.value = row
  if (row.status !== 'resolved') {
    processForm.responsibility = row.responsibility || 'player'
    processForm.finalOrderAmount = row.amount || 0 // 默认带出原订单金额
    processForm.finalPlayerAmount = 0 // 默认清零，由客服手动输入最终给打手的钱
    processForm.remark = ''
    if (row.status === 'pending') row.status = 'processing'
  }
  processVisible.value = true
}

const submitProcess = async () => {
  if (!processForm.remark.trim()) return ElMessage.warning('请填写处理裁定备注')
  
  ElMessageBox.confirm('确定提交此裁定结果吗？系统将以此作为最终金额进行流水结算，提交后无法撤回。', '裁定确认').then(async () => {
    submitting.value = true
    try {
      const payload = {
        ticketNo: currentTicket.value.ticketNo,
        responsibility: processForm.responsibility,
        // 如果是老板无理取闹，后端直接按原价算，这里可以传原价或者0让后端判断
        finalOrderAmount: processForm.responsibility === 'client' ? currentTicket.value.amount : processForm.finalOrderAmount,
        finalPlayerAmount: processForm.responsibility === 'client' ? null : processForm.finalPlayerAmount, 
        remark: processForm.remark
      }
      
      const res: any = await request.post('/manager/after-sales/process', payload)
      if (res.code === 200) {
        ElMessage.success('裁定已生效，订单最终资金重置成功')
        processVisible.value = false
        fetchData()
      } else {
        ElMessage.error(res.msg || '提交失败')
      }
    } finally {
      submitting.value = false
    }
  })
}

onMounted(fetchData)
</script>

<style scoped>
:deep(.el-descriptions__label) {
  background: #fcfcfc !important;
  font-weight: bold;
  color: #666;
  width: 100px;
}

.el-button {
  border-radius: 8px;
}

:deep(.el-button--primary:not(.is-link)) {
  color: #ffffff !important;
}

:deep(.el-dialog) {
  margin: 0 auto !important;
  top: 50%;
  transform: translateY(-50%);
}
</style>