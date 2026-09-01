<template>
  <div class="header">
    <div class="header-left">
      <div class="collapse-btn" @click="$emit('toggle-collapse')">
        <el-icon size="20"><Menu /></el-icon>
      </div>
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentPage && currentPage !== '首页'">{{ currentPage }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="header-right">
      <div class="header-icon" title="更多">
        <el-icon size="18"><MoreFilled /></el-icon>
      </div>
      <div class="header-icon" title="搜索">
        <el-icon size="18"><Search /></el-icon>
      </div>
      <div class="header-icon" title="通知">
        <el-icon size="18"><Bell /></el-icon>
      </div>
      <el-dropdown class="user-dropdown">
        <div class="user-info">
          <span class="department">真菌采集部门</span>
          <el-divider direction="vertical" />
          <el-avatar :size="28" class="user-avatar">
            <span>理员</span>
          </el-avatar>
          <span class="user-email">admin1@qq.com</span>
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Menu, MoreFilled, Search, Bell, ArrowDown } from '@element-plus/icons-vue'

defineProps<{
  collapsed: boolean
}>()

defineEmits<{
  (e: 'toggle-collapse'): void
}>()

const route = useRoute()
const currentPage = computed(() => route.meta.title as string || '')
</script>

<style scoped lang="scss">
.header {
  height: 50px;
  background: #2d5ffb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  color: #fff;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.breadcrumb {
  :deep(.el-breadcrumb__inner) {
    color: rgba(255, 255, 255, 0.85) !important;
    font-size: 14px;

    &.is-link {
      color: #fff !important;
      font-weight: 500;
    }
  }

  :deep(.el-breadcrumb__separator) {
    color: rgba(255, 255, 255, 0.6);
  }
}

.header-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.header-icon {
  color: #fff;
  cursor: pointer;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.user-dropdown {
  cursor: pointer;
  margin-left: 8px;
}

.user-info {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .department {
    white-space: nowrap;
  }

  .user-avatar {
    background: linear-gradient(135deg, #36cfc9, #13c2c2);
    font-size: 11px;
    margin: 0 8px;
  }

  .user-email {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

:deep(.el-divider--vertical) {
  border-color: rgba(255, 255, 255, 0.3);
  margin: 0 8px;
}

@media screen and (max-width: 768px) {
  .header-right .department {
    display: none;
  }

  .header-right .user-email {
    display: none;
  }
}
</style>
