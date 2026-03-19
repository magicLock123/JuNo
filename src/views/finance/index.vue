<template>
    <div class="p-6 bg-[#f5f7fa] min-h-screen">
        <div class="mb-6 flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-800">公司财务总览 (纯利润)</h1>
            <el-tag type="success" effect="dark">实时数据</el-tag>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <el-card shadow="hover" class="!border-none !rounded-xl overflow-hidden">
                <div class="text-gray-500 text-sm font-bold mb-2">今日收入</div>
                <div class="text-3xl font-mono font-bold text-gray-800">￥{{ financeData.daily.toFixed(2) }}</div>
            </el-card>
            <el-card shadow="hover" class="!border-none !rounded-xl overflow-hidden">
                <div class="text-gray-500 text-sm font-bold mb-2">本周收入</div>
                <div class="text-3xl font-mono font-bold text-brand">￥{{ financeData.weekly.toFixed(2) }}</div>
            </el-card>
            <el-card shadow="hover" class="!border-none !rounded-xl overflow-hidden">
                <div class="text-gray-500 text-sm font-bold mb-2">本月收入</div>
                <div class="text-3xl font-mono font-bold text-blue-600">￥{{ financeData.monthly.toFixed(2) }}</div>
            </el-card>
            <el-card shadow="hover"
                class="!border-none !rounded-xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <div class="text-gray-300 text-sm font-bold mb-2">历史总收入</div>
                <div class="text-4xl font-mono font-bold text-white">￥{{ financeData.total.toFixed(2) }}</div>
            </el-card>
        </div>

        <el-card shadow="hover" class="!border-none !rounded-xl">
            <template #header>
                <div class="font-bold text-gray-800">自定义区间流水分账查询</div>
            </template>
            <div class="flex flex-col md:flex-row gap-4 items-center">
                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="fetchCustomRange" />
                <div class="text-lg font-bold text-gray-600">
                    该区间总计公司收入：<span class="text-2xl font-mono text-orange-500">￥{{ financeData.customRange.toFixed(2)
                        }}</span>
                </div>
            </div>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import request from '@/request'
import { ElMessage } from 'element-plus'

const dateRange = ref<[string, string] | null>(null)
const financeData = ref({
    daily: 0, weekly: 0, monthly: 0, yearly: 0, total: 0, customRange: 0
})

const fetchFinanceData = async (startDate?: string, endDate?: string) => {
    try {
        const params: any = {}
        if (startDate && endDate) {
            params.startDate = startDate
            params.endDate = endDate
        }
        const res: any = await request.get('/manager/finance/dashboard', { params })
        if (res.code === 200) {
            financeData.value = res.data
        } else {
            ElMessage.error(res.msg || '获取财务数据失败')
        }
    } catch (e) {
        ElMessage.error('网络请求异常')
    }
}

const fetchCustomRange = (val: [string, string] | null) => {
    if (val) fetchFinanceData(val[0], val[1])
    else fetchFinanceData()
}

onMounted(() => fetchFinanceData())
</script>