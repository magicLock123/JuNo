<template>
  <div class="p-6 space-y-4 relative min-h-screen bg-[#f5f7fa] pb-20">
    
    <div class="flex justify-between items-center bg-white p-4 rounded shadow-sm border border-gray-100">
      <div class="flex items-center space-x-4">
        <slot name="header-left"></slot>
      </div>
      <div class="flex items-center space-x-4">
        <slot name="header-right"></slot>
      </div>
    </div>

    <div v-loading="loading" class="space-y-4">
      <div 
        v-for="(item, index) in data" 
        :key="item.id || index"
        class="bg-white rounded-lg shadow-sm border border-gray-200 flex items-stretch overflow-hidden custom-card"
      >
        <div class="flex-grow p-4">
          <slot name="content" :item="item"></slot>
        </div>

        <div class="w-[140px] flex-shrink-0 flex flex-col justify-center items-center p-4 border-l border-gray-100 bg-gray-50/30 gap-2">
           <slot name="actions" :item="item"></slot>
        </div>
      </div>

      <el-empty v-if="!loading && data.length === 0" description="暂无相关数据" />
    </div>

    <div v-if="total > 0" class="flex justify-end bg-white p-4 rounded shadow-sm border border-gray-100">
      <slot name="pagination"></slot>
    </div>
    
    <slot name="float-tools"></slot>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  data: any[]
  loading: boolean
  total: number
}>()
</script>

<style scoped>
.custom-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

/* 定制 el-descriptions 样式 */
:deep(.el-descriptions__body) {
  background-color: transparent;
}
:deep(.el-descriptions) {
  border: none !important;
}
:deep(.el-descriptions__table) {
  border-collapse: collapse;
}
:deep(.el-descriptions__cell) {
  border-bottom: 1px solid #ebeef5 !important;
  padding: 12px 16px !important;
  line-height: 1.5;
}
:deep(.el-descriptions__row:last-child .el-descriptions__cell) {
  border-bottom: none !important;
}
:deep(.el-descriptions__label) {
  background-color: #f8f9fa !important;
  color: #606266;
  font-weight: normal; 
  width: 120px;
  border-right: 1px solid #ebeef5 !important;
}
:deep(.el-descriptions__content) {
  color: #303133;
}
:deep(.el-descriptions__cell:nth-child(2)) {
    border-right: 1px solid #ebeef5 !important;
}
</style>