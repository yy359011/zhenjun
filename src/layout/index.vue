<template>
  <div class="layout-container">
    <Sidebar :collapsed="collapsed" :active-menu="activeMenu" />
    <div class="main-area" :class="{ 'sidebar-collapsed': collapsed }">
      <Header :collapsed="collapsed" @toggle-collapse="toggleCollapse" />
      <TabsBar :tabs="tabs" :active-tab="activeTab" @close-tab="closeTab" @switch-tab="switchTab" />
      <div class="content-area">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Header from './Header.vue'
import TabsBar from './TabsBar.vue'

interface TabItem {
  path: string
  title: string
  closable: boolean
}

const route = useRoute()
const router = useRouter()
const collapsed = ref(false)

const activeMenu = computed(() => route.path)

const tabs = ref<TabItem[]>([
  { path: '/home', title: '首页', closable: false },
  { path: '/blast-database', title: 'BLAST数据库管理', closable: false },
  { path: '/sequence-align', title: '序列比对', closable: true },
  { path: '/phylogenetic-tree', title: '构建系统发育树', closable: true }
])

const activeTab = computed(() => route.path)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const switchTab = (path: string) => {
  router.push(path)
}

const closeTab = (path: string) => {
  const index = tabs.value.findIndex(tab => tab.path === path)
  if (index > -1) {
    tabs.value.splice(index, 1)
    if (activeTab.value === path) {
      const nextTab = tabs.value[index] || tabs.value[index - 1]
      if (nextTab) {
        router.push(nextTab.path)
      }
    }
  }
}

watch(() => route.path, (newPath) => {
  const exists = tabs.value.some(tab => tab.path === newPath)
  if (!exists && route.meta.title) {
    tabs.value.push({
      path: newPath,
      title: route.meta.title as string,
      closable: true
    })
  }
}, { immediate: true })

onMounted(() => {
  if (route.path === '/') {
    router.push('/blast-database')
  }
})
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.main-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 200px;
  transition: margin-left 0.3s ease;
  overflow: hidden;

  &.sidebar-collapsed {
    margin-left: 64px;
  }
}

.content-area {
  flex: 1;
  background: #f5f7fa;
  overflow-y: auto;
  padding: 0;
}

@media screen and (max-width: 992px) {
  .main-area {
    margin-left: 64px;
  }
}
</style>
