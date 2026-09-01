<template>
  <div class="tabs-bar">
    <div class="tabs-scroll">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        class="tab-item"
        :class="{ 'is-active': tab.path === activeTab }"
        @click="$emit('switch-tab', tab.path)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          v-if="tab.closable"
          class="tab-close"
          @click.stop="$emit('close-tab', tab.path)"
        >
          <Close />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'

interface TabItem {
  path: string
  title: string
  closable: boolean
}

defineProps<{
  tabs: TabItem[]
  activeTab: string
}>()

defineEmits<{
  (e: 'switch-tab', path: string): void
  (e: 'close-tab', path: string): void
}>()
</script>

<style scoped lang="scss">
.tabs-bar {
  height: 40px;
  background: #fff;
  border-bottom: 1px solid #e8eaec;
  display: flex;
  align-items: center;
  padding: 0 8px;
  flex-shrink: 0;
  overflow-x: auto;
  white-space: nowrap;
}

.tabs-scroll {
  display: flex;
  align-items: center;
  gap: 2px;
}

.tab-item {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  color: #495060;
  cursor: pointer;
  border-radius: 6px 6px 0 0;
  border: 1px solid transparent;
  position: relative;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    color: #2d5ffb;
    background: #f5f7fa;
  }

  &.is-active {
    color: #2d5ffb;
    background: #edf2ff;
    font-weight: 600;
    border-color: #d0dcfc;
    border-bottom-color: #edf2ff;
  }
}

.tab-close {
  margin-left: 6px;
  font-size: 12px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}
</style>
