<script setup lang="ts">
import { Calendar } from '@element-plus/icons-vue'

export interface OrderProps {
  id: number | string // 需要 ID 来发送请求
  orderNo: string
  createTime: string
  finishTime: string
  gameZone: string
  orderType: string
  amount: number
  remark?: string
  status?: string // 新增：需要知道订单具体状态
}

defineProps<{
  item: OrderProps
}>()

const emit = defineEmits(['view', 'remark', 'finish']) // 新增 finish 事件
</script>

<template>
  <div class="w-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 mb-4 overflow-hidden group">
    
    <div class="hidden sm:flex items-center justify-between p-5 h-28">
      <div class="flex flex-col w-52 shrink-0">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">
            {{ item.orderNo }}
          </span>
        </div>
        <div class="text-lg font-black text-gray-800 truncate mb-2">{{ item.gameZone }}</div>
        <div class="flex gap-2">
          <el-tag size="small" class="!px-3 !border-none !rounded-full font-bold" effect="light" type="info">
            {{ item.orderType }}
          </el-tag>
          <el-tag v-if="item.status === '已完成'" size="small" type="success" effect="plain" class="!rounded-full font-bold">已结单</el-tag>
          <el-tag v-else-if="item.status === '待审核'" size="small" type="warning" effect="dark" class="!rounded-full font-bold">审核中</el-tag>
          <el-tag v-else-if="item.status === '售后中'" size="small" type="danger" effect="plain" class="!rounded-full font-bold">售后保护</el-tag>
          <el-tag v-else size="small" type="primary" effect="plain" class="!rounded-full font-bold">打单中</el-tag>
        </div>
      </div>

      <div class="flex-1 px-10 border-l border-gray-50 flex flex-col justify-center gap-2">
        <div class="text-xs flex items-center gap-2 group/time">
          <el-icon class="text-gray-300 group-hover/time:text-brand transition-colors"><Calendar /></el-icon>
          <span class="text-gray-400 shrink-0 w-16">发起时间</span>
          <span class="font-mono text-gray-600 font-medium">{{ item.createTime }}</span>
        </div>
        <div class="text-xs flex items-center gap-2 group/time">
          <el-icon class="text-gray-300 group-hover/time:text-brand transition-colors"><Calendar /></el-icon>
          <span class="text-gray-400 shrink-0 w-16">结单时间</span>
          <span :class="item.finishTime ? 'text-gray-600 font-medium' : 'text-orange-400 italic'" class="font-mono">
            {{ item.finishTime || '打单中 / 审核中' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-8 shrink-0 pl-10 border-l border-gray-50">
        <div class="text-right min-w-[120px]">
          <div class="text-[10px] text-gray-400 uppercase font-bold mb-1">预计佣金 (7天后结算)</div>
          <div class="flex items-baseline justify-end text-orange-500">
            <span class="text-sm font-bold mr-1">¥</span>
            <span class="text-3xl font-black font-mono tracking-tighter">{{ item.amount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="flex flex-col gap-2 w-28">
          <el-button 
            v-if="item.status === '打单中'"
            type="success" 
            class="!h-9 !m-0 !w-full font-bold shadow-sm active:scale-95 transition-all" 
            @click="emit('finish', item)"
          >
            申请结单
          </el-button>
          
          <el-button 
            v-else
            type="primary" 
            class="!bg-brand !border-none !h-9 !m-0 !w-full font-bold shadow-sm hover:shadow-md transition-all active:scale-95" 
            @click="emit('view', item)"
          >
            详情
          </el-button>
          
          <el-badge :is-dot="!!item.remark" class="w-full">
            <el-button 
              plain
              :type="item.remark ? 'warning' : ''"
              class="!h-9 !m-0 !w-full font-bold active:scale-95 transition-all" 
              @click="emit('remark', item)"
            >
              备注
            </el-button>
          </el-badge>
        </div>
      </div>
    </div>

    <div class="block sm:hidden p-4">
      <div class="flex justify-between items-start mb-3 border-b border-gray-50 pb-3">
        <div class="flex flex-col gap-1.5">
          <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter w-fit">
            {{ item.orderNo }}
          </span>
          <div class="text-base font-black text-gray-800 leading-tight">{{ item.gameZone }}</div>
        </div>
        <div class="flex flex-col items-end gap-1.5">
          <el-tag v-if="item.status === '已完成'" size="small" type="success" effect="plain" class="!rounded-full font-bold">已结单</el-tag>
          <el-tag v-else-if="item.status === '待审核'" size="small" type="warning" effect="dark" class="!rounded-full font-bold">审核中</el-tag>
          <el-tag v-else-if="item.status === '售后中'" size="small" type="danger" effect="plain" class="!rounded-full font-bold">售后保护</el-tag>
          <el-tag v-else size="small" type="primary" effect="plain" class="!rounded-full font-bold">打单中</el-tag>
          <el-tag size="small" class="!border-none !rounded-full font-bold" effect="light" type="info">
            {{ item.orderType }}
          </el-tag>
        </div>
      </div>

      <div class="bg-gray-50 rounded-lg p-2.5 mb-3 flex flex-col gap-2">
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400 flex items-center gap-1"><el-icon><Calendar /></el-icon>发起</span>
          <span class="font-mono text-gray-600 font-medium">{{ item.createTime }}</span>
        </div>
        <div class="flex justify-between items-center text-xs">
          <span class="text-gray-400 flex items-center gap-1"><el-icon><Calendar /></el-icon>结单</span>
          <span :class="item.finishTime ? 'text-gray-600 font-medium' : 'text-orange-400 italic'" class="font-mono">
            {{ item.finishTime || '打单中 / 审核中' }}
          </span>
        </div>
      </div>

      <div class="flex justify-between items-end mt-1">
        <div class="flex flex-col">
          <span class="text-[10px] text-gray-400 font-bold mb-0.5">预计佣金</span>
          <div class="flex items-baseline text-orange-500">
            <span class="text-sm font-bold mr-0.5">¥</span>
            <span class="text-xl font-black font-mono tracking-tighter">{{ item.amount.toFixed(2) }}</span>
          </div>
        </div>
        
        <div class="flex items-center gap-2">
          <el-badge :is-dot="!!item.remark">
            <el-button 
              plain
              size="small"
              :type="item.remark ? 'warning' : ''"
              class="!m-0 font-bold active:scale-95 transition-all" 
              @click="emit('remark', item)"
            >
              备注
            </el-button>
          </el-badge>

          <el-button 
            v-if="item.status === '打单中'"
            type="success" 
            size="small"
            class="!m-0 font-bold shadow-sm active:scale-95 transition-all" 
            @click="emit('finish', item)"
          >
            申请结单
          </el-button>
          
          <el-button 
            v-else
            type="primary" 
            size="small"
            class="!bg-brand !border-none !m-0 font-bold shadow-sm active:scale-95 transition-all" 
            @click="emit('view', item)"
          >
            详情
          </el-button>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
:deep(.el-badge) { display: block; }
.active\:scale-95:active { transform: scale(0.95); }
</style>