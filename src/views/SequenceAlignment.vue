<template>
  <div class="sequence-align-page">
    <!-- BLAST 搜索方式切换 -->
    <div class="blast-mode-card">
      <div class="blast-mode-switch">
        <el-radio-group v-model="blastMode" class="mode-radio-group">
          <el-radio value="local">本地 BLAST</el-radio>
          <el-radio value="ncbi">在线 BLAST (NCBI)</el-radio>
        </el-radio-group>
      </div>

      <!-- ============ 本地 BLAST 面板 ============ -->
      <div v-if="blastMode === 'local'" class="blast-search-section">
        <div class="search-form">
          <!-- 选择数据库 -->
          <div class="form-block">
            <div class="form-block-header">
              <label class="form-label required">选择数据库</label>
              <el-tag size="small" type="success" effect="plain" class="db-count-tag">
                共 {{ databaseList.length }} 个数据库
              </el-tag>
            </div>
            <div class="db-check-list">
              <el-checkbox
                v-model="selectedDatabases"
                :label="db.id"
                v-for="db in databaseList"
                :key="db.id"
                class="db-checkbox"
              >
                <span class="db-name">{{ db.title }}</span>
                <span class="db-seq-count">({{ db.sequenceCount }} seqs)</span>
              </el-checkbox>
              <el-empty
                v-if="databaseList.length === 0"
                description="暂无可用数据库"
                :image-size="80"
              />
            </div>
          </div>

          <!-- 查询序列 -->
          <div class="form-block">
            <label class="form-label required block-label">查询序列</label>
            <el-input
              v-model="querySequence"
              type="textarea"
              :rows="8"
              placeholder="输入查询序列（FASTA格式或原始序列）"
              resize="both"
              class="query-textarea"
            />
          </div>

          <!-- 搜索按钮 -->
          <div class="action-block">
            <el-button
              type="primary"
              class="search-btn"
              disabled
              title="本地 BLAST 功能暂时禁用"
              @click="handleBlastSearch"
            >
              <el-icon><Search /></el-icon>
              开始 BLAST 搜索
            </el-button>
          </div>
        </div>
      </div>

      <!-- ============ 在线 BLAST (NCBI) 面板 ============ -->
      <div v-else class="blast-online-section">
        <div class="online-info-card">
          <div class="info-icon">
            <el-icon><InfoFilled /></el-icon>
          </div>
          <span class="info-text">点击下方按钮将跳转至 NCBI 的在线 BLAST 服务</span>
        </div>
        <div class="online-action">
          <el-button class="ncbi-btn" @click="goToNcbiBlast">
            <el-icon><Link /></el-icon>
            前往 NCBI BLAST
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索结果区域（仅本地 BLAST 有搜索结果时展示） -->
    <div v-if="blastMode === 'local' && showResult" class="blast-result-section card">
      <div class="result-header">
        <span class="result-title">比对结果</span>
        <el-tag type="primary" effect="plain" size="small">
          共 {{ resultList.length }} 条匹配
        </el-tag>
      </div>
      <div class="result-table-wrapper">
        <el-table :data="resultList" style="width: 100%" stripe>
          <el-table-column prop="rank" label="序号" width="70" align="center" />
          <el-table-column prop="description" label="序列描述" min-width="220">
            <template #default="{ row }">
              <span class="desc-text">{{ row.description }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="score" label="得分" width="100" align="center" sortable />
          <el-table-column prop="eValue" label="E 值" width="120" align="center" sortable />
          <el-table-column prop="identity" label="一致性(%)" width="110" align="center" sortable>
            <template #default="{ row }">
              <el-tag :type="row.identity >= 90 ? 'success' : (row.identity >= 70 ? 'warning' : 'info')" size="small">
                {{ row.identity.toFixed(1) }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="gaps" label="Gap(%)" width="90" align="center" sortable />
          <el-table-column prop="coverage" label="覆盖度(%)" width="110" align="center" sortable />
          <el-table-column prop="accession" label="登录号" width="140">
            <template #default="{ row }">
              <span class="accession-text">{{ row.accession }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, InfoFilled, Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface DatabaseItem {
  id: number
  title: string
  sequenceCount: number
  category: string
}

interface BlastResultItem {
  rank: number
  description: string
  score: number
  eValue: string
  identity: number
  gaps: number
  coverage: number
  accession: string
}

const blastMode = ref<'local' | 'ncbi'>('ncbi')
const searching = ref(false)
const showResult = ref(false)
const querySequence = ref('')
const selectedDatabases = ref<number[]>([])

const databaseList = ref<DatabaseItem[]>([
  { id: 1, title: 'test_LSU', sequenceCount: 106, category: 'fungi' }
])

const resultList = ref<BlastResultItem[]>([])

const handleBlastSearch = () => {
  if (selectedDatabases.value.length === 0) {
    ElMessage.warning('请至少选择一个数据库')
    return
  }
  if (!querySequence.value.trim()) {
    ElMessage.warning('请输入查询序列')
    return
  }

  searching.value = true
  setTimeout(() => {
    searching.value = false
    resultList.value = generateMockResults(querySequence.value.trim().length || 200)
    showResult.value = true
    ElMessage.success(`BLAST搜索完成，共命中 ${resultList.value.length} 条匹配序列`)
    setTimeout(() => {
      document.querySelector('.blast-result-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }, 2000)
}

const goToNcbiBlast = () => {
  window.open('https://blast.ncbi.nlm.nih.gov/Blast.cgi', '_blank')
}

const generateMockResults = (len: number): BlastResultItem[] => {
  const descs = [
    'Amanita muscaria voucher HMAS0001 28S ribosomal RNA gene, partial sequence',
    'Ganoderma lucidum isolate G12 internal transcribed spacer 1, 5.8S, partial sequence',
    'Cordyceps sinensis strain CS-001 18S ribosomal RNA gene, complete sequence',
    'Lentinula edodes cultivar Xianggu1 ITS1-5.8S-ITS2 region, nuclear ribosomal DNA',
    'Pleurotus ostreatus var. florida large subunit ribosomal RNA gene, partial seq.',
    'Trametes versicolor isolate TV22 28S rRNA gene, D1/D2 domain, partial sequence',
    'Hericium erinaceus strain HE-2019 ITS region, complete sequence',
    'Morchella esculenta isolate ME-88 18S rRNA gene, partial sequence'
  ]
  const accessions = [
    'HMAS_L000123',
    'HQ123456.1',
    'KY789012',
    'MF456789.1',
    'LN123789',
    'KU987654.3',
    'MH321654.1',
    'KR654321.2'
  ]
  const count = Math.floor(Math.random() * 4) + 5
  return Array.from({ length: count }).map((_, i) => {
    const identity = 99.5 - (i * (Math.random() * 5 + 1.5))
    return {
      rank: i + 1,
      description: descs[i % descs.length],
      score: Math.floor(500 - i * (30 + Math.random() * 20)),
      eValue: i === 0 ? '0.0' : i < 3 ? `${(Math.random() * 0.0001).toExponential(2)}` : `${(Math.random() * 0.01).toExponential(2)}`,
      identity: Math.max(identity, 62),
      gaps: Math.floor(Math.random() * 4),
      coverage: Math.min(100, 90 + Math.floor(Math.random() * 11)),
      accession: accessions[i % accessions.length]
    }
  })
}
</script>

<style lang="scss" scoped>
.sequence-align-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 20px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
}

.card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* 模式切换卡片 */
.blast-mode-card {
  background: #fff;
  border-radius: 6px;
  padding: 20px 24px 24px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.blast-mode-switch {
  margin-bottom: 18px;
}

.mode-radio-group {
  display: flex;
  gap: 36px;

  :deep(.el-radio) {
    font-size: 14px;
    font-weight: 500;
    color: #606266;
    height: 32px;
    line-height: 32px;

    .el-radio__input {
      margin-right: 6px;

      .el-radio__inner {
        width: 16px;
        height: 16px;
        border: 1px solid #dcdfe6;
        background: #fff;
        transition: all 0.2s ease;
      }
    }

    .el-radio__label {
      padding-left: 0;
    }

    &.is-checked {
      .el-radio__input.is-checked .el-radio__inner {
        background: #2d5ffb;
        border-color: #2d5ffb;
      }

      .el-radio__input.is-checked + .el-radio__label {
        color: #2d5ffb;
      }
    }

    &:hover {
      .el-radio__input .el-radio__inner {
        border-color: #2d5ffb;
      }

      &:not(.is-checked) + .el-radio__label,
      .el-radio__label {
        color: #2d5ffb;
      }
    }
  }
}

/* ============ 本地 BLAST 面板 ============ */
.blast-search-section {
  padding-top: 4px;
}

.search-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-block-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-label {
  font-size: 14px;
  color: #495060;
  white-space: nowrap;
  font-weight: 500;

  &.required::before {
    content: '*';
    color: #f56c6c;
    margin-right: 2px;
  }
}

.block-label {
  margin-bottom: 4px;
}

.db-count-tag {
  --el-tag-padding-horizontal: 8px;
  background: #ecf7ef;
  border-color: #c7e6cf;
  color: #52c41a;
  font-size: 12px;
}

.db-check-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 32px;
  padding: 4px 0 4px 4px;
  min-height: 36px;
}

.db-checkbox {
  :deep(.el-checkbox__label) {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 14px;
    color: #1f2d3d;
    padding-left: 4px;
  }

  .db-name {
    font-weight: 500;
  }

  .db-seq-count {
    color: #808695;
    font-size: 13px;
  }
}

/* 查询序列文本域 */
.query-textarea {
  width: 100%;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;

  :deep(.el-textarea__inner) {
    border-radius: 6px;
    border-color: #dcdfe6;
    padding: 12px 14px;
    transition: all 0.2s ease;

    &::placeholder {
      color: #c0c4cc;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
    }

    &:focus {
      border-color: #2d5ffb;
      box-shadow: 0 0 0 2px rgba(45, 95, 251, 0.08);
    }
  }
}

/* 操作区 */
.action-block {
  display: flex;
  align-items: center;
  padding-top: 2px;
}

.search-btn {
  background: linear-gradient(135deg, #6a9efd, #2d5ffb);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 3px 10px rgba(45, 95, 251, 0.3);

  &:hover {
    background: linear-gradient(135deg, #7cabff, #3a6eff);
    box-shadow: 0 4px 14px rgba(45, 95, 251, 0.4);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(45, 95, 251, 0.3);
  }
}

/* ============ 在线 BLAST (NCBI) 面板 ============ */
.blast-online-section {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.online-info-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #eef3ff;
  border: 1px solid #d4e0ff;
  border-radius: 8px;
  padding: 18px 22px;

  .info-icon {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #2d5ffb;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    .el-icon {
      font-size: 16px;
    }
  }

  .info-text {
    font-size: 14px;
    color: #2d5ffb;
    font-weight: 500;
  }
}

.online-action {
  padding-left: 2px;
}

.ncbi-btn {
  background: linear-gradient(135deg, #6a9efd, #2d5ffb);
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 3px 10px rgba(45, 95, 251, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: linear-gradient(135deg, #7cabff, #3a6eff);
    box-shadow: 0 4px 14px rgba(45, 95, 251, 0.4);
  }

  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 6px rgba(45, 95, 251, 0.3);
  }
}

/* ============ 结果区 ============ */
.blast-result-section {
  .result-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 20px;
    border-bottom: 1px solid #f0f2f5;
  }

  .result-title {
    font-size: 15px;
    font-weight: 600;
    color: #1f2d3d;
  }

  .result-table-wrapper {
    padding: 14px 16px 18px;
  }

  :deep(.el-table) {
    --el-table-border-color: #eef0f4;
    --el-table-header-bg-color: #fafbfc;
    border-radius: 6px;

    th.el-table__cell {
      font-weight: 600;
      color: #1f2d3d;
      font-size: 13px;
      background: #fafbfc !important;
    }

    td.el-table__cell {
      font-size: 13px;
      color: #495060;
    }
  }

  .desc-text {
    font-size: 13px;
    line-height: 1.5;
    color: #495060;
  }

  .accession-text {
    font-family: Consolas, Monaco, monospace;
    font-size: 13px;
    color: #2d5ffb;
  }
}

/* 响应式 */
@media screen and (max-width: 992px) {
  .sequence-align-page {
    padding: 12px;
  }

  .blast-mode-card {
    padding: 16px;
  }

  .db-check-list {
    gap: 10px 20px;
  }
}

@media screen and (max-width: 768px) {
  .action-block,
  .online-action {
    justify-content: center;
  }

  .search-btn {
    width: 100%;
    justify-content: center;
  }

  .mode-radio-group {
    gap: 24px;

    :deep(.el-radio) {
      font-size: 13px;
    }
  }
}
</style>
