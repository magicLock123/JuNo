<template>
  <div class="w-full space-y-4 p-4 sm:p-6 bg-[#f5f7fa] min-h-screen pb-20">
    <div
      class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
      <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">
        <el-input v-model="searchQuery" placeholder="搜索打手名称..." class="!w-full md:!w-60" clearable>
          <template #prefix><el-icon>
              <Search />
            </el-icon></template>
        </el-input>
      </div>
      <el-button type="primary" class="!bg-brand !border-none w-full md:w-auto font-bold" @click="handleAdd">
        <el-icon class="mr-1">
          <Plus />
        </el-icon>招募打手
      </el-button>
    </div>

    <div class="hidden md:block w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <el-table v-loading="loading" :data="filteredPlayerList" border stripe class="w-full">
        <el-table-column prop="id" label="ID" width="90" align="center" />
        <el-table-column prop="name" label="名称" min-width="120" align="center">
          <template #default="{ row }">
            <span class="font-bold text-gray-800">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="gameZone" label="游戏分区" min-width="120" align="center" />
        <el-table-column label="等级类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelTag(row.level)" effect="dark" size="small">{{ getLevelName(row.level) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column label="订单总流水" min-width="120" align="center">
          <template #default="{ row }">
            <span class="font-mono text-gray-500 font-bold">￥{{ (row.grossRevenue || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="打手佣金" min-width="120" align="center">
          <template #default="{ row }">
            <span class="font-mono text-orange-600 font-bold">￥{{ (row.commission || 0).toFixed(2) }}</span>
          </template>
        </el-table-column>

        <el-table-column label="接单状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === '工作中' ? 'success' : 'info'" size="small" effect="plain">
              {{ row.status || '休息' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="160" align="center">
          <template #default="scope">
            <el-button size="small" type="primary" class="!text-white font-bold"
              @click="handleEdit(scope.row)">管理</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="md:hidden space-y-3" v-loading="loading">
      <div v-for="row in filteredPlayerList" :key="row.id"
        class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
        <div class="flex justify-between items-center border-b border-gray-50 pb-2">
          <div class="flex items-center gap-2">
            <span class="font-bold text-gray-800 text-lg">{{ row.name }}</span>
            <el-tag :type="getLevelTag(row.level)" size="small" effect="dark">{{ getLevelName(row.level) }}</el-tag>
          </div>
          <span class="text-xs text-gray-400 font-mono">ID: {{ row.id }}</span>
        </div>

        <div class="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
          <div><span class="text-gray-400">分区：</span>{{ row.gameZone }}</div>
          <div class="text-right">
            <span class="text-gray-400">流水：</span>
            <span class="font-mono text-gray-500 font-bold">￥{{ (row.grossRevenue || 0).toFixed(2) }}</span>
          </div>
          <div class="col-span-2 text-right">
            <span class="text-gray-400">佣金：</span>
            <span class="font-mono text-orange-600 font-bold text-base">￥{{ (row.commission || 0).toFixed(2) }}</span>
          </div>
        </div>

        <div class="flex justify-between items-center pt-2">
          <div>
            <el-tag :type="row.status === '工作中' ? 'success' : 'info'" size="small" effect="plain">{{ row.status || '休息'
            }}</el-tag>
          </div>
          <div class="flex gap-2">
            <el-button size="small" type="danger" plain @click="handleDelete(row.id)">删除</el-button>
            <el-button size="small" type="primary" class="!text-white font-bold" @click="handleEdit(row)">管理</el-button>
          </div>
        </div>
      </div>
      <div v-if="filteredPlayerList.length === 0"
        class="text-center text-gray-400 py-8 bg-white rounded-xl border border-gray-100">
        暂无匹配的打手数据
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="dialogType === 'add' ? '招募新打手' : '打手管理'" width="min(90vw, 450px)"
      class="!rounded-xl" destroy-on-close>
      <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" class="pr-2">
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="输入打手昵称" />
        </el-form-item>

        <el-form-item label="分区" prop="gameZone">
          <el-select v-model="formData.gameZone" class="w-full">
            <el-option label="三角洲行动" value="三角洲行动" />
            <el-option label="无畏契约" value="无畏契约" />
            <el-option label="英雄联盟" value="英雄联盟" />
            <el-option label="逃离塔科夫" value="逃离塔科夫" />
            <el-option label="暗区突围" value="暗区突围" />
          </el-select>
        </el-form-item>

        <el-form-item label="打手等级" prop="level">
          <el-select v-model="formData.level" class="w-full">
            <el-option label="荣光骑士" :value="3" />
            <el-option label="骑士" :value="2" />
            <el-option label="守卫" :value="1" />
            <el-option label="娱乐" :value="0" />
          </el-select>
        </el-form-item>

        <template v-if="dialogType === 'edit'">
          <el-divider content-position="left" class="!my-6">流水与状态数据</el-divider>
          <div class="flex justify-between items-center px-4 bg-gray-50 p-2 rounded-lg">
            <span class="text-sm text-gray-600">当前接单状态：</span>
            <el-tag :type="formData.status === '工作中' ? 'success' : 'info'" effect="plain">{{ formData.status || '休息'
            }}</el-tag>
          </div>
          <div class="flex justify-between items-center px-4 bg-gray-50 p-2 rounded-lg mt-3">
            <span class="text-sm text-gray-600">创造总流水：</span>
            <span class="font-mono text-gray-500 font-bold text-lg">￥{{ (formData.grossRevenue || 0).toFixed(2)
            }}</span>
          </div>
          <div class="flex justify-between items-center px-4 bg-gray-50 p-2 rounded-lg mt-3">
            <span class="text-sm text-gray-600">累计赚取佣金：</span>
            <span class="font-mono text-orange-600 font-bold text-lg">￥{{ (formData.commission || 0).toFixed(2)
            }}</span>
          </div>
        </template>
      </el-form>

      <template #footer>
        <div class="flex justify-end gap-2 mt-2">
          <el-button class="!rounded-lg" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="!text-white !rounded-lg font-bold" @click="handleSubmit">确定保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Search, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { playerApi } from '@/api/player'
import type { Player } from '@/types'

const loading = ref(false)
const searchQuery = ref('')
const playerList = ref<any[]>([])

const dialogVisible = ref(false)
const dialogType = ref<'add' | 'edit'>('add')
const formRef = ref<FormInstance>()

const formData = ref<any>({
  id: 0,
  name: '',
  gameZone: '三角洲行动',
  level: 1,
  status: '休息',
  grossRevenue: 0,
  commission: 0
})

const formRules = ref<FormRules>({
  name: [{ required: true, message: '打手昵称不能为空', trigger: 'blur' }],
  gameZone: [{ required: true, message: '必须选择分区', trigger: 'change' }],
  level: [{ required: true, message: '必须选择等级', trigger: 'change' }]
})

const filteredPlayerList = computed(() => {
  return playerList.value.filter(p => p.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
})

const fetchData = async () => {
  loading.value = true
  try {
    const res = await playerApi.getList()
    if (res.code === 200) {
      playerList.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('获取列表失败')
  } finally {
    loading.value = false
  }
}

const getLevelName = (level: number) => {
  const map: Record<number, string> = { 0: '娱乐', 1: '守卫', 2: '骑士', 3: '荣光骑士' }
  return map[level] ?? '守卫'
}

const getLevelTag = (level: number) => {
  const map: Record<number, string> = { 0: 'info', 1: 'info', 2: 'warning', 3: 'danger' }
  return map[level] || 'info'
}

const handleAdd = () => {
  dialogType.value = 'add'
  formData.value = { name: '', gameZone: '三角洲行动', level: 1, status: '休息', grossRevenue: 0, commission: 0 }
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

const handleEdit = (row: any) => {
  dialogType.value = 'edit'
  formData.value = { ...row }
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      const submitData = { ...formData.value }
      if (dialogType.value === 'add') delete submitData.id

      const apiMethod = dialogType.value === 'add' ? playerApi.createPlayer : playerApi.updatePlayer
      try {
        const res = await apiMethod(submitData)
        if (res.code === 200) {
          if (dialogType.value === 'add') {
            // 弹窗提示返回的初始账号和密码
            ElMessageBox.alert(res.msg || res.message, '招募成功', { type: 'success' })
          } else {
            ElMessage.success('修改成功')
          }
          dialogVisible.value = false
          fetchData()
        } else {
          ElMessage.error(res.message || '操作失败')
        }
      } catch (error) {
        ElMessage.error('请求异常')
      }
    }
  })
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要彻底删除该打手资料吗？此操作不可逆。', '删除警告', {
    confirmButtonText: '确定删除',
    cancelButtonText: '取消',
    type: 'error'
  }).then(async () => {
    try {
      const res = await (playerApi as any).deletePlayer(id) // 确保你的 API 里有这个方法
      if (res.code === 200) {
        ElMessage.success('删除成功')
        fetchData()
      } else {
        ElMessage.error(res.message || '删除失败')
      }
    } catch (error) {
      ElMessage.error('请求异常')
    }
  }).catch(() => { })
}

onMounted(() => fetchData())
</script>

<style scoped>
.font-mono {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:deep(.el-dialog) {
  margin: 0 auto !important;
  top: 50%;
  transform: translateY(-50%);
}

@media (max-width: 640px) {
  :deep(.el-dialog) {
    margin-top: 5vh !important;
    top: auto;
    transform: none;
  }
}
</style>