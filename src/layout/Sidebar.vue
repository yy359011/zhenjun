<template>
  <div class="sidebar" :class="{ 'is-collapsed': collapsed }">
    <div class="logo-area">
      <span class="logo-text" v-show="!collapsed">真菌和地衣标本数据库后台</span>
      <span class="logo-text-mini" v-show="collapsed">菌</span>
    </div>
    <el-scrollbar class="sidebar-scroll">
      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        class="sidebar-menu"
        background-color="#fff"
        text-color="#495060"
        active-text-color="#2d5ffb"
        router
      >
        <template v-for="item in menuList" :key="item.path">
          <el-sub-menu v-if="item.children" :index="item.path">
            <template #title>
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
              <span>{{ child.title }}</span>
            </el-menu-item>
          </el-sub-menu>
          <el-menu-item v-else :index="item.path">
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.title }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import {
  HomeFilled,
  Setting,
  Collection,
  Grape,
  EditPen,
  Coin,
  Connection,
  Share,
  UserFilled,
  Folder,
  MapLocation,
  Files,
  Notebook,
  DataAnalysis
} from '@element-plus/icons-vue'

interface MenuItem {
  path: string
  title: string
  icon: any
  children?: MenuItem[]
}

defineProps<{
  collapsed: boolean
  activeMenu: string
}>()

const menuList: MenuItem[] = [
  { path: '/home', title: '首页', icon: HomeFilled },
  {
    path: '/system',
    title: '系统管理',
    icon: Setting,
    children: []
  },
  {
    path: '/specimen',
    title: '标本管理',
    icon: Collection,
    children: []
  },
  {
    path: '/species',
    title: '物种管理',
    icon: Grape,
    children: []
  },
  { path: '/revision', title: '修订/校对记录管理', icon: EditPen },
  { path: '/blast-database', title: 'BLAST数据库管理', icon: Coin },
  { path: '/sequence-align', title: '序列比对', icon: Connection },
  { path: '/phylogenetic-tree', title: '构建系统发育树', icon: Share },
  { path: '/teamwork', title: '团队协作', icon: UserFilled },
  { path: '/project', title: '项目管理', icon: Folder },
  { path: '/route', title: '路线管理', icon: MapLocation },
  { path: '/morphology', title: '形态特征模板管理', icon: Files },
  { path: '/latin', title: '拉丁名分类管理', icon: Notebook },
  { path: '/statistics', title: '统计分析', icon: DataAnalysis }
]
</script>

<style scoped lang="scss">
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  background: #fff;
  border-right: 1px solid #e8eaec;
  z-index: 1001;
  transition: width 0.3s ease;
  overflow: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);

  &.is-collapsed {
    width: 64px;
  }
}

.logo-area {
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d5ffb;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  padding: 0 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-text-mini {
  font-size: 18px;
}

.sidebar-scroll {
  height: calc(100% - 50px);
}

.sidebar-menu {
  border-right: none;

  :deep(.el-menu-item) {
    height: 46px;
    line-height: 46px;
    font-size: 14px;

    &:hover {
      background-color: #f0f4ff !important;
    }

    &.is-active {
      background-color: #edf2ff !important;
      border-right: 3px solid #2d5ffb;
      font-weight: 500;
    }
  }

  :deep(.el-sub-menu__title) {
    height: 46px;
    line-height: 46px;
    font-size: 14px;

    &:hover {
      background-color: #f0f4ff !important;
    }
  }

  :deep(.el-menu-item.is-active) {
    color: #2d5ffb;
  }
}

@media screen and (max-width: 992px) {
  .sidebar {
    width: 64px;

    .logo-text {
      display: none;
    }

    .logo-text-mini {
      display: block;
    }
  }
}
</style>
