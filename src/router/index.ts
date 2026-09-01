import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layout/index.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/blast-database',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页' }
      },
      {
        path: 'blast-database',
        name: 'BlastDatabase',
        component: () => import('@/views/BlastDatabase.vue'),
        meta: { title: 'BLAST数据库管理' }
      },
      {
        path: 'sequence-align',
        name: 'SequenceAlign',
        component: () => import('@/views/SequenceAlignment.vue'),
        meta: { title: '序列比对' }
      },
      {
        path: 'phylogenetic-tree',
        name: 'PhylogeneticTree',
        component: () => import('@/views/PhylogeneticTree.vue'),
        meta: { title: '构建系统发育树' }
      },
      {
        path: 'system',
        name: 'System',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '系统管理' }
      },
      {
        path: 'specimen',
        name: 'Specimen',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '标本管理' }
      },
      {
        path: 'species',
        name: 'Species',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '物种管理' }
      },
      {
        path: 'revision',
        name: 'Revision',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '修订/校对记录管理' }
      },
      {
        path: 'teamwork',
        name: 'Teamwork',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '团队协作' }
      },
      {
        path: 'project',
        name: 'Project',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '项目管理' }
      },
      {
        path: 'route',
        name: 'Route',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '路线管理' }
      },
      {
        path: 'morphology',
        name: 'Morphology',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '形态特征模板管理' }
      },
      {
        path: 'latin',
        name: 'Latin',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '拉丁名分类管理' }
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('@/views/Placeholder.vue'),
        meta: { title: '统计分析' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
