<template>
  <div class="blast-database-page">
    <!-- 建库操作区域 -->
    <div class="upload-section card">
      <div class="build-mode-bar">
        <span class="build-mode-title">建库方式</span>
        <el-radio-group v-model="activeTab" class="build-mode-radio">
          <el-radio value="upload">上传文件建库</el-radio>
          <el-radio value="select">选择数据建库</el-radio>
        </el-radio-group>
      </div>
      <!-- 上传文件建树面板 -->
      <div v-if="activeTab === 'upload'" class="upload-form">
            <div class="upload-main-row">
              <!-- 左侧：选择文件 -->
              <div class="upload-left">
                <div class="form-item file-select-item">
                  <label class="form-label">选择文件</label>
                  <div class="file-select-area">
                    <el-button type="primary" plain class="select-file-btn" @click="triggerFileSelect">
                      <el-icon><FolderOpened /></el-icon>
                      选择 FASTA 文件（可多选）
                    </el-button>
                    <input
                      ref="fileInputRef"
                      type="file"
                      multiple
                      accept=".fasta,.fas,.fa,.fna,.ffn,.faa,.frn"
                      style="display: none"
                      @change="handleFileChange"
                    />
                    <div v-if="selectedFiles.length > 0" class="selected-files">
                      <el-tag
                        v-for="(file, index) in selectedFiles"
                        :key="index"
                        closable
                        type="info"
                        class="file-tag"
                        @close="removeFile(index)"
                      >
                        {{ file.name }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </div>
              <!-- 右侧：分类目录 + 标题，右对齐 -->
              <div class="upload-right">
                <div class="form-item">
                  <label class="form-label required">分类目录</label>
                  <el-input
                    v-model="uploadForm.category"
                    placeholder="如: fungi"
                    class="form-input"
                  />
                </div>
                <div class="form-item">
                  <label class="form-label">标题</label>
                  <el-input
                    v-model="uploadForm.title"
                    placeholder="可选，自动生成"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
            <!-- 创建任务按钮行 -->
            <div class="upload-action-row">
              <el-button type="warning" class="upload-btn" @click="handleUpload" :loading="uploading">
                <el-icon><UploadFilled /></el-icon>
                创建任务
              </el-button>
            </div>
          </div>
      <!-- 选择数据建树面板 -->
      <div v-if="activeTab === 'select'" class="select-form">
            <div class="select-main-row">
              <div class="select-left">
                <div class="form-item">
                  <label class="form-label required">序列标记</label>
                  <el-select
                    v-model="selectForm.markers"
                    placeholder="请选择序列标记（可多选）"
                    class="form-select marker-select"
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                  >
                    <el-option
                      v-for="item in markerList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div class="form-item">
                  <label class="form-label required">选择数据</label>
                  <el-cascader
                    v-model="selectForm.specimenValues"
                    :options="specimenCascaderOptions"
                    :props="cascaderProps"
                    placeholder="请选择标本"
                    class="form-select cascader-select"
                    collapse-tags
                    collapse-tags-tooltip
                    clearable
                    filterable
                  />
                  <el-tag
                    v-if="specimenLeafIds.length > 0"
                    size="small"
                    type="primary"
                    effect="plain"
                    class="selected-count-tag"
                  >已选 {{ specimenLeafIds.length }} 项</el-tag>
                </div>
              </div>
              <!-- 右侧：分类目录 + 标题，右对齐 -->
              <div class="select-right">
                <div class="form-item">
                  <label class="form-label required">分类目录</label>
                  <el-input
                    v-model="selectForm.category"
                    placeholder="如: fungi"
                    class="form-input"
                  />
                </div>
                <div class="form-item">
                  <label class="form-label">标题</label>
                  <el-input
                    v-model="selectForm.title"
                    placeholder="可选，自动生成"
                    class="form-input"
                  />
                </div>
              </div>
            </div>
            <!-- 创建任务按钮行 -->
            <div class="select-action-row">
              <el-button type="warning" class="build-btn" @click="handleBuildFromData" :loading="building">
                <el-icon><Share /></el-icon>
                创建任务
              </el-button>
            </div>
          </div>
    </div>

    <!-- 数据库列表 -->
    <div class="database-list-section card">
      <div class="list-header">
        <div class="section-header">
          <el-icon class="section-icon"><Coin /></el-icon>
          <span class="section-title">数据库列表</span>
        </div>
        <div class="list-actions">
          <el-select v-model="statusFilter" placeholder="状态筛选" class="status-select" clearable>
            <el-option label="已构建" value="built" />
            <el-option label="构建中" value="building" />
            <el-option label="构建失败" value="failed" />
          </el-select>
          <el-button class="refresh-btn" @click="refreshList">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table
          :data="tableData"
          v-loading="loading"
          class="database-table"
          @selection-change="handleSelectionChange"
          stripe
        >
          <el-table-column type="selection" width="50" align="center" />
          <el-table-column prop="fileName" label="文件名" min-width="200" show-overflow-tooltip />
          <el-table-column prop="category" label="分类目录" width="120">
            <template #default="{ row }">
              <el-tag size="small" type="info" effect="plain">{{ row.category }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" min-width="120" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                effect="light"
                size="small"
                class="status-tag"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="sequenceCount" label="序列数" width="90" align="center" />
          <el-table-column label="公开" width="80" align="center">
            <template #default="{ row }">
              <el-switch v-model="row.isPublic" @change="togglePublic(row)" />
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建人" width="100" align="center" />
          <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
          <el-table-column label="操作" width="160" align="center" fixed="right">
            <template #default="{ row }">
              <el-button type="success" size="small" class="action-btn rebuild-btn" @click="rebuildDatabase(row)">
                <el-icon><Refresh /></el-icon>
                构建
              </el-button>
              <el-button type="danger" size="small" class="action-btn delete-btn" @click="deleteDatabase(row)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <span class="total-text">共 {{ total }} 条</span>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="sizes, prev, pager, next"
          class="pagination"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
        <span class="jump-text">前往</span>
        <el-input-number
          v-model="jumpPage"
          :min="1"
          :max="Math.ceil(total / pageSize)"
          size="small"
          class="jump-input"
          controls-position="right"
          @change="handleJumpPage"
        />
        <span class="jump-text">页</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  UploadFilled,
  FolderOpened,
  Coin,
  Refresh,
  Delete,
  Share
} from '@element-plus/icons-vue'

interface DatabaseItem {
  id: number
  fileName: string
  category: string
  title: string
  status: string
  sequenceCount: number
  isPublic: boolean
  creator: string
  createTime: string
}

interface SpecimenItem {
  id: number
  collectionNo: string
  speciesName: string
  type: 'fungi' | 'lichen' | 'strain' | 'amplicon'
}

interface CascaderOption {
  value: string | number
  label: string
  children?: CascaderOption[]
}

const cascaderProps = {
  multiple: true,
  checkStrictly: true,  // 父子节点独立，勾选父节点不会联动子节点
  emitPath: true,        // 值为完整路径数组
  checkOnClickNode: true
}

const fileInputRef = ref<HTMLInputElement | null>(null)
const selectedFiles = ref<File[]>([])
const uploading = ref(false)
const building = ref(false)
const loading = ref(false)
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const jumpPage = ref(1)
const selectedRows = ref<DatabaseItem[]>([])
const activeTab = ref('upload')

const uploadForm = reactive({
  category: '',
  title: ''
})

const selectForm = reactive({
  markers: [] as string[],
  specimenValues: [] as (string | number)[][], // 级联选择完整路径
  category: '',
  title: ''
})

// 提取选中的叶子节点采集编号 ID 列表
const specimenLeafIds = computed(() => {
  return selectForm.specimenValues.map(path => path[path.length - 1] as number)
})

interface MarkerItem {
  label: string
  value: string
}

const markerList = ref<MarkerItem[]>([
  { label: 'ITS序列', value: 'ITS' },
  { label: 'nrLSU序列', value: 'nrLSU' },
  { label: 'TEF1序列', value: 'TEF1' },
  { label: 'RPB1序列', value: 'RPB1' },
  { label: 'RPB2序列', value: 'RPB2' },
  { label: '其他', value: 'other' }
])

const specimenList = ref<SpecimenItem[]>([
  // 真菌标本
  { id: 1, collectionNo: 'HMAS-L 012345', speciesName: 'Amanita muscaria', type: 'fungi' },
  { id: 2, collectionNo: 'HMAS-L 012346', speciesName: 'Ganoderma lucidum', type: 'fungi' },
  { id: 3, collectionNo: 'HMAS-L 012347', speciesName: 'Cordyceps sinensis', type: 'fungi' },
  { id: 4, collectionNo: 'HMAS-L 012348', speciesName: 'Lentinula edodes', type: 'fungi' },
  { id: 5, collectionNo: 'HMAS-L 012349', speciesName: 'Pleurotus ostreatus', type: 'fungi' },
  { id: 6, collectionNo: 'HMAS-L 012350', speciesName: 'Trametes versicolor', type: 'fungi' },
  // 地衣标本
  { id: 7, collectionNo: 'HMAS-L 022351', speciesName: 'Usnea barbata', type: 'lichen' },
  { id: 8, collectionNo: 'HMAS-L 022352', speciesName: 'Parmelia sulcata', type: 'lichen' },
  { id: 9, collectionNo: 'HMAS-L 022353', speciesName: 'Cladonia rangiferina', type: 'lichen' },
  { id: 10, collectionNo: 'HMAS-L 022354', speciesName: 'Lobaria pulmonaria', type: 'lichen' },
  // 菌种数据
  { id: 11, collectionNo: 'CGMCC 3.1528', speciesName: 'Hericium erinaceus', type: 'strain' },
  { id: 12, collectionNo: 'CGMCC 5.866', speciesName: 'Morchella esculenta', type: 'strain' },
  { id: 13, collectionNo: 'CGMCC 12.287', speciesName: 'Boletus edulis', type: 'strain' },
  { id: 14, collectionNo: 'CGMCC 13.200', speciesName: 'Cantharellus cibarius', type: 'strain' },
  // 扩增子数据
  { id: 15, collectionNo: 'AMPL-2024-001', speciesName: '土壤真菌群落', type: 'amplicon' },
  { id: 16, collectionNo: 'AMPL-2024-002', speciesName: '叶面真菌群落', type: 'amplicon' },
  { id: 17, collectionNo: 'AMPL-2024-003', speciesName: '肠道真菌群落', type: 'amplicon' }
])

// 级联选择器 options
const specimenCascaderOptions = computed<CascaderOption[]>(() => {
  const typeMap: Record<SpecimenItem['type'], { label: string; children: CascaderOption[] }> = {
    fungi:   { label: '真菌标本', children: [] },
    lichen:  { label: '地衣标本', children: [] },
    strain:  { label: '菌种数据', children: [] },
    amplicon:{ label: '扩增子数据', children: [] }
  }
  specimenList.value.forEach(item => {
    typeMap[item.type].children.push({
      value: item.id,
      label: `${item.collectionNo}（${item.speciesName}）`
    })
  })
  return (Object.keys(typeMap) as SpecimenItem['type'][]).map(key => ({
    value: key,
    label: typeMap[key].label,
    children: typeMap[key].children
  }))
})

const tableData = ref<DatabaseItem[]>([
  {
    id: 1,
    fileName: 'Wu_2023_Mycosphere_LS...',
    category: 'fungi',
    title: 'test_LSU',
    status: 'built',
    sequenceCount: 106,
    isPublic: true,
    creator: 'admin1',
    createTime: '2026-08-14 10:29:48'
  },
  {
    id: 2,
    fileName: '22222.fas',
    category: 'fungi',
    title: 'cesi',
    status: 'built',
    sequenceCount: 106,
    isPublic: false,
    creator: 'admin',
    createTime: '2026-06-29 17:04:46'
  }
])

const total = computed(() => tableData.value.length)

const getStatusType = (status: string) => {
  const typeMap: Record<string, string> = {
    built: 'success',
    building: 'warning',
    failed: 'danger'
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    built: '已构建',
    building: '构建中',
    failed: '构建失败'
  }
  return textMap[status] || status
}

const triggerFileSelect = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = [...selectedFiles.value, ...Array.from(target.files)]
  }
  target.value = ''
}

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1)
}

const handleUpload = () => {
  if (selectedFiles.value.length === 0) {
    ElMessage.warning('请先选择要上传的FASTA文件')
    return
  }
  if (!uploadForm.category.trim()) {
    ElMessage.warning('请填写分类目录')
    return
  }
  uploading.value = true
  setTimeout(() => {
    uploading.value = false
    const newItem: DatabaseItem = {
      id: Date.now(),
      fileName: selectedFiles.value[0].name,
      category: uploadForm.category,
      title: uploadForm.title || selectedFiles.value[0].name.replace(/\.[^.]+$/, ''),
      status: 'built',
      sequenceCount: Math.floor(Math.random() * 200) + 50,
      isPublic: false,
      creator: 'admin1',
      createTime: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-')
    }
    tableData.value.unshift(newItem)
    selectedFiles.value = []
    uploadForm.category = ''
    uploadForm.title = ''
    ElMessage.success('任务创建成功')
  }, 1500)
}

const handleBuildFromData = () => {
  if (selectForm.markers.length === 0) {
    ElMessage.warning('请至少选择一个序列标记')
    return
  }
  if (specimenLeafIds.value.length === 0) {
    ElMessage.warning('请至少选择一条数据')
    return
  }
  if (!selectForm.category.trim()) {
    ElMessage.warning('请填写分类目录')
    return
  }
  const markerLabels = selectForm.markers.map(v => markerList.value.find(m => m.value === v)?.label).join('、')
  const count = specimenLeafIds.value.length
  building.value = true
  setTimeout(() => {
    building.value = false
    ElMessage.success(`任务创建成功，标记：${markerLabels}，共 ${count} 条数据，分类：${selectForm.category}${selectForm.title ? '，标题：' + selectForm.title : ''}`)
    selectForm.markers = []
    selectForm.specimenValues = []
    selectForm.category = ''
    selectForm.title = ''
  }, 1500)
}


const refreshList = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('列表已刷新')
  }, 500)
}

const handleSelectionChange = (selection: DatabaseItem[]) => {
  selectedRows.value = selection
}

const togglePublic = (row: DatabaseItem) => {
  ElMessage.success(`已${row.isPublic ? '公开' : '取消公开'}数据库 \"${row.title}\"`)
}

const rebuildDatabase = (row: DatabaseItem) => {
  ElMessage.info(`正在构建数据库 \"${row.fileName}\"`)
}

const deleteDatabase = (row: DatabaseItem) => {
  ElMessageBox.confirm(
    `确定要删除数据库 \"${row.fileName}\" 吗？此操作不可恢复。`,
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.id === row.id)
    if (index > -1) {
      tableData.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleJumpPage = (page: number) => {
  if (page && page >= 1 && page <= Math.ceil(total.value / pageSize.value)) {
    currentPage.value = page
  }
}
</script>

<style scoped lang="scss">
.blast-database-page {
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.card {
  background: #fff;
  border-bottom: 1px solid #e8eaec;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.section-icon {
  font-size: 16px;
  color: #2d5ffb;
  margin-right: 8px;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

/* 建库方式 */
.upload-section {
  margin-top: 16px;

  .build-mode-bar {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f2f5;
  }

  .build-mode-title {
    font-size: 14px;
    font-weight: 600;
    color: #1f2d3d;
    white-space: nowrap;
  }

  .build-mode-radio {
    :deep(.el-radio) {
      margin-right: 20px;
    }
  }

  .upload-form {
    padding: 20px 24px 24px;
  }

  .upload-main-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: nowrap;
    gap: 24px;
  }

  .upload-action-row {
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .upload-left {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 0 0 auto;
    width: fit-content;
  }

  .upload-right {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-left: auto;
    flex: 0 0 auto;
  }

  .file-select-item {
    display: flex;
    align-items: center;
    gap: 12px;
    width: fit-content;
  }

  .file-select-area {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    flex: 0 0 auto;
  }

  .select-file-btn {
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 2px 6px rgba(45, 95, 251, 0.15);
  }

  .selected-files {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .file-tag {
    max-width: 200px;
  }

  .upload-btn,
  .build-btn {
    background: linear-gradient(135deg, #f5a623, #e8931a);
    border: none;
    border-radius: 8px;
    padding: 10px 24px;
    font-size: 14px;
    font-weight: 500;
    color: #fff;
    box-shadow: 0 3px 8px rgba(245, 166, 35, 0.3);
    width: fit-content;

    &:hover {
      background: linear-gradient(135deg, #f7b442, #f5a623);
    }
  }

  /* 选择数据建树表单 */
  .select-form {
    padding: 20px 24px 24px;
  }

  .select-main-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: nowrap;
    gap: 24px;
  }

  .select-action-row {
    padding-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .select-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 0 0 auto;
    width: fit-content;
  }

  .select-right {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-left: auto;
    flex: 0 0 auto;
  }

  .form-select {
    width: 320px;

    :deep(.el-select__wrapper) {
      border-radius: 6px;
    }

    .db-tag {
      margin-left: 8px;
    }
  }

  .marker-select {
    width: 160px;
  }

  .selected-count-tag {
    margin-left: 8px;
    flex-shrink: 0;
  }

  .select-all-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #495060;
    cursor: pointer;
    padding: 4px 8px;
    border-bottom: 1px solid #f0f2f5;
    user-select: none;

    &:hover {
      background: #f5f7fa;
    }
  }

  .form-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .form-label {
    font-size: 14px;
    color: #495060;
    white-space: nowrap;
    min-width: 72px;
    text-align: right;

    &.required::before {
      content: '*';
      color: #f56c6c;
      margin-right: 2px;
    }
  }

  .form-input {
    width: 200px;

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      border-radius: 6px;
    }
  }
}

/* 数据库列表 */
.database-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-bottom: none;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  border-bottom: 1px solid #f0f2f5;

  .section-header {
    border-bottom: none;
  }
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-right: 20px;
}

.status-select {
  width: 130px;
}

.refresh-btn {
  color: #495060;
}

.table-wrapper {
  flex: 1;
  padding: 0;
  overflow-x: auto;
}

.database-table {
  width: 100%;

  :deep(.el-table__header-wrapper th) {
    background: #fafbfc !important;
    color: #1f2937;
    font-weight: 600;
    font-size: 13px;
  }

  :deep(.el-table__row) {
    font-size: 13px;

    td {
      padding: 12px 0;
    }
  }

  .status-tag {
    border-radius: 4px;
    font-weight: 500;
  }

  .action-btn {
    padding: 5px 10px;
    border-radius: 6px;
    font-size: 12px;
    margin: 0 2px;

    &.rebuild-btn {
      background: #52c41a;
      border-color: #52c41a;
      color: #fff;

      &:hover {
        background: #73d13d;
        border-color: #73d13d;
      }
    }

    &.delete-btn {
      background: #f56c6c;
      border-color: #f56c6c;
      color: #fff;
      padding: 5px 8px;

      &:hover {
        background: #f78989;
        border-color: #f78989;
      }
    }
  }
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 16px 20px;
  gap: 12px;
  border-top: 1px solid #f0f2f5;
}

.total-text {
  font-size: 13px;
  color: #495060;
}

.pagination {
  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.el-pager li) {
    border-radius: 6px;
  }

  :deep(.el-pager li.is-active) {
    background: #2d5ffb;
  }
}

.jump-text {
  font-size: 13px;
  color: #495060;
}

.jump-input {
  width: 70px;
}

/* 响应式 */
@media screen and (max-width: 1200px) {
  .upload-section .upload-main-row,
  .upload-section .select-main-row {
    flex-wrap: wrap;
  }

  .upload-section .upload-right,
  .upload-section .select-right {
    margin-left: 0;
    flex-wrap: wrap;
  }
}

@media screen and (max-width: 992px) {
  .upload-form,
  .select-form {
    padding: 16px !important;
  }

  .upload-section .upload-main-row,
  .upload-section .select-main-row {
    flex-direction: column;
    gap: 16px;
  }

  .upload-section .upload-right,
  .upload-section .select-right {
    margin-left: 0;
    flex-wrap: wrap;
    gap: 12px;
  }

  .upload-section .form-select {
    width: 100%;
    max-width: 320px;
  }

  .pagination-wrapper {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  .list-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px 16px;
    gap: 10px;
  }

  .list-actions {
    padding-right: 0;
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
