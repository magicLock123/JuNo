<template>
  <div
    :class="[isMobile ? 'neon-container min-h-screen pb-20 overflow-hidden text-white' : 'p-4 sm:p-6 bg-[#f5f7fa] min-h-screen pb-20']">

    <transition name="honor">
      <div v-if="showHonorNotice && isMercenary" class="honor-banner">
        <button class="honor-close" @click="showHonorNotice = false">✕</button>
        <div class="honor-content">
          <span class="honor-main-text">
            欢迎你，{{ userInfo?.type || '荣光骑士' }} {{ userInfo?.name || '用户' }}，铸造属于你的荣誉吧
          </span>
        </div>
        <div class="honor-line"></div>
      </div>
    </transition>

    <canvas v-if="isMobile" ref="bgCanvas" class="absolute inset-0 z-0 pointer-events-none opacity-60"></canvas>

    <div class="max-w-4xl mx-auto relative z-10">
      <div
        :class="isMobile ? 'neon-header flex items-center justify-between mb-6 px-4 py-3 rounded-xl' : 'flex items-center justify-between mb-6 px-2'">
        <h2 class="text-xl font-bold flex items-center gap-2"
          :class="isMobile ? 'text-white neon-text-white' : 'text-gray-800'">
          <el-icon :class="isMobile ? '' : 'text-brand'">
            <User />
          </el-icon>
          个人中心
        </h2>

        <div v-if="userInfo" class="flex items-center gap-3">
          <el-button v-if="isMercenary" :type="canTakeOrder === 1 ? 'success' : 'info'" :plain="canTakeOrder !== 1"
            size="small" class="font-bold shadow-sm transition-all" @click="handleToggleStatus" :loading="toggling">
            <div class="flex items-center gap-1.5">
              <span
                :class="canTakeOrder === 1 ? 'w-2 h-2 rounded-full bg-white animate-pulse' : 'w-2 h-2 rounded-full bg-gray-400'"></span>
              {{ canTakeOrder === 1 ? '工作中' : '休息中' }}
            </div>
          </el-button>

          <div class="text-right hidden sm:block">
            <div class="font-bold text-gray-800 text-sm">{{ userInfo.name }}</div>
            <div class="text-xs text-gray-500 font-mono mt-0.5">ID: {{ userInfo.id }} | {{ userInfo.type }}</div>
          </div>
          <el-avatar :size="isMobile ? 36 : 40"
            :class="isMobile ? 'neon-avatar bg-black text-white' : 'bg-brand text-white shadow-sm'">
            {{ (userInfo.name || 'U').charAt(0) }}
          </el-avatar>
          <el-button type="danger" :plain="!isMobile" circle size="small" class="ml-2" @click="handleLogout">
            <el-icon>
              <SwitchButton />
            </el-icon>
          </el-button>
        </div>
      </div>

      <template v-if="isMercenary">
        <div
          :class="isMobile ? 'neon-tabs p-1.5 rounded-xl flex space-x-1 mb-6' : 'bg-gray-200/70 p-1 rounded-xl flex space-x-1 mb-6 shadow-inner'">
          <button
            v-for="tab in [{ label: '数据统计', v: 'data', i: 'DataLine' }, { label: '专属搭档', v: 'partner', i: 'Connection' }]"
            :key="tab.v" class="flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300"
            :class="[activeTab === tab.v ? (isMobile ? 'neon-tab-active' : 'bg-white text-brand shadow-sm') : (isMobile ? 'text-gray-400' : 'text-gray-500 hover:text-gray-700')]"
            @click="activeTab = tab.v">
            <div class="flex items-center justify-center gap-1.5">
              <el-icon>
                <component :is="tab.i" />
              </el-icon> {{ tab.label }}
            </div>
          </button>
        </div>

        <transition name="fade" mode="out-in">
          <div v-if="activeTab === 'data'" key="data" class="space-y-6">

            <div :class="isMobile ? 'neon-card p-5' : 'bg-white p-6 rounded-xl border border-gray-100 shadow-sm'">
              <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div
                  :class="isMobile ? 'neon-data-box p-3 rounded-lg flex flex-col items-center' : 'bg-gray-50/50 p-4 rounded-lg border border-gray-100 flex flex-col items-center'">
                  <span class="text-xs text-gray-400 mb-1">今日流水</span>
                  <span class="text-xl font-black font-mono"
                    :class="isMobile ? 'text-white neon-text-white' : 'text-gray-700'">￥{{ stats.dailyAmount.toFixed(2)
                    }}</span>
                </div>
                <div
                  :class="isMobile ? 'neon-data-box p-3 rounded-lg flex flex-col items-center' : 'bg-gray-50/50 p-4 rounded-lg border border-gray-100 flex flex-col items-center'">
                  <span class="text-xs text-gray-400 mb-1">本周流水</span>
                  <span class="text-xl font-black font-mono" :class="isMobile ? 'text-white' : 'text-gray-700'">￥{{
                    stats.weeklyAmount.toFixed(2) }}</span>
                </div>
                <div
                  :class="isMobile ? 'neon-data-box p-3 rounded-lg flex flex-col items-center' : 'bg-gray-50/50 p-4 rounded-lg border border-gray-100 flex flex-col items-center'">
                  <span class="text-xs text-gray-400 mb-1">本月流水</span>
                  <span class="text-xl font-black font-mono" :class="isMobile ? 'text-white' : 'text-gray-700'">￥{{
                    stats.monthlyAmount.toFixed(2) }}</span>
                </div>
                <div
                  :class="isMobile ? 'neon-data-box p-3 rounded-lg flex flex-col items-center' : 'bg-gray-50/50 p-4 rounded-lg border border-gray-100 flex flex-col items-center'">
                  <span class="text-xs text-gray-400 mb-1">本年流水</span>
                  <span class="text-xl font-black font-mono" :class="isMobile ? 'text-white' : 'text-gray-700'">￥{{
                    stats.yearlyAmount.toFixed(2) }}</span>
                </div>
                <div class="col-span-2 md:col-span-1"
                  :class="isMobile ? 'neon-data-box p-3 rounded-lg flex flex-col items-center border-gold' : 'bg-orange-50/50 p-4 rounded-lg border border-orange-100 flex flex-col items-center'">
                  <span class="text-xs text-gray-400 mb-1">总计创收</span>
                  <span class="text-2xl font-black font-mono"
                    :class="isMobile ? 'text-gold-light neon-text-gold' : 'text-orange-500'">￥{{
                      stats.totalAmount.toFixed(2) }}</span>
                </div>
              </div>

              <div
                class="mt-4 pt-4 border-t border-gray-100/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                  end-placeholder="结束日期" value-format="YYYY-MM-DD" size="small"
                  :class="isMobile ? 'w-full !bg-black/50 !border-gray-700' : 'w-full sm:w-auto'"
                  @change="fetchCustomFlow" />
                <div class="text-sm">
                  <span class="text-gray-400">区间结算：</span>
                  <span class="text-lg font-black font-mono" :class="isMobile ? 'text-brand-light' : 'text-brand'">￥{{
                    stats.customRangeAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <div v-loading="loading">
              <div v-for="order in orderList" :key="order.orderSn" class="mb-3">

                <div v-if="isMobile" class="neon-order-item p-4 rounded-xl border border-white/20 bg-black/40">
                  <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-white font-bold text-base">{{ order.orderSn }}</span>
                      <el-tag v-if="order.isDouble === '1'" type="warning" size="small" effect="dark"
                        class="scale-90 origin-left">双人</el-tag>
                    </div>
                    <span class="px-2 py-0.5 text-[10px] font-bold rounded border"
                      :class="getStatusClass(order.status)">
                      {{ formatStatus(order.status) }}
                    </span>
                  </div>
                  <div class="grid grid-cols-2 text-xs text-gray-400 gap-y-1 mb-3">
                    <div>游戏：{{ order.gameName }}</div>
                    <div class="text-right">时间：{{ order.createdAt?.split(' ')[0] || '---' }}</div>
                    <div>类型：{{ getLevelName(order.orderType) }}</div>
                    <div class="text-right text-gold-light font-bold neon-text-gold">￥{{ (order.playerAmount ||
                      0).toFixed(2) }}</div>
                  </div>
                  <div class="flex gap-2">
                    <button class="neon-btn-action flex-1 py-1" @click="handleView(order)">详情</button>
                    <button v-if="['waiting', 'pending_double', 'ongoing', 'ongoing_up'].includes(order.status)"
                      class="neon-btn-action flex-1 py-1 text-red-400 border-red-500/50"
                      @click="handleCancelOrder(order)">
                      取消接单
                    </button>
                    <button v-if="order.status === 'ongoing_up'" class="neon-btn-primary flex-1 py-1"
                      @click="handleFinishOrder(order)">
                      结单审核
                    </button>
                    <button v-if="order.status === 'ongoing'"
                      class="neon-btn-action flex-1 py-1 text-green-400 border-green-500" @click="handleMarkUp(order)">
                      我已上号
                    </button>
                    <button v-if="order.status === 'waiting'"
                      class="neon-btn-action flex-1 py-1 text-cyan-400 border-cyan-500" @click="openDoubleMode(order)">
                      选择模式
                    </button>
                  </div>
                </div>

                <div v-else
                  class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold">
                      {{ (order.gameName || '游').charAt(0) }}
                    </div>
                    <div>
                      <div class="font-bold text-gray-800 flex items-center gap-2">
                        {{ order.orderSn }}
                        <el-tag v-if="order.isDouble === '1'" type="warning" size="small" effect="plain"
                          class="!border-none !bg-orange-50 !text-orange-500 font-bold scale-90 origin-left">双排</el-tag>
                      </div>
                      <div class="text-xs text-gray-400 mt-1">{{ order.createdAt }} | {{ order.gameName }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-8">
                    <div class="text-right font-mono font-bold text-orange-600">￥{{ (order.playerAmount || 0).toFixed(2)
                    }}</div>
                    <el-tag :type="getPCStatusTag(order.status)" size="small" effect="dark">{{
                      formatStatus(order.status)
                    }}</el-tag>
                    <el-button-group>
                      <el-button size="small" @click="handleView(order)">详情</el-button>
                      <el-button v-if="order.status === 'ongoing'" size="small" type="success" plain
                        @click="handleMarkUp(order)">
                        我已上号
                      </el-button>
                      <el-button v-if="order.status === 'waiting'" size="small" type="warning" plain
                        @click="openDoubleMode(order)">
                        选择模式
                      </el-button>
                      <el-button v-if="order.status === 'ongoing_up'" size="small" type="primary"
                        class="!text-white font-bold" @click="handleFinishOrder(order)">
                        结单审核
                      </el-button>
                      <el-button v-if="['waiting', 'pending_double', 'ongoing', 'ongoing_up'].includes(order.status)"
                        size="small" type="danger" plain @click="handleCancelOrder(order)">
                        取消接单
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </div>

              <div v-if="orderList.length === 0" class="text-center py-10 text-gray-400 text-sm">
                <el-empty :image-size="isMobile ? 80 : 120" description="暂无进行中的订单" />
              </div>
            </div>
          </div>

          <div v-else key="partner" class="space-y-4">
            <div :class="isMobile ? 'neon-card p-6' : 'bg-white p-8 rounded-xl border border-gray-100'">
              <div class="py-12 text-center">
                <el-icon class="text-6xl text-gray-200 mb-4">
                  <Connection />
                </el-icon>
                <h3 class="text-lg font-bold text-gray-600 mb-8">
                  {{ userStore.userInfo?.partnerId ? `已连接搭档 ID: ${userStore.userInfo?.partnerId}` : '尚未建立神经元搭档连接' }}
                </h3>
                <div class="text-xs text-gray-400">目前暂不支持打手自助解绑，请联系管理客服。</div>
              </div>
            </div>
          </div>
        </transition>
      </template>

      <template v-else>
        <div class="flex flex-col items-center justify-center py-24 text-gray-400"
          :class="isMobile ? 'opacity-80' : ''">
          <el-icon class="text-6xl mb-4 text-gray-300">
            <User />
          </el-icon>
          <div class="text-lg font-bold">{{ userInfo?.type }} 工作台就绪</div>
          <div class="text-sm mt-2 opacity-60">请通过左侧导航栏前往管理大厅处理业务</div>
        </div>
      </template>
    </div>

    <el-dialog v-model="detailVisible" title="订单详情" :width="isMobile ? '90%' : '500px'"
      :class="isMobile ? 'neon-dialog' : ''" align-center destroy-on-close>
      <div v-if="currentOrder">
        <div v-if="isMobile" class="detail-status-bar" :class="getStatusClass(currentOrder.status)">
          <span class="label">STATUS</span><span class="value">{{ formatStatus(currentOrder.status) }}</span>
        </div>
        <div :class="isMobile ? 'detail-content' : 'space-y-4 p-2'">
          <div :class="isMobile ? 'detail-row' : 'flex justify-between border-b pb-2 text-sm'">
            <span :class="isMobile ? 'd-label' : 'text-gray-500'">订单编号</span>
            <div class="flex items-center gap-2">
              <span :class="isMobile ? 'd-value text-white font-mono' : 'font-bold text-brand font-mono'">{{
                currentOrder.orderSn }}</span>
              <el-tag v-if="currentOrder.isDouble === '1'" type="warning" size="small" effect="dark"
                class="scale-90 origin-right">双排</el-tag>
            </div>
          </div>
          <div :class="isMobile ? 'detail-row' : 'flex justify-between border-b pb-2 text-sm'">
            <span :class="isMobile ? 'd-label' : 'text-gray-500'">游戏名称</span>
            <span :class="isMobile ? 'd-value text-white' : 'font-bold text-gray-800'">{{ currentOrder.gameName
              }}</span>
          </div>
          <div :class="isMobile ? 'detail-row' : 'flex justify-between border-b pb-2 text-sm'">
            <span :class="isMobile ? 'd-label' : 'text-gray-500'">当前状态</span>
            <span :class="isMobile ? 'd-value text-white' : 'font-bold text-gray-800'">{{
              formatStatus(currentOrder.status) }}</span>
          </div>
          <div :class="isMobile ? 'detail-price-row' : 'flex justify-between pt-2'">
            <span :class="isMobile ? 'd-label' : 'text-gray-500'">我的工资</span>
            <span :class="isMobile ? 'd-price' : 'text-orange-600 font-bold text-2xl font-mono'">￥{{
              (currentOrder.playerAmount || 0).toFixed(2) }}</span>
          </div>
          <div class="text-gray-500 text-xs mt-4 p-2 bg-gray-50/10 rounded border border-gray-100/10 italic">
            备注：{{ currentOrder.positionNote || '无' }}
          </div>
        </div>
      </div>
      <template #footer v-if="!isMobile">
        <el-button @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="doubleModeDialogVisible" title="选择双人接单模式" width="min(95vw, 450px)" class="!rounded-xl"
      destroy-on-close>
      <div v-if="currentGrabOrder" class="space-y-4 sm:space-y-6">
        <div class="text-sm text-gray-600 bg-brand/5 p-3 rounded-lg border border-brand/20 text-center">
          当前单号：<span class="font-mono font-bold text-brand">{{ currentGrabOrder.orderSn }}</span>
        </div>
        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <div
            class="flex-1 border border-gray-200 p-4 rounded-xl bg-gray-50 hover:border-brand hover:bg-brand/5 cursor-pointer text-center transition-all"
            @click="submitDoubleGrab('random')">
            <div class="text-xl font-bold text-gray-800 mb-1">🎲 随机匹配</div>
            <div class="text-xs text-gray-500">订单挂回大厅<br>任何人均可补位</div>
          </div>
          <div
            class="flex-1 border border-gray-200 p-4 rounded-xl bg-gray-50 hover:border-brand hover:bg-brand/5 cursor-pointer text-center transition-all"
            @click="submitDoubleGrab('partner')">
            <div class="text-xl font-bold text-gray-800 mb-1">🤝 搭档合作</div>
            <div class="text-xs text-gray-500">系统直接指派<br>进入打单状态</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <el-dialog v-model="cancelDialogVisible" title="取消接单申请" :width="isMobile ? '90%' : '450px'"
      :class="isMobile ? 'neon-dialog' : ''" destroy-on-close>
      <div class="space-y-4">
        <el-alert title="请注意：取消接单将被系统记录，频繁无故取消可能会扣除您的信誉分或被限制接单权限！" type="warning" :closable="false" show-icon />

        <div>
          <div class="text-sm mb-2" :class="isMobile ? 'text-gray-300' : 'text-gray-600'">取消原因（必填）</div>
          <el-input v-model="cancelForm.reason" type="textarea" placeholder="请输入具体原因，例如：停电/网络故障/打手生病等..." :rows="3" />
        </div>

        <div v-if="currentCancelOrder?.isDouble === '1'" class="pt-2">
          <el-checkbox v-model="cancelForm.withPartner" border>
            <span :class="isMobile ? 'text-gray-300' : ''">携队友共同退出（仅限已绑定的固定搭档）</span>
          </el-checkbox>
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-3">
          <el-button @click="cancelDialogVisible = false">暂不取消</el-button>
          <el-button type="danger" :loading="canceling" @click="submitCancelOrder">确认取消接单</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { DataLine, User, Connection, SwitchButton } from "@element-plus/icons-vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { profileApi } from "@/api/profile";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user";
import request from '@/request'

const loading = ref(false);
const activeTab = ref("data");
const windowWidth = ref(window.innerWidth);
const isMobile = computed(() => windowWidth.value < 768);

const userInfo = ref<any>(null);
const orderList = ref<any[]>([]);
const router = useRouter();
const userStore = useUserStore();

// 判断是否为打手角色
const isMercenary = computed(() => userStore.role === 'Mercenary');

const showHonorNotice = ref(false);
const canTakeOrder = ref(0);
const toggling = ref(false);

const dateRange = ref<[string, string] | null>(null);
const stats = ref({
  dailyAmount: 0,
  weeklyAmount: 0,
  monthlyAmount: 0,
  yearlyAmount: 0,
  totalAmount: 0,
  customRangeAmount: 0
});

const fetchData = async () => {
  loading.value = true;
  try {
    let userTypeDisplay = '管理';
    if (userStore.role === 'Mercenary') {
      userTypeDisplay = getLevelName(userStore.userInfo?.level);
    } else if (userStore.role === 'Admin') {
      userTypeDisplay = '超级管理员';
    } else if (userStore.role === 'Dispatcher') {
      userTypeDisplay = '派单客服';
    }

    userInfo.value = {
      name: userStore.username,
      type: userTypeDisplay,
      id: userStore.userInfo?.id || '---'
    };

    if (isMercenary.value) {
      const [infoRes, ordersRes]: any[] = await Promise.all([
        profileApi.getMyInfo().catch(() => null),
        request.get('/player/order/my-ongoing').catch(() => null),
      ]);

      if (infoRes?.code === 200 && infoRes.data) {
        stats.value.dailyAmount = infoRes.data.dailyAmount || 0;
        stats.value.weeklyAmount = infoRes.data.weeklyAmount || 0;
        stats.value.monthlyAmount = infoRes.data.monthlyAmount || 0;
        stats.value.yearlyAmount = infoRes.data.yearlyAmount || 0;
        stats.value.totalAmount = infoRes.data.totalAmount || 0;
        stats.value.customRangeAmount = infoRes.data.customRangeAmount || 0;
        canTakeOrder.value = infoRes.data.canTakeOrder ?? userStore.userInfo?.canTakeOrder ?? 0;
      }

      if (ordersRes?.code === 200) {
        orderList.value = ordersRes.data || [];
      }
    }
  } finally {
    loading.value = false;
  }
};

const doubleModeDialogVisible = ref(false)
const currentGrabOrder = ref<any>(null)

const openDoubleMode = (order: any) => {
  currentGrabOrder.value = order
  doubleModeDialogVisible.value = true
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
    const res: any = await request.post('/player/order/confirm-double', {
      orderSn: currentGrabOrder.value.orderSn,
      actionType: actionType,
      partnerId: actionType === 'ASSIGN_PARTNER' ? partnerId : null
    })

    if (res.code === 200) {
      ElMessage.success(doubleType === 'partner' ? '已指派搭档，进入打单中' : '已放回大厅等待他人补位')
      doubleModeDialogVisible.value = false
      fetchData() // 刷新个人中心列表
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (error) {
    ElMessage.error('确认请求异常')
  }
}

// 🌟 取消订单逻辑
const cancelDialogVisible = ref(false)
const canceling = ref(false)
const currentCancelOrder = ref<any>(null)
const cancelForm = ref({ reason: '', withPartner: false })

const handleCancelOrder = (order: any) => {
  currentCancelOrder.value = order
  cancelForm.value = { reason: '', withPartner: false }
  cancelDialogVisible.value = true
}

const submitCancelOrder = async () => {
  if (!cancelForm.value.reason.trim()) {
    ElMessage.warning('请输入具体的取消原因')
    return
  }
  canceling.value = true
  try {
    const res: any = await request.post('/player/order/cancel', {
      orderSn: currentCancelOrder.value.orderSn,
      transferReason: cancelForm.value.reason,
      cancelWithPartner: cancelForm.value.withPartner
    })

    if (res.code === 200) {
      ElMessage.success('订单已成功取消，并退回大厅')
      cancelDialogVisible.value = false
      fetchData()
    } else {
      ElMessage.error(res.msg || '取消订单失败')
    }
  } catch (error) {
    ElMessage.error('网络请求异常')
  } finally {
    canceling.value = false
  }
}

const fetchCustomFlow = async (val: [string, string] | null) => {
  try {
    const params = val ? { startDate: val[0], endDate: val[1] } : undefined;
    const res: any = await profileApi.getMyInfo(params);
    if (res?.code === 200 && res.data) {
      stats.value.customRangeAmount = res.data.customRangeAmount || 0;
      stats.value.dailyAmount = res.data.dailyAmount || 0;
      stats.value.weeklyAmount = res.data.weeklyAmount || 0;
      stats.value.monthlyAmount = res.data.monthlyAmount || 0;
      stats.value.totalAmount = res.data.totalAmount || 0;
    }
  } catch (e) {
    ElMessage.error("获取区间流水失败");
  }
}

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' };
  return map[level] ?? '守卫';
}

const formatStatus = (s: string) => {
  const map: any = {
    'waiting': '待选模式',
    'pending_double': '待补位',
    'ongoing': '待上号',
    'ongoing_up': '打单中',
    'pending_review': '审核中',
    'deposit': '押金期',
    'pending_distribution': '待发工资',
    'completed': '已结单',
    'after_sales': '售后中'
  };
  return map[s] || s;
};

const getStatusClass = (s: string) => {
  const map: any = {
    'waiting': 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10',
    'pending_double': 'text-pink-400 border-pink-500/50 bg-pink-500/10',
    'completed': 'text-green-400 border-green-500/50 bg-green-500/10',
    'ongoing': 'text-orange-400 border-orange-500/50 bg-orange-500/10',
    'ongoing_up': 'text-white border-white/50 bg-white/10',
    'pending_review': 'text-blue-400 border-blue-500/50 bg-blue-500/10',
    'deposit': 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    'pending_distribution': 'text-yellow-400 border-yellow-500/50 bg-yellow-500/10',
    'after_sales': 'text-red-400 border-red-500/50 bg-red-500/10'
  };
  return map[s] || 'text-gray-400 border-gray-600';
};

const getPCStatusTag = (s: string) => {
  const map: any = {
    'waiting': 'primary',
    'pending_double': 'warning',
    'completed': 'success',
    'ongoing': 'warning',
    'ongoing_up': 'primary',
    'pending_review': 'warning',
    'deposit': 'info',
    'pending_distribution': 'warning',
    'after_sales': 'danger'
  };
  return map[s] || 'info';
};

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', { type: 'warning' }).then(() => {
    userStore.logout();
    router.replace("/login");
  }).catch(() => { });
};

const handleMarkUp = (order: any) => {
  ElMessageBox.confirm(
    `请确认您已就位并准备开始代打服务？（订单：${order.orderSn}）`,
    '上号确认',
    {
      confirmButtonText: '我已上号',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      const res: any = await request.post('/player/order/up', { orderSn: order.orderSn })
      if (res.code === 200) {
        ElMessage.success("上号标记成功！请注意记录时间");
        fetchData();
      } else {
        ElMessage.error(res.msg || "操作失败")
      }
    } catch (e) {
      ElMessage.error("请求失败，请稍后重试")
    }
  }).catch(() => { });
};

const handleFinishOrder = (order: any) => {
  ElMessageBox.confirm(`确定要提交订单 [${order.orderSn}] 的结单申请吗？`, '结单确认', {
    confirmButtonText: '提交审核',
    cancelButtonText: '取消',
    type: 'success'
  }).then(async () => {
    try {
      const res: any = await request.post('/player/order/finish', { orderSn: order.orderSn })
      if (res.code === 200) {
        ElMessage.success("结单申请已发送，等待客服审核");
        fetchData()
      } else {
        ElMessage.error(res.msg || "提交失败")
      }
    } catch (e) {
      ElMessage.error("请求失败")
    }
  }).catch(() => { });
};

const detailVisible = ref(false);
const currentOrder = ref<any>(null);
const handleView = (i: any) => { currentOrder.value = i; detailVisible.value = true; };

const bgCanvas = ref<HTMLCanvasElement | null>(null);
let aniId: number;
const initAni = () => {
  const c = bgCanvas.value; if (!c) return;
  const ctx = c.getContext('2d'); if (!ctx) return;
  c.width = window.innerWidth; c.height = window.innerHeight;
  const ps = Array.from({ length: 30 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, vx: Math.random() - 0.3, vy: Math.random() - 0.3 }));
  const render = () => {
    if (!ctx || !isMobile.value) return;
    ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = '#ffffff';
    ps.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > c.width) p.vx *= -1; if (p.y < 0 || p.y > c.height) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill();
    });
    aniId = requestAnimationFrame(render);
  };
  render();
};

const handleToggleStatus = async () => {
  toggling.value = true;
  try {
    const res: any = await request.post('/player/order/toggle-status');
    if (res.code === 200) {
      canTakeOrder.value = res.data;
      ElMessage.success(canTakeOrder.value === 1 ? '已开启工作模式，请留意大厅派单！' : '已进入休息模式，停止接单');

      if (userStore.userInfo) {
        userStore.userInfo.canTakeOrder = canTakeOrder.value;
        localStorage.setItem('juno_userInfo', JSON.stringify(userStore.userInfo));
      }
    } else {
      ElMessage.error(res.msg || '切换状态失败');
    }
  } catch (e) {
    ElMessage.error("网络请求失败，请稍后重试");
  } finally {
    toggling.value = false;
  }
};

onMounted(() => {
  window.addEventListener("resize", () => windowWidth.value = window.innerWidth);
  fetchData();
  if (isMobile.value) setTimeout(initAni, 100);
});
onUnmounted(() => {
  window.removeEventListener("resize", () => windowWidth.value = window.innerWidth);
  cancelAnimationFrame(aniId);
});
</script>

<style scoped>
/* 保持原有样式不变 */
.honor-banner {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 90%;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid #ffffff;
  border-radius: 4px;
  padding: 20px 15px;
  text-align: center;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
}

.honor-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 14px;
  opacity: 0.6;
}

.honor-main-text {
  color: #ffffff;
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  line-height: 1.6;
}

.honor-line {
  height: 2px;
  width: 0;
  background: #ffffff;
  margin-top: 15px;
  animation: progress 5s linear forwards;
}

@keyframes progress {
  from {
    width: 0;
  }

  to {
    width: 100%;
  }
}

.honor-enter-active {
  animation: slideIn 0.4s ease-out;
}

.honor-leave-active {
  animation: slideIn 0.4s reverse ease-in;
}

@keyframes slideIn {
  from {
    transform: translate(-50%, -150%);
    opacity: 0;
  }

  to {
    transform: translate(-50%, 0);
    opacity: 1;
  }
}

.neon-container {
  background-color: #050508;
  position: relative;
}

.neon-text-white {
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
}

.text-gold-light {
  color: #f3e5ab;
}

.neon-text-gold {
  text-shadow: 0 0 12px rgba(243, 229, 171, 0.7);
}

.neon-header,
.neon-card {
  background: rgba(20, 20, 20, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.neon-tab-active {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border-bottom: 2px solid #ffffff;
}

.neon-avatar {
  border: 2px solid #ffffff;
}

.neon-btn-action {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ccc;
  border-radius: 4px;
}

.neon-btn-primary {
  border: 1px solid #ffffff;
  color: #ffffff;
  background: transparent;
  font-weight: bold;
  border-radius: 4px;
}

.neon-btn-primary:active {
  background: rgba(255, 255, 255, 0.2);
}

.neon-data-box {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.neon-dialog) {
  background: #0a0a0f !important;
  border: 1px solid #ffffff;
  color: white;
}

.detail-status-bar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid currentColor;
  margin-bottom: 15px;
  border-radius: 4px;
}

.detail-content {
  background: #111111;
  padding: 15px;
  border-radius: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 13px;
  border-bottom: 1px solid #222;
  padding-bottom: 8px;
}

.d-label {
  color: #888;
}

.d-price {
  color: #f3e5ab;
  font-size: 24px;
  font-weight: bold;
  text-shadow: 0 0 12px rgba(243, 229, 171, 0.5);
}

.text-brand {
  color: #409eff;
}

.bg-brand {
  background-color: #409eff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>