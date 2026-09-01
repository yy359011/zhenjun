<template>
  <div class="phylogenetic-page">
    <!-- 系统发育分析区域 -->
    <div class="analysis-section card">
      <div class="page-header">
        <span class="header-title">系统发育分析</span>
      </div>

      <el-tabs v-model="activeTab" class="build-tabs" tab-position="top">
        <!-- Tab 1: 选择数据建树 -->
        <el-tab-pane label="选择数据建树" name="data">
          <div class="tab-form">
            <div class="form-grid">
              <div class="form-item grid-item">
                <label class="form-label">任务名称</label>
                <el-input
                  v-model="dataForm.taskName"
                  placeholder="例如：地衣ITS系统发育分析"
                  class="form-control"
                />
              </div>
              <div class="form-item grid-item">
                <label class="form-label">选择标本</label>
                <el-select
                  v-model="dataForm.specimens"
                  multiple
                  filterable
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="输入标本编号或物种名搜索"
                  class="form-control"
                >
                  <el-option
                    v-for="sp in specimenOptions"
                    :key="sp.id"
                    :label="sp.collectionNo + ' - ' + sp.speciesName"
                    :value="sp.id"
                  />
                </el-select>
              </div>
            </div>

            <div class="form-item row-item">
              <label class="form-label">基因标记</label>
              <div class="gene-marks">
                <el-checkbox
                  v-for="gm in geneMarks"
                  :key="gm.value"
                  v-model="dataForm.geneMarks"
                  :label="gm.value"
                  class="gene-checkbox"
                >
                  {{ gm.label }}
                </el-checkbox>
              </div>
            </div>

            <div class="form-item row-item">
              <label class="form-label">
                序列ID字段
                <el-tooltip content="用于生成FASTA记录ID的字段组合" placement="top">
                  <el-icon class="help-icon"><QuestionFilled /></el-icon>
                </el-tooltip>
              </label>
              <div class="id-fields">
                <el-checkbox
                  v-for="f in idFields"
                  :key="f.value"
                  v-model="dataForm.idFields"
                  :label="f.value"
                  class="id-checkbox"
                >
                  {{ f.label }}
                </el-checkbox>
                <span class="id-preview">预览：[标本编号]_[拉丁名]_[基因标记]</span>
              </div>
            </div>

            <div class="form-item row-item form-item-inline">
              <label class="form-label">外群</label>
              <el-select
                v-model="dataForm.outgroup"
                clearable
                placeholder="可选"
                class="outgroup-select"
              >
                <el-option
                  v-for="sp in specimenOptions"
                  :key="sp.id"
                  :label="sp.collectionNo"
                  :value="sp.id"
                />
              </el-select>
            </div>

            <div class="form-actions">
              <el-button type="primary" class="submit-btn" :loading="submitting['data']" @click="handleSubmitData">
                提交分析
              </el-button>
              <el-button class="reset-btn" @click="resetForm('data')">重置</el-button>
              <span class="form-hint">请至少选择 3 个标本和 1 个基因标记</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 手动输入拓扑 -->
        <el-tab-pane label="手动输入拓扑" name="topology">
          <div class="tab-form">
            <div class="form-item row-item">
              <label class="form-label">任务名称</label>
              <el-input
                v-model="topologyForm.taskName"
                placeholder="例如：手动导入的拓扑结构"
                class="form-control task-name-input"
              />
            </div>

            <div class="form-item row-item column-item">
              <label class="form-label">Newick 格式</label>
              <el-input
                v-model="topologyForm.newick"
                type="textarea"
                :rows="4"
                placeholder="例如：((A:0.1,B:0.2):0.3,(C:0.4,D:0.5):0.6);"
                resize="vertical"
                class="newick-textarea"
              />
              <el-button size="default" class="upload-nwk-btn" @click="triggerNwkSelect">
                上传 .nwk 文件
              </el-button>
              <input
                ref="nwkInputRef"
                type="file"
                accept=".nwk,.tree,.newick,.txt"
                style="display: none"
                @change="handleNwkFileChange"
              />
            </div>

            <div class="form-item row-item form-item-inline">
              <label class="form-label">外群</label>
              <el-select
                v-model="topologyForm.outgroup"
                clearable
                placeholder="可选"
                class="outgroup-select"
              >
                <el-option label="A" :value="'A'" />
                <el-option label="B" :value="'B'" />
                <el-option label="C" :value="'C'" />
                <el-option label="D" :value="'D'" />
              </el-select>
            </div>

            <div class="form-actions">
              <el-button type="primary" class="submit-btn" :loading="submitting['topology']" @click="handleSubmitTopology">
                提交分析
              </el-button>
              <el-button class="reset-btn" @click="resetForm('topology')">重置</el-button>
              <span class="form-hint">请输入 Newick 格式</span>
            </div>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 上传FASTA文件 -->
        <el-tab-pane label="上传FASTA文件" name="fasta">
          <div class="tab-form">
            <div class="form-item row-item">
              <label class="form-label">任务名称</label>
              <el-input
                v-model="fastaForm.taskName"
                placeholder="例如：LSU序列建树"
                class="form-control task-name-input"
              />
            </div>

            <div class="form-item row-item column-item">
              <label class="form-label">FASTA内容</label>
              <el-input
                v-model="fastaForm.content"
                type="textarea"
                :rows="6"
                placeholder="粘贴 FASTA 格式多序列，或从 BLAST 搜索结果导入"
                resize="both"
                class="fasta-textarea"
              />
            </div>

            <div class="form-item row-item column-item">
              <label class="form-label">FASTA文件</label>
              <el-upload
                class="fasta-uploader"
                drag
                :auto-upload="false"
                :multiple="false"
                accept=".fas,.fasta,.fa,.fna"
                :on-change="handleFastaFileChange"
                :show-file-list="false"
              >
                <el-icon class="upload-icon"><UploadFilled /></el-icon>
                <div class="upload-text">
                  拖拽文件到此处，或 <span class="upload-link">点击选择</span>
                </div>
              </el-upload>
              <div v-if="fastaForm.file" class="selected-file-tag">
                <el-tag closable type="info" @close="fastaForm.file = null">
                  {{ fastaForm.file.name }}
                </el-tag>
              </div>
              <div class="format-hint">支持 .fas / .fasta / .fa / .fna 格式；与上方 FASTA 内容二选一</div>
            </div>

            <div class="form-item row-item form-item-inline">
              <label class="form-label">外群</label>
              <el-select
                v-model="fastaForm.outgroup"
                clearable
                placeholder="可选"
                class="outgroup-select"
              >
                <el-option label="外群_seq1" :value="'seq1'" />
                <el-option label="外群_seq2" :value="'seq2'" />
              </el-select>
            </div>

            <div class="form-actions">
              <el-button type="primary" class="submit-btn" :loading="submitting['fasta']" @click="handleSubmitFasta">
                提交分析
              </el-button>
              <el-button class="reset-btn" @click="resetForm('fasta')">重置</el-button>
              <span class="form-hint">请粘贴至少 3 条 FASTA 序列或上传文件（二选一）</span>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 分析任务列表 -->
    <div class="task-section card">
      <div class="list-header">
        <span class="list-title">分析任务</span>
        <div class="list-actions">
          <el-button type="success" plain class="batch-btn" :disabled="selectedTasks.length === 0" @click="handleBatchShare">
            批量共享
          </el-button>
          <el-button type="warning" plain class="batch-btn" :disabled="!selectedTasks.some(t => t.shared)" @click="handleBatchUnshare">
            批量取消共享
          </el-button>
          <el-button text type="primary" class="refresh-btn" @click="refreshTasks">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="list-table-wrapper">
        <el-table
          :data="pagedTasks"
          style="width: 100%"
          @selection-change="handleSelectionChange"
          :header-cell-style="{ background: '#fafbfc', fontWeight: 600, color: '#1f2d3d', fontSize: '13px' }"
          :cell-style="{ fontSize: '13px' }"
        >
          <el-table-column type="selection" width="42" align="center" />
          <el-table-column prop="taskName" label="任务名称" min-width="200" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="task-name-text">{{ row.taskName }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="creator" label="创建用户" width="110">
            <template #default="{ row }">
              <span class="creator-text">{{ row.creator }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="geneMark" label="基因标记" width="90">
            <template #default="{ row }">
              <el-tag v-if="row.geneMark" type="primary" effect="plain" size="small">{{ row.geneMark }}</el-tag>
              <span v-else class="empty-cell">-</span>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="90" align="center">
            <template #default="{ row }">
              <el-tag type="success" effect="light" size="small">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="100" align="center">
            <template #default="{ row }">
              <span class="progress-text">{{ row.progress }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="创建时间" width="160" align="center">
            <template #default="{ row }">
              <span class="time-text">{{ row.createTime }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="shared" label="共享状态" width="80" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.shared" type="success" effect="plain" size="small">共享</el-tag>
              <el-tag v-else type="info" effect="plain" size="small">私有</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="170" align="center" fixed="right">
            <template #default="{ row }">
              <div class="op-btns">
                <el-button type="primary" link size="small" @click="viewTree(row)">查看树</el-button>
                <template v-if="row.shared">
                  <el-button type="warning" link size="small" @click="toggleShare(row)">取消共享</el-button>
                </template>
                <template v-else>
                  <el-button type="success" link size="small" @click="toggleShare(row)">共享</el-button>
                </template>
                <el-button type="danger" link size="small" @click="deleteTask(row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-wrapper">
        <span class="total-text">共 {{ taskList.length }} 条</span>
        <el-select v-model="pageSize" class="page-size-select" @change="handlePageSizeChange">
          <el-option label="10条/页" :value="10" />
          <el-option label="20条/页" :value="20" />
          <el-option label="50条/页" :value="50" />
        </el-select>
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="taskList.length"
          layout="prev, pager, next"
          small
          class="pager"
        />
      </div>
    </div>

    <!-- 进化树查看弹窗 -->
    <el-dialog
      v-model="treeDialogVisible"
      :show-close="false"
      class="tree-view-dialog"
      width="92vw"
      top="4vh"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <template #default>
        <div class="tree-viewer">
          <!-- 标题栏 -->
          <div class="tree-viewer-header">
            <span class="tree-viewer-title">进化树 - {{ currentTreeTask?.taskName || '' }}</span>
            <el-icon class="tree-close-btn" @click="closeTreeDialog"><Close /></el-icon>
          </div>

          <!-- Tabs 分页 -->
          <el-tabs v-model="treeTab" class="tree-tabs">
            <el-tab-pane label="系统发育树" name="tree">
              <!-- 工具栏 -->
              <div class="tree-toolbar">
                <div class="toolbar-left">
                  <el-checkbox v-model="treeOpts.showBranchLength" class="tool-check">分支长度</el-checkbox>
                  <el-checkbox v-model="treeOpts.showBootstrap" class="tool-check">支持率</el-checkbox>

                  <div class="tool-divider" />

                  <el-radio-group v-model="treeOpts.layout" class="layout-radio" @change="layoutTree">
                    <el-radio-button value="rectangular">rectangular</el-radio-button>
                    <el-radio-button value="polar">polar</el-radio-button>
                    <el-radio-button value="radial">radial</el-radio-button>
                  </el-radio-group>

                  <div class="tool-divider" />

                  <template v-if="treeOpts.layout === 'rectangular'">
                    <span class="tool-label">垂直</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustVert(-4)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <span class="tool-value">{{ treeOpts.vertSpacing }}</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustVert(4)">
                      <el-icon><Plus /></el-icon>
                    </el-button>

                    <span class="tool-label">水平</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustHorz(-4)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <span class="tool-value">{{ treeOpts.horzSpacing }}</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustHorz(4)">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>

                  <template v-else>
                    <span class="tool-label">径向</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustHorz(-4)">
                      <el-icon><Minus /></el-icon>
                    </el-button>
                    <span class="tool-value">{{ treeOpts.horzSpacing }}</span>
                    <el-button size="small" circle class="tool-mini-btn" @click="adjustHorz(4)">
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>

                  <el-checkbox v-model="treeOpts.equalBranch" class="tool-check" @change="layoutTree">等距分支</el-checkbox>
                </div>

                <div class="toolbar-right">
                  <el-input
                    v-model="treeSearch"
                    placeholder="搜索节点..."
                    clearable
                    class="tree-search-input"
                    :prefix-icon="Search"
                  />
                  <el-button size="small" circle class="tool-mini-btn" @click="adjustZoom(-0.1)">
                    <el-icon><Minus /></el-icon>
                  </el-button>
                  <el-button size="small" circle class="tool-mini-btn" @click="adjustZoom(0.1)">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                  <el-button size="small" class="tool-reset-btn" @click="resetTreeView">重置</el-button>
                  <el-dropdown @command="handleDownload">
                    <el-button size="small" type="primary" class="tool-download-btn">
                      下载
                      <el-icon class="el-icon--right"><ArrowDown /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="svg">SVG 矢量图</el-dropdown-item>
                        <el-dropdown-item command="png">PNG 图片</el-dropdown-item>
                        <el-dropdown-item command="newick">Newick 格式</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>

              <!-- SVG 画布（仅 rectangular 使用） -->
              <div
                v-if="treeOpts.layout === 'rectangular'"
                class="tree-canvas-wrapper"
                ref="treeCanvasRef"
                @wheel.prevent="onTreeWheel"
              >
                <svg
                  ref="treeSvgRef"
                  class="tree-svg"
                  :viewBox="treeViewBox"
                  :width="treeSvgWidth"
                  :height="treeSvgHeight"
                >
                  <!-- 背景（浅灰色，参考图风格） -->
                  <rect x="0" y="0" width="100%" height="100%" fill="#f4f5f7" />

                  <!-- 连线 -->
                  <g class="tree-edges">
                    <path
                      v-for="(edge, i) in treeEdges"
                      :key="'e-' + i"
                      :d="edge.path"
                      :stroke="edge.color || '#b0b4bf'"
                      stroke-width="1.4"
                      fill="none"
                    />
                  </g>

                  <!-- 内部节点支持率 -->
                  <g v-if="treeOpts.showBootstrap" class="tree-bootstraps">
                    <text
                      v-for="(bs, i) in treeBootstraps"
                      :key="'bs-' + i"
                      :x="bs.x" :y="bs.y"
                      :transform="bs.transform || ''"
                      :fill="bs.color || '#1f2d3d'"
                      class="tree-bootstrap"
                      text-anchor="middle"
                    >{{ bs.value }}</text>
                  </g>

                  <!-- 叶节点 -->
                  <g class="tree-leaves">
                    <g
                      v-for="(leaf, i) in treeLeaves"
                      :key="'l-' + i"
                      :class="{ 'is-highlight': isHighlighted(leaf.name) }"
                    >
                      <circle
                        :cx="leaf.x" :cy="leaf.y" r="4"
                        fill="#2d5ffb" stroke="#fff" stroke-width="1.5"
                        class="leaf-dot"
                      />
                      <text
                        :x="leaf.labelX" :y="leaf.labelY"
                        :transform="leaf.transform || ''"
                        :text-anchor="leaf.labelAnchor || 'start'"
                        :fill="leaf.labelColor || '#1f2d3d'"
                        class="leaf-label"
                      >{{ leaf.name }}</text>
                      <text
                        v-if="treeOpts.showBranchLength && leaf.lengthLabel"
                        :x="leaf.lengthX != null ? leaf.lengthX : leaf.x - 4"
                        :y="leaf.lengthY != null ? leaf.lengthY : leaf.y + 4"
                        :transform="leaf.transform || ''"
                        :text-anchor="leaf.lengthAnchor || 'end'"
                        class="leaf-length"
                      >:{{ leaf.lengthLabel }}</text>
                    </g>
                  </g>

                  <!-- 高亮矩形（搜索结果） -->
                  <rect
                    v-if="highlightRect"
                    :x="highlightRect.x - 6"
                    :y="highlightRect.y - 14"
                    :width="highlightRect.w + 12"
                    height="22"
                    rx="4"
                    fill="rgba(45, 95, 251, 0.12)"
                    stroke="#2d5ffb"
                    stroke-width="1.5"
                  />
                </svg>
              </div>

              <!-- polar / radial 静态图片 -->
              <div
                v-else
                class="tree-image-wrapper"
                @wheel.prevent="onTreeWheel"
              >
                <img
                  v-if="treeOpts.layout === 'polar'"
                  :src="polarImg"
                  alt="扇形树 polar"
                  class="tree-layout-img"
                  :style="{ transform: `scale(${treeOpts.zoom})`, transformOrigin: 'center center' }"
                />
                <img
                  v-else
                  :src="radialImg"
                  alt="辐射树 radial"
                  class="tree-layout-img"
                  :style="{ transform: `scale(${treeOpts.zoom})`, transformOrigin: 'center center' }"
                />
              </div>
            </el-tab-pane>

            <el-tab-pane label="运行命令" name="commands">
              <pre class="cmd-json"><code>{
  "commands": [
    [
      "/opt/conda/envs/fungtree/bin/mafft",
      "--auto",
      "--quiet",
      "/tmp/fungtree-tree-_jcsdblf/input.fasta"
    ],
    [
      "/opt/conda/envs/fungtree/bin/trimal",
      "-in",
      "/tmp/fungtree-tree-_jcsdblf/aligned.fasta",
      "-out",
      "/tmp/fungtree-tree-_jcsdblf/trimmed.fasta",
      "-automated1"
    ],
    [
      "/opt/conda/envs/fungtree/bin/FastTree",
      "-nt",
      "/tmp/fungtree-tree-_jcsdblf/trimmed.fasta"
    ]
  ]
}</code></pre>
            </el-tab-pane>
          </el-tabs>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import polarImg from '../images/polar.png'
import radialImg from '../images/radial.png'
import {
  QuestionFilled,
  UploadFilled,
  Refresh,
  Top,
  Close,
  Minus,
  Plus,
  Search,
  ArrowDown,
  CopyDocument
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

interface GeneMark {
  value: string
  label: string
}

interface IdField {
  value: string
  label: string
}

interface Specimen {
  id: number
  collectionNo: string
  speciesName: string
}

interface TaskItem {
  id: number
  taskName: string
  creator: string
  geneMark: string
  status: string
  progress: string
  createTime: string
  shared: boolean
  commands?: string[][]
}

const activeTab = ref('data')
const submitting = reactive<Record<string, boolean>>({
  data: false,
  topology: false,
  fasta: false
})
const nwkInputRef = ref<HTMLInputElement | null>(null)

/* ============ 选择数据建树 ============ */
const specimenOptions = ref<Specimen[]>([
  { id: 1, collectionNo: 'HMAS-L 012345', speciesName: 'Amanita muscaria' },
  { id: 2, collectionNo: 'HMAS-L 012346', speciesName: 'Ganoderma lucidum' },
  { id: 3, collectionNo: 'HMAS-L 012347', speciesName: 'Cordyceps sinensis' },
  { id: 4, collectionNo: 'HMAS-L 012348', speciesName: 'Lentinula edodes' },
  { id: 5, collectionNo: 'HMAS-L 012349', speciesName: 'Pleurotus ostreatus' },
  { id: 6, collectionNo: 'HMAS-L 012350', speciesName: 'Trametes versicolor' }
])

const geneMarks = ref<GeneMark[]>([
  { value: 'rpb2', label: 'rpb2 (RNA聚合酶II第二大亚基)' },
  { value: 'rpb1', label: 'rpb1 (RNA聚合酶II最大亚基)' },
  { value: 'ITS', label: 'ITS (内转录间隔区)' },
  { value: 'tef1', label: 'tef1 (翻译延伸因子)' },
  { value: 'nrLSU', label: 'nrLSU (核糖体大亚基)' }
])

const idFields = ref<IdField[]>([
  { value: 'specimen', label: '标本编号' },
  { value: 'latin', label: '拉丁名' },
  { value: 'gene', label: '基因标记' }
])

const dataForm = reactive({
  taskName: '',
  specimens: [] as number[],
  geneMarks: ['ITS'] as string[],
  idFields: ['specimen', 'latin', 'gene'] as string[],
  outgroup: null as number | null
})

/* ============ 手动输入拓扑 ============ */
const topologyForm = reactive({
  taskName: '',
  newick: '',
  outgroup: null as string | null
})

/* ============ 上传FASTA文件 ============ */
const fastaForm = reactive({
  taskName: '',
  content: '',
  file: null as File | null,
  outgroup: null as string | null
})

/* ============ 分析任务列表 ============ */
const taskList = ref<TaskItem[]>([
  {
    id: 1, taskName: 'BLAST建树-2ce93eb0', creator: 'wugang...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-08-26 00:50:41', shared: false,
    commands: [
      ['/opt/conda/envs/fungtree/bin/mafft', '--auto', '--quiet', '--quiet', '/tmp/fungtree-tree-_jcsdblf/input.fasta'],
      ['/opt/conda/envs/fungtree/bin/trimal', '-in', '/tmp/fungtree-tree-_jcsdblf/aligned.fasta', '-out', '/tmp/fungtree-tree-_jcsdblf/trimmed.fasta', '-automated1'],
      ['/opt/conda/envs/fungtree/bin/FastTree', '-nt', '/tmp/fungtree-tree-_jcsdblf/trimmed.fasta']
    ]
  },
  { id: 2, taskName: '测试555', creator: '1295759...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-08-06 14:50:00', shared: false },
  { id: 3, taskName: '测试333', creator: '1295759...', geneMark: 'nrLSU', status: '已完成', progress: '分析完成', createTime: '2026-08-06 14:39:56', shared: false },
  { id: 4, taskName: '测试222', creator: '1295759...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-08-04 14:53:53', shared: false },
  { id: 5, taskName: '测试111', creator: '1295759...', geneMark: 'nrLSU', status: '已完成', progress: '分析完成', createTime: '2026-08-04 14:49:25', shared: false },
  { id: 6, taskName: 'FASTA文件分析 - Try3_MF_GB.fas', creator: 'wangxiny...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-07-01 14:28:38', shared: false },
  { id: 7, taskName: 'BLAST建树-86863c2d', creator: '2062807...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-07-01 10:19:02', shared: false },
  { id: 8, taskName: '测试树1', creator: 'admin1', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-06-30 14:17:50', shared: false },
  { id: 9, taskName: 'BLAST建树-0a9a3d48', creator: '2062807...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-06-30 09:40:33', shared: false },
  { id: 10, taskName: '测试1', creator: '2062807...', geneMark: '', status: '已完成', progress: '分析完成', createTime: '2026-06-29 16:46:10', shared: true }
])

const currentPage = ref(1)
const pageSize = ref(10)
const selectedTasks = ref<TaskItem[]>([])

const pagedTasks = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return taskList.value.slice(start, start + pageSize.value)
})

/* ============ 提交动作 ============ */
function pushNewTask(name: string, gene: string = '') {
  const newTask: TaskItem = {
    id: Date.now(),
    taskName: name,
    creator: 'admin1',
    geneMark: gene,
    status: '已完成',
    progress: '分析完成',
    createTime: new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-'),
    shared: false
  }
  taskList.value.unshift(newTask)
  currentPage.value = 1
}

const handleSubmitData = () => {
  if (dataForm.specimens.length < 3) {
    ElMessage.warning('请至少选择 3 个标本')
    return
  }
  if (dataForm.geneMarks.length < 1) {
    ElMessage.warning('请至少选择 1 个基因标记')
    return
  }
  submitting.data = true
  setTimeout(() => {
    submitting.data = false
    const name = dataForm.taskName || `选择数据建树-${Math.random().toString(36).slice(2, 8)}`
    pushNewTask(name, dataForm.geneMarks.join(';'))
    ElMessage.success('分析任务创建成功')
    resetForm('data')
  }, 1500)
}

const handleSubmitTopology = () => {
  if (!topologyForm.newick.trim()) {
    ElMessage.warning('请输入 Newick 格式')
    return
  }
  submitting.topology = true
  setTimeout(() => {
    submitting.topology = false
    const name = topologyForm.taskName || `拓扑建树-${Math.random().toString(36).slice(2, 8)}`
    pushNewTask(name)
    ElMessage.success('分析任务创建成功')
    resetForm('topology')
  }, 1500)
}

const handleSubmitFasta = () => {
  const hasContent = fastaForm.content.trim().length > 0
  const hasFile = !!fastaForm.file
  if (!hasContent && !hasFile) {
    ElMessage.warning('请粘贴 FASTA 序列或上传文件（二选一）')
    return
  }
  if (hasContent) {
    const seqs = fastaForm.content.trim().split('>').filter(Boolean)
    if (seqs.length < 3) {
      ElMessage.warning('请至少提供 3 条 FASTA 序列')
      return
    }
  }
  submitting.fasta = true
  setTimeout(() => {
    submitting.fasta = false
    const name = fastaForm.taskName || (fastaForm.file ? `FASTA-${fastaForm.file.name}` : `FASTA建树-${Math.random().toString(36).slice(2, 8)}`)
    pushNewTask(name)
    ElMessage.success('分析任务创建成功')
    resetForm('fasta')
  }, 1500)
}

const resetForm = (tab: string) => {
  if (tab === 'data') {
    dataForm.taskName = ''
    dataForm.specimens = []
    dataForm.geneMarks = ['ITS']
    dataForm.idFields = ['specimen', 'latin', 'gene']
    dataForm.outgroup = null
  } else if (tab === 'topology') {
    topologyForm.taskName = ''
    topologyForm.newick = ''
    topologyForm.outgroup = null
  } else if (tab === 'fasta') {
    fastaForm.taskName = ''
    fastaForm.content = ''
    fastaForm.file = null
    fastaForm.outgroup = null
  }
}

/* ============ 文件处理 ============ */
const triggerNwkSelect = () => nwkInputRef.value?.click()

const handleNwkFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const text = String(reader.result || '').trim()
    topologyForm.newick = text
    ElMessage.success(`已导入 ${file.name}`)
  }
  reader.readAsText(file)
  input.value = ''
}

const handleFastaFileChange = (uploadFile: any) => {
  const raw = uploadFile.raw as File
  if (!raw) return
  fastaForm.file = raw
  if (!fastaForm.taskName) {
    fastaForm.taskName = `FASTA文件分析 - ${raw.name}`
  }
}

/* ============ 任务列表操作 ============ */
const handleSelectionChange = (rows: TaskItem[]) => (selectedTasks.value = rows)

const handlePageSizeChange = () => (currentPage.value = 1)

const refreshTasks = () => {
  ElMessage.success('任务列表已刷新')
}

const viewTree = (row: TaskItem) => {
  treeTab.value = 'tree'
  currentTreeTask.value = row
  generateMockTree(row)
  layoutTree()
  treeDialogVisible.value = true
  treeSearch.value = ''
  resetTreeView()
}

/* ============ 进化树查看器 ============ */
interface TreeNode {
  name?: string
  length?: number
  bootstrap?: number
  children?: TreeNode[]
  // 布局后通用
  x?: number
  y?: number
  r?: number
  angle?: number
  subtreeHeight?: number
  isLeaf?: boolean
  // polar/radial 专用
  cumLen?: number
  _tmpX?: number
  _tmpY?: number
  _color?: string
  _fillColor?: string
  _lineColor?: string
  _aMin?: number
  _aMax?: number
}

interface TreeEdge {
  x1: number
  y1: number
  x2: number
  y2: number
  path: string
  color?: string
}

interface TreeLeaf {
  name: string
  x: number
  y: number
  lengthLabel: string
  // 新增：布局后标签坐标
  labelX?: number
  labelY?: number
  lengthX?: number
  lengthY?: number
  labelAnchor?: 'start' | 'middle' | 'end'
  lengthAnchor?: 'start' | 'middle' | 'end'
  transform?: string
  labelColor?: string
}

interface TreeBootstrap {
  value: string
  x: number
  y: number
  transform?: string
  color?: string
}

interface TreeSector { path: string; color: string }

interface HighlightRect {
  x: number
  y: number
  w: number
}

const treeDialogVisible = ref(false)
const treeTab = ref('tree')
const currentTreeTask = ref<TaskItem | null>(null)
const treeCanvasRef = ref<HTMLElement | null>(null)
const treeSvgRef = ref<SVGSVGElement | null>(null)

const treeOpts = reactive({
  showBranchLength: true,
  showBootstrap: true,
  layout: 'rectangular' as 'rectangular' | 'polar' | 'radial',
  vertSpacing: 32,
  horzSpacing: 40,
  equalBranch: true,
  zoom: 1
})

const treeRoot = ref<TreeNode | null>(null)
const treeLeaves = ref<TreeLeaf[]>([])
const treeEdges = ref<TreeEdge[]>([])
const treeBootstraps = ref<TreeBootstrap[]>([])
const treeRadialSectors = ref<TreeSector[]>([])
const treeSearch = ref('')
const highlightRect = ref<HighlightRect | null>(null)

const treeViewBox = ref('0 0 1200 600')
const treeBaseViewBox = ref('0 0 1200 600')
const treeSvgWidth = ref('100%')
const treeSvgHeight = ref(560)
const rootCenter = ref({ x: 0, y: 0 })

/* ---- Newick 解析 ---- */
function parseNewick(s: string): TreeNode {
  let i = 0
  const str = s.trim().replace(/;$/, '')

  function peek(): string { return str[i] }
  function consume(): string { return str[i++] }

  function parseNode(): TreeNode {
    const node: TreeNode = { isLeaf: true }
    // children
    if (peek() === '(') {
      node.isLeaf = false
      consume() // (
      node.children = []
      node.children.push(parseNode())
      while (peek() === ',') {
        consume()
        node.children.push(parseNode())
      }
      consume() // )
    }
    // name (can include bootstrap like [83] or just digits)
    let name = ''
    while (i < str.length && peek() !== ':' && peek() !== ',' && peek() !== ')' && peek() !== '(') {
      // bootstrap in [xxx]
      if (peek() === '[') {
        consume()
        let bs = ''
        while (peek() !== ']') bs += consume()
        consume()
        node.bootstrap = parseInt(bs, 10)
        continue
      }
      name += consume()
    }
    // internal bootstrap stored as trailing digits before colon (e.g. "name83:0.02")
    // but we already handle [xxx] syntax above
    // length
    if (peek() === ':') {
      consume()
      let len = ''
      while (i < str.length && /[\d.eE+\-]/.test(peek())) len += consume()
      if (len) node.length = parseFloat(len)
    }
    node.name = name.trim() || undefined
    return node
  }

  const root = parseNode()
  return root
}

/* ---- 后序遍历计算子树高度 ---- */
function computeSubtreeHeight(node: TreeNode): number {
  if (!node.children || node.children.length === 0) {
    node.subtreeHeight = 1
    return 1
  }
  let h = 0
  for (const c of node.children) h += computeSubtreeHeight(c)
  node.subtreeHeight = h
  return h
}

/* ---- 布局入口 ---- */
function layoutTree() {
  if (!treeRoot.value) return
  if (treeOpts.layout === 'rectangular') {
    treeRadialSectors.value = []
    layoutRectangular()
  } else if (treeOpts.layout === 'polar') {
    treeRadialSectors.value = []
    layoutPolar()
  } else if (treeOpts.layout === 'radial') {
    layoutRadial()
  }
  if (treeSearch.value.trim()) updateHighlight()
}

/* ---- 矩形树布局 ---- */
function layoutRectangular() {
  const root = treeRoot.value!
  computeSubtreeHeight(root)

  const vertGap = treeOpts.vertSpacing
  const horzGap = treeOpts.horzSpacing
  const marginLeft = 40
  const marginTop = 30

  let maxPathLen = 0
  function findMaxPathLen(node: TreeNode, cur: number) {
    cur += node.length || 0.01
    if (!node.children || node.children.length === 0) {
      if (cur > maxPathLen) maxPathLen = cur
      return
    }
    node.children.forEach(c => findMaxPathLen(c, cur))
  }
  findMaxPathLen(root, 0)

  const useEqual = treeOpts.equalBranch
  const scale = useEqual ? horzGap / 1 : (maxPathLen > 0 ? Math.max(400, horzGap * 10) / maxPathLen : 400)

  function assignX(node: TreeNode, parentX: number) {
    node.x = parentX
    if (!node.children || node.children.length === 0) return
    const step = useEqual ? horzGap : ((node.children[0].length || 0.01) * scale)
    for (const c of node.children) assignX(c, node.x + step)
  }
  assignX(root, marginLeft)

  const leaves: TreeLeaf[] = []
  const edges: TreeEdge[] = []
  const bootstraps: TreeBootstrap[] = []

  function placeY(node: TreeNode, yTop: number): number {
    if (!node.children || node.children.length === 0) {
      node.y = yTop + vertGap / 2
      const lbl = node.length != null ? node.length.toFixed(4) : ''
      leaves.push({
        name: node.name || '',
        x: node.x!, y: node.y!,
        lengthLabel: lbl,
        labelX: node.x! + 10,
        labelY: node.y! + 4,
        lengthX: node.x! - 4,
        lengthY: node.y! + 4,
        lengthAnchor: 'end'
      })
      return vertGap
    }
    let totalH = 0
    for (const c of node.children) {
      const h = placeY(c, yTop + totalH)
      totalH += h
    }
    node.y = yTop + totalH / 2

    for (const c of node.children) {
      const parentX = node.x!
      const path = `M ${c!.x} ${c!.y} L ${parentX} ${c!.y} L ${parentX} ${node.y}`
      edges.push({ x1: c!.x!, y1: c!.y!, x2: node.x!, y2: node.y!, path })
    }
    if (node.bootstrap != null && node.children.length > 0) {
      bootstraps.push({
        value: node.bootstrap + '%',
        x: node.x! + 14,
        y: node.y! - 4
      })
    }
    return totalH
  }

  const totalHeight = placeY(root, 0) + marginTop + 30
  const rightmostX = Math.max(...leaves.map(l => l.labelX! + (l.name.length * 7.5))) + 30
  const totalWidth = Math.max(rightmostX, marginLeft + horzGap * 14 + 200)

  treeBaseViewBox.value = `0 0 ${totalWidth} ${totalHeight}`
  treeViewBox.value = `0 0 ${totalWidth} ${totalHeight}`
  treeSvgHeight.value = Math.min(680, Math.max(300, totalHeight * 0.95))

  leaves.forEach(l => { l.y += marginTop; l.labelY! += marginTop; l.lengthY! += marginTop })
  edges.forEach(e => {
    const m = e.path.match(/M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)/)
    if (m) {
      e.path = `M ${m[1]} ${parseFloat(m[2]) + marginTop} L ${m[3]} ${parseFloat(m[4]) + marginTop} L ${m[5]} ${parseFloat(m[6]) + marginTop}`
    }
    e.y1 += marginTop; e.y2 += marginTop
  })
  bootstraps.forEach(b => { b.y += marginTop })

  treeLeaves.value = leaves
  treeEdges.value = edges
  treeBootstraps.value = bootstraps
  rootCenter.value = { x: 0, y: 0 }
}

/* ---- 扇形树（polar，参考图：root 在中央，360° 辐射，子树分色）---- */
function layoutPolar() {
  const root = treeRoot.value!
  computeSubtreeHeight(root)

  const horzGap = treeOpts.horzSpacing
  const margin = 100

  // ===== 颜色池（参考图的色系）=====
  const PALETTE = [
    '#3b82f6', // 蓝
    '#22c55e', // 绿
    '#8b5cf6', // 紫
    '#06b6d4', // 青
    '#f59e0b', // 橙黄
    '#ec4899', // 粉
    '#84cc16', // 黄绿
    '#a16207', // 棕
    '#0ea5e9', // 天蓝
    '#d946ef'  // 品红
  ]

  // ===== Step 1: 半径分配 =====
  // 先算每个节点到 root 的累积长度
  function calcCum(node: TreeNode, parentLen: number) {
    const myLen = parentLen + (node.length || 0)
    node.cumLen = myLen
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) calcCum(c, myLen)
  }
  calcCum(root, 0)

  let maxCum = 0
  let maxDepth = 0
  function findMax(node: TreeNode, d: number) {
    if ((node.cumLen || 0) > maxCum) maxCum = node.cumLen || 0
    if (!node.children || node.children.length === 0) {
      maxDepth = Math.max(maxDepth, d)
    } else {
      for (const c of node.children) findMax(c, d + 1)
    }
  }
  findMax(root, 0)

  const useEqual = treeOpts.equalBranch
  const targetRadius = Math.max(360, horzGap * 10)

  function assignRadius(node: TreeNode, depth: number) {
    if (useEqual) {
      node.r = depth * (targetRadius / Math.max(1, maxDepth))
    } else {
      const scale = maxCum > 0 ? (targetRadius / maxCum) : 400
      node.r = (node.cumLen || 0) * scale
    }
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) assignRadius(c, depth + 1)
  }
  assignRadius(root, 0)

  // ===== Step 2: 叶节点顺序 + 角度 =====
  const leavesOrder: TreeNode[] = []
  function collectLeaves(node: TreeNode) {
    if (!node.children || node.children.length === 0) {
      leavesOrder.push(node)
      return
    }
    for (const c of node.children) collectLeaves(c)
  }
  collectLeaves(root)

  const n = leavesOrder.length
  leavesOrder.forEach((lf, i) => {
    // 从顶部 (-π/2) 开始，顺时针均匀分布 2π
    lf.angle = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2
  })

  // 后序：内部节点 = 子节点均值（处理 0/2π 边界）
  function assignAngleInternal(node: TreeNode) {
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) assignAngleInternal(c)
    const first = node.children[0].angle!
    const last = node.children[node.children.length - 1].angle!
    let mid = (first + last) / 2
    if (Math.abs(last - first) > Math.PI) mid += Math.PI
    while (mid > Math.PI) mid -= Math.PI * 2
    while (mid < -Math.PI) mid += Math.PI * 2
    node.angle = mid
  }
  assignAngleInternal(root)

  // ===== Step 3: 画布中心 =====
  // 先用临时坐标算整体范围
  const tmps: { x: number; y: number }[] = []
  function computeTmp(node: TreeNode) {
    const x = (node.r || 0) * Math.cos(node.angle!)
    const y = (node.r || 0) * Math.sin(node.angle!)
    tmps.push({ x, y })
    node._tmpX = x
    node._tmpY = y
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) computeTmp(c)
  }
  computeTmp(root)

  const minX = Math.min(...tmps.map(t => t.x))
  const maxX = Math.max(...tmps.map(t => t.x))
  const minY = Math.min(...tmps.map(t => t.y))
  const maxY = Math.max(...tmps.map(t => t.y))

  // root 精确居中：root 的 tmpX=0 对应物理坐标画布中心
  const canvasW = (maxX - minX) + margin * 2
  const canvasH = (maxY - minY) + margin * 2
  const rootX = canvasW / 2
  const rootY = canvasH / 2

  // ===== Step 4: 子树颜色传递 =====
  function assignColors(node: TreeNode, parentColor: string) {
    // 如果是 root，给每个子节点分配不同颜色
    let myColor = parentColor
    if (node === root) {
      for (let i = 0; i < node.children!.length; i++) {
        assignColors(node.children![i], PALETTE[i % PALETTE.length])
      }
      return
    }
    // 非 root：保持父颜色，直到遇到叶子为止
    node._color = myColor
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) assignColors(c, myColor)
  }
  assignColors(root, PALETTE[0])

  // ===== Step 5: 渲染 =====
  const leaves: TreeLeaf[] = []
  const edges: TreeEdge[] = []
  const bootstraps: TreeBootstrap[] = []

  function render(node: TreeNode) {
    node.x = rootX + (node._tmpX || 0)
    node.y = rootY + (node._tmpY || 0)
    const myColor = node._color || PALETTE[0]

    if (!node.children || node.children.length === 0) {
      const cosA = Math.cos(node.angle!)
      const isRight = cosA >= 0
      const degText = ((node.angle! * 180) / Math.PI)
      leaves.push({
        name: node.name || '',
        x: node.x!, y: node.y!,
        lengthLabel: '',
        labelX: node.x! + (isRight ? 12 : -12),
        labelY: node.y! + 4,
        labelAnchor: isRight ? 'start' : 'end',
        transform: `rotate(${degText.toFixed(1)} ${node.x} ${node.y})`,
        labelColor: myColor
      })
      return
    }

    for (const c of node.children) {
      const cx = rootX + c._tmpX!
      const cy = rootY + c._tmpY!
      edges.push({
        x1: node.x!, y1: node.y!,
        x2: cx, y2: cy,
        path: '',
        color: c._color || myColor
      })
      render(c)
    }

    // 支持率：参考图用小数（如 0.97, 0.95, 1.00）
    if (node.bootstrap != null && node.children.length > 0) {
      const midR = (node.r || 0) +
                   ((node.children[0].r || 0) - (node.r || 0)) * 0.5
      const midA = node.angle!
      const bx = rootX + midR * Math.cos(midA)
      const by = rootY + midR * Math.sin(midA) - 6
      const val = (node.bootstrap / 100).toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '')
      bootstraps.push({
        value: val === '0' ? '' : val, // 过滤掉 0
        x: bx,
        y: by,
        color: '#5a6070'
      })
    }
  }

  render(root)

  treeBaseViewBox.value = `0 0 ${canvasW} ${canvasH}`
  treeViewBox.value = `0 0 ${canvasW} ${canvasH}`
  treeSvgHeight.value = Math.min(700, Math.max(320, canvasH * 0.95))
  rootCenter.value = { x: rootX, y: rootY }

  treeLeaves.value = leaves
  treeEdges.value = edges
  treeBootstraps.value = bootstraps.filter(b => b.value)  // 去掉空值
}

/* ---- 辐射树（radial，参考图：弯曲分支 + 子树扇形背景）---- */
function layoutRadial() {
  const root = treeRoot.value!
  computeSubtreeHeight(root)

  const horzGap = treeOpts.horzSpacing
  const margin = 100

  // ===== 颜色池（参考图风格）=====
  const FILL = ['#fde2e4', '#d7f0ff', '#fef9c3', '#e0d4ff', '#dcfce7', '#fce7f3', '#ecfeff', '#fff7ed']
  const LINE = ['#e11d48', '#2563eb', '#ca8a04', '#7c3aed', '#16a34a', '#db2777', '#0891b2', '#c2410c']

  // ===== Step 1: 半径 =====
  function calcCum2(node: TreeNode, parentLen: number) {
    const myLen = parentLen + (node.length || 0)
    node.cumLen = myLen
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) calcCum2(c, myLen)
  }
  calcCum2(root, 0)

  let maxCum = 0, maxDepth = 0
  function findMax2(node: TreeNode, d: number) {
    if ((node.cumLen || 0) > maxCum) maxCum = node.cumLen || 0
    if (!node.children || node.children.length === 0) { maxDepth = Math.max(maxDepth, d) }
    else { for (const c of node.children) findMax2(c, d + 1) }
  }
  findMax2(root, 0)

  const useEqual = treeOpts.equalBranch
  const targetRadius = Math.max(360, horzGap * 12)

  function assignRadius(node: TreeNode, depth: number) {
    if (useEqual) {
      node.r = depth * (targetRadius / Math.max(1, maxDepth))
    } else {
      const scale = maxCum > 0 ? (targetRadius / maxCum) : 400
      node.r = (node.cumLen || 0) * scale
    }
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) assignRadius(c, depth + 1)
  }
  assignRadius(root, 0)

  // ===== Step 2: 角度 =====
  const leafOrder: TreeNode[] = []
  function collectLeaves(node: TreeNode) {
    if (!node.children || node.children.length === 0) { leafOrder.push(node); return }
    for (const c of node.children) collectLeaves(c)
  }
  collectLeaves(root)
  const n = leafOrder.length
  leafOrder.forEach((lf, i) => {
    lf.angle = -Math.PI / 2 + (i / Math.max(1, n)) * Math.PI * 2
  })

  function assignAngleInternal(node: TreeNode) {
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) assignAngleInternal(c)
    const first = node.children[0].angle!
    const last = node.children[node.children.length - 1].angle!
    let mid = (first + last) / 2
    if (Math.abs(last - first) > Math.PI) mid += Math.PI
    while (mid > Math.PI) mid -= Math.PI * 2
    while (mid < -Math.PI) mid += Math.PI * 2
    node.angle = mid
  }
  assignAngleInternal(root)

  // 子树角度范围（用于扇形背景）
  function assignAngleRange(node: TreeNode) {
    if (!node.children || node.children.length === 0) {
      node._aMin = node.angle!; node._aMax = node.angle!; return
    }
    for (const c of node.children) assignAngleRange(c)
    let aMin = Infinity, aMax = -Infinity
    for (const c of node.children) {
      if (c._aMin! < aMin) aMin = c._aMin!
      if (c._aMax! > aMax) aMax = c._aMax!
    }
    node._aMin = aMin; node._aMax = aMax
  }
  assignAngleRange(root)

  // ===== Step 3: 画布 =====
  const tmps: { x: number; y: number; r: number; angle: number }[] = []
  function computeTmp(node: TreeNode) {
    node._tmpX = (node.r || 0) * Math.cos(node.angle!)
    node._tmpY = (node.r || 0) * Math.sin(node.angle!)
    tmps.push({ x: node._tmpX!, y: node._tmpY!, r: node.r || 0, angle: node.angle! || 0 })
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) computeTmp(c)
  }
  computeTmp(root)

  const minX = Math.min(...tmps.map(t => t.x))
  const maxX = Math.max(...tmps.map(t => t.x))
  const minY = Math.min(...tmps.map(t => t.y))
  const maxY = Math.max(...tmps.map(t => t.y))
  const canvasW = (maxX - minX) + margin * 2
  const canvasH = (maxY - minY) + margin * 2
  // 偏移让所有坐标 >= 0
  const offsetX = -minX + margin
  const offsetY = -minY + margin
  // 根在原始 _tmpX=0, _tmpY=0 的位置
  const rootX = offsetX
  const rootY = offsetY

  // ===== Step 4: 颜色传递 =====
  function assignColors(node: TreeNode, fill: string, line: string) {
    node._fillColor = fill
    node._lineColor = line
    if (!node.children || node.children.length === 0) return
    if (node === root || node.children.length > 1) {
      for (let i = 0; i < node.children.length; i++) {
        assignColors(
          node.children[i],
          FILL[i % FILL.length],
          LINE[i % LINE.length]
        )
      }
    } else {
      assignColors(node.children[0], fill, line)
    }
  }
  assignColors(root, '#ffffff', '#374151')

  // ===== Step 5: 扇形背景（root 的每个子节点一个扇形）=====
  const sectors: TreeSector[] = []
  function polarXY(r: number, a: number) {
    return { x: rootX + r * Math.cos(a), y: rootY + r * Math.sin(a) }
  }
  function maxLeavesR(node: TreeNode): number {
    if (!node.children || node.children.length === 0) return node.r || 0
    let m = 0
    for (const c of node.children) m = Math.max(m, maxLeavesR(c))
    return m
  }
  function collectSectors(node: TreeNode) {
    if (!node.children || node.children.length === 0) return
    for (const c of node.children) {
      const rInner = node.r || 0
      const rOuter = maxLeavesR(c)
      const aStart = c._aMin!
      const aEnd = c._aMax!
      // 如果是叶子节点（无子节点），也给它画一个小扇形区域
      if (!c.children || c.children.length === 0) {
        // 给叶子画一个小区域（它自己的角度 ± 半扇宽度）
        const halfAngle = Math.PI * 2 / Math.max(1, n) / 2
        const s = c.angle! - halfAngle
        const e = c.angle! + halfAngle
        const p1 = polarXY(rInner, s)
        const p2 = polarXY(rOuter, s)
        const p3 = polarXY(rOuter, e)
        const p4 = polarXY(rInner, e)
        const bigArc = (e - s) > Math.PI ? 1 : 0
        const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rOuter} ${rOuter} 0 ${bigArc} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${rInner} ${rInner} 0 ${bigArc} 0 ${p1.x} ${p1.y} Z`
        sectors.push({ path: d, color: c._fillColor || '#f1f5f9' })
      } else {
        const p1 = polarXY(rInner, aStart)
        const p2 = polarXY(rOuter, aStart)
        const p3 = polarXY(rOuter, aEnd)
        const p4 = polarXY(rInner, aEnd)
        const bigArc = (aEnd - aStart) > Math.PI ? 1 : 0
        const d = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${rOuter} ${rOuter} 0 ${bigArc} 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${rInner} ${rInner} 0 ${bigArc} 0 ${p1.x} ${p1.y} Z`
        sectors.push({ path: d, color: c._fillColor || '#f1f5f9' })
        collectSectors(c)
      }
    }
  }
  if (root.children && root.children.length > 0) {
    collectSectors(root)
  }

  // ===== Step 6: 渲染分支 + 叶节点 =====
  // 弯曲分支：折线 父节点 → (父半径在子节点角度处) → 子节点
  function curvedPath(nodeX: number, nodeY: number, nodeR: number, childX: number, childY: number, childAngle: number): string {
    if (nodeR < 0.1) {
      // 从 root 出发，直接到 child 角度的小半径点再直线到 child
      const midR = Math.max(horzGap * 0.5, 10)
      const midX = rootX + midR * Math.cos(childAngle)
      const midY = rootY + midR * Math.sin(childAngle)
      return `M ${nodeX} ${nodeY} L ${midX} ${midY} L ${childX} ${childY}`
    }
    const arcX = rootX + nodeR * Math.cos(childAngle)
    const arcY = rootY + nodeR * Math.sin(childAngle)
    return `M ${nodeX} ${nodeY} L ${arcX} ${arcY} L ${childX} ${childY}`
  }

  const leaves: TreeLeaf[] = []
  const edges: TreeEdge[] = []
  const bootstraps: TreeBootstrap[] = []

  function render(node: TreeNode) {
    node.x = (node._tmpX || 0) + offsetX
    node.y = (node._tmpY || 0) + offsetY
    const lineColor = node._lineColor || '#374151'

    if (!node.children || node.children.length === 0) {
      const cosA = Math.cos(node.angle!)
      const isRight = cosA >= 0
      const degText = ((node.angle! * 180) / Math.PI)
      leaves.push({
        name: node.name || '',
        x: node.x!, y: node.y!,
        lengthLabel: '',
        labelX: node.x! + (isRight ? 14 : -14),
        labelY: node.y! + 4,
        labelAnchor: isRight ? 'start' : 'end',
        transform: `rotate(${degText.toFixed(1)} ${node.x} ${node.y})`,
        labelColor: '#1f2d3d'
      })
      return
    }

    for (const c of node.children) {
      const cx = rootX + c._tmpX!
      const cy = rootY + c._tmpY!
      const path = curvedPath(node.x!, node.y!, node.r || 0, cx, cy, c.angle!)
      edges.push({
        x1: node.x!, y1: node.y!, x2: cx, y2: cy,
        path,
        color: c._lineColor || lineColor
      })
      render(c)
    }

    // 支持率：小数格式
    if (node.bootstrap != null && node.children.length > 0) {
      const midR = (node.r || 0) +
                   ((node.children[0].r || 0) - (node.r || 0)) * 0.5
      const midA = node.angle!
      const bx = rootX + midR * Math.cos(midA)
      const by = rootY + midR * Math.sin(midA) - 6
      const val = (node.bootstrap / 100).toFixed(2).replace(/\.?0+$/, '').replace(/\.$/, '')
      bootstraps.push({
        value: val === '0' ? '' : val,
        x: bx,
        y: by,
        color: '#374151'
      })
    }
  }

  render(root)

  treeBaseViewBox.value = `0 0 ${canvasW} ${canvasH}`
  treeViewBox.value = `0 0 ${canvasW} ${canvasH}`
  treeSvgHeight.value = Math.min(700, Math.max(320, canvasH * 0.95))
  rootCenter.value = { x: rootX, y: rootY }

  treeRadialSectors.value = sectors
  treeLeaves.value = leaves
  treeEdges.value = edges
  treeBootstraps.value = bootstraps.filter(b => b.value)
}

/* ---- 扇形树（polar） ---- */
function generateMockTree(row: TaskItem) {
  // 与参考图一致的 Newick
  const newick =
    `((Suillus_aff_granulatus_Wu90_38:0.3167,` +
    `((Neoboletus_magnificus_HKAS_54096:0.0072,Neoboletus_obscureumbrinus_HKAS_63498:0.0091)[83]:0.02,` +
    `((Neoboletus_sp_HKAS_76851:0.0011,Neoboletus_brunneissimus_HKAS_52660:0.0030)[100]:0.01,` +
    `((Boletus_cf_fagicola_Mushroom_Observer_245071:0.0027,Rubroboletus_HKAS_84879:0.0197)[75]:0.03,` +
    `(Neoboletus_hainanensis_HKAS_59469:0.0020,Neoboletus_ferrugineus_HKAS_77617:0.0058)[98]:0.04)[67]:0.01,` +
    `Neoboletus_tomentulosus_HKAS_53369:0.0141)[60]:0.01)[54]:0.02,` +
    `((Neoboletus_infuscatus_FHMU3372:0.0070,Neoboletus_rubriporus_HKAS_83026:0.0057)[82]:0.01,` +
    `Neoboletus_sp_HKAS_50351:0.0143)[66]:0.01` +
    `)[49]:0.0);`
  treeRoot.value = parseNewick(newick)
}

/* ---- 搜索 ---- */
function isHighlighted(name: string): boolean {
  const q = treeSearch.value.trim().toLowerCase()
  if (!q) return false
  return name.toLowerCase().includes(q)
}

function updateHighlight() {
  const q = treeSearch.value.trim().toLowerCase()
  if (!q) { highlightRect.value = null; return }
  const first = treeLeaves.value.find(l => l.name.toLowerCase().includes(q))
  if (first) {
    highlightRect.value = {
      x: first.x + 10,
      y: first.y,
      w: first.name.length * 7.5
    }
  } else {
    highlightRect.value = null
  }
}

/* ---- 工具栏交互 ---- */
function adjustVert(delta: number) {
  treeOpts.vertSpacing = Math.max(12, Math.min(80, treeOpts.vertSpacing + delta))
  layoutTree()
}
function adjustHorz(delta: number) {
  treeOpts.horzSpacing = Math.max(12, Math.min(120, treeOpts.horzSpacing + delta))
  layoutTree()
}
function adjustZoom(delta: number) {
  treeOpts.zoom = Math.max(0.4, Math.min(3, treeOpts.zoom + delta))
  // 始终以基准 viewBox 计算，避免多次缩放叠加误差
  const vb = treeBaseViewBox.value.split(' ')
  const x = vb[0], y = vb[1]
  const w = parseFloat(vb[2])
  const h = parseFloat(vb[3])
  const newW = w / treeOpts.zoom
  const newH = h / treeOpts.zoom
  treeViewBox.value = `${x} ${y} ${newW} ${newH}`
}
function onTreeWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  adjustZoom(delta)
  console.log('[wheel] deltaY=', e.deltaY, 'zoom=', treeOpts.zoom, 'layout=', treeOpts.layout, 'vb=', treeViewBox.value)
}

/* ---- 命令面板辅助 ---- */
function getCmdName(fullPath: string) {
  const parts = fullPath.split('/')
  const base = parts[parts.length - 1] || fullPath
  // 去掉 conda 前缀的路径缩写
  return base || fullPath
}
function formatCmd(cmd: string[]) {
  return cmd.join(' ')
}
function copyCmd(cmd: string[]) {
  const text = formatCmd(cmd)
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('命令已复制到剪贴板')
  }).catch(() => {
    ElMessage.info(text)
  })
}

/* ---- 树弹窗控制 ---- */
function openTreeDialog(row: TaskItem) {
  treeTab.value = 'tree'
  currentTreeTask.value = row
  generateMockTree(row)
  treeDialogVisible.value = true
}
function resetTreeView() {
  treeOpts.showBranchLength = true
  treeOpts.showBootstrap = true
  treeOpts.layout = 'rectangular'
  treeOpts.vertSpacing = 32
  treeOpts.horzSpacing = 40
  treeOpts.equalBranch = true
  treeOpts.zoom = 1
  highlightRect.value = null
  layoutTree()
}
function closeTreeDialog() {
  treeDialogVisible.value = false
}

/* ---- 下载 ---- */
function handleDownload(cmd: string) {
  if (!treeSvgRef.value) return
  if (cmd === 'svg') {
    const serializer = new XMLSerializer()
    const svgStr = serializer.serializeToString(treeSvgRef.value)
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    triggerDownload(blob, `${currentTreeTask.value?.taskName || 'tree'}.svg`)
  } else if (cmd === 'png') {
    ElMessage.info('PNG 导出需要浏览器支持，已下载 SVG 版本')
    handleDownload('svg')
  } else if (cmd === 'newick') {
    // 简单 Newick 输出
    ElMessage.success('Newick 格式下载（模拟）')
  }
}
function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 搜索变化时更新高亮
watch(treeSearch, () => updateHighlight())

/* ============ 任务列表操作 ============ */
const toggleShare = (row: TaskItem) => {
  row.shared = !row.shared
  ElMessage.success(row.shared ? '已共享' : '已取消共享')
}

const deleteTask = (row: TaskItem) => {
  ElMessageBox.confirm(`确认删除任务「${row.taskName}」？`, '确认删除', {
    type: 'warning',
    confirmButtonText: '删除',
    cancelButtonText: '取消'
  })
    .then(() => {
      taskList.value = taskList.value.filter(t => t.id !== row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleBatchShare = () => {
  if (selectedTasks.value.length === 0) return
  selectedTasks.value.forEach(t => (t.shared = true))
  ElMessage.success(`已批量共享 ${selectedTasks.value.length} 个任务`)
}

const handleBatchUnshare = () => {
  const target = selectedTasks.value.filter(t => t.shared)
  if (target.length === 0) return
  target.forEach(t => (t.shared = false))
  ElMessage.success(`已批量取消共享 ${target.length} 个任务`)
}

const scrollToTop = () => {
  const scroller = document.querySelector('.main-content-wrapper, .layout-container, body')
  if (scroller) scroller.scrollTo?.({ top: 0, behavior: 'smooth' })
  else window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style lang="scss" scoped>
.phylogenetic-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 20px 36px;
  width: 100%;
  box-sizing: border-box;
  flex: 1;
  overflow-y: auto;
  background: #f5f7fa;
  position: relative;
}

.card {
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

/* 顶部标题 */
.page-header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;

  .header-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2d3d;
  }
}

/* Tab 样式 */
.build-tabs {
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    color: #495060;
    font-weight: 500;
    height: 46px;
    line-height: 46px;
    margin-right: 0;
    padding: 0 24px;
    border-right: 1px solid #f0f2f5;
    background: #f5f7fa;
    box-sizing: border-box;

    &.is-active {
      background: #fff;
      color: #2d5ffb;
      font-weight: 600;
    }

    &:hover {
      color: #2d5ffb;
    }

    &:last-child {
      border-right: none;
    }
  }

  :deep(.el-tabs__header) {
    background: #f5f7fa;
    margin: 0;
    border-bottom: 1px solid #e9edf3;
  }

  :deep(.el-tabs__active-bar) {
    display: none;
  }

  :deep(.el-tabs__content) {
    padding: 0;
  }
}

/* 表单通用 */
.tab-form {
  padding: 22px 28px 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 28px;
  margin-bottom: 18px;
}

.grid-item {
  width: 100%;
}

.form-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 16px;

  &.row-item {
    margin-bottom: 18px;
  }

  &.column-item {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }

  &.form-item-inline {
    align-items: center;
    margin-bottom: 12px;
  }
}

.form-label {
  font-size: 14px;
  color: #495060;
  font-weight: 500;
  min-width: 90px;
  max-width: 90px;
  text-align: right;
  padding-top: 8px;
  padding-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  flex-shrink: 0;

  .help-icon {
    color: #909399;
    font-size: 13px;
    cursor: help;
  }
}

.form-item.column-item .form-label {
  text-align: left;
  padding-top: 0;
  padding-right: 0;
  min-width: auto;
  max-width: none;
  justify-content: flex-start;
}

.form-control {
  width: 100%;

  :deep(.el-input__wrapper),
  :deep(.el-select__wrapper) {
    border-radius: 6px;
  }
}

.task-name-input {
  max-width: 480px;
  width: 100%;
}

/* 基因标记 */
.gene-marks {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 28px;
  align-items: center;
  flex: 1;

  :deep(.el-checkbox__label) {
    padding-left: 6px;
    font-size: 14px;
    color: #1f2d3d;
  }
}

.gene-checkbox {
  margin-right: 0;
}

/* 序列ID字段 */
.id-fields {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 24px;
  flex: 1;

  :deep(.el-checkbox__label) {
    padding-left: 6px;
    font-size: 14px;
    color: #2d5ffb;
  }
}

.id-checkbox {
  margin-right: 0;
}

.id-preview {
  margin-left: 8px;
  padding: 4px 10px;
  background: #f5f7fa;
  border: 1px solid #e9edf3;
  border-radius: 4px;
  color: #808695;
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 外群 */
.outgroup-select {
  width: 220px;

  :deep(.el-select__wrapper) {
    border-radius: 6px;
  }
}

/* 表单操作按钮 */
.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 4px;
  padding-left: 98px;
}

.submit-btn {
  background: linear-gradient(135deg, #6a9efd, #2d5ffb);
  border: none;
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  box-shadow: 0 3px 10px rgba(45, 95, 251, 0.3);

  &:hover {
    background: linear-gradient(135deg, #7cabff, #3a6eff);
  }
}

.reset-btn {
  border-radius: 8px;
  padding: 9px 20px;
  font-size: 14px;
  background: #fff;
}

.form-hint {
  color: #808695;
  font-size: 13px;
  margin-left: 4px;
}

/* 手动输入拓扑 */
.newick-textarea {
  width: 100%;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;

  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }
}

.upload-nwk-btn {
  border-radius: 6px;
  background: #fff;
  margin-top: 4px;
  align-self: flex-start;
}

/* FASTA内容 */
.fasta-textarea {
  width: 100%;
  max-width: 840px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.6;

  :deep(.el-textarea__inner) {
    border-radius: 6px;
  }
}

.fasta-uploader {
  width: 100%;
  max-width: 480px;

  :deep(.el-upload-dragger) {
    border: 1px dashed #d0d5dd;
    border-radius: 6px;
    padding: 28px 20px;
    background: #fff;
    transition: all 0.2s;

    &:hover {
      border-color: #2d5ffb;
      background: #f5f9ff;
    }
  }

  .upload-icon {
    font-size: 52px;
    color: #b0b4bf;
    margin-bottom: 6px;
  }

  .upload-text {
    font-size: 14px;
    color: #606266;
    margin-top: 6px;

    .upload-link {
      color: #2d5ffb;
      font-weight: 500;
      cursor: pointer;
    }
  }
}

.selected-file-tag {
  margin-top: 6px;
}

.format-hint {
  font-size: 12px;
  color: #808695;
  margin-top: 4px;
}

/* ============ 分析任务列表 ============ */
.task-section {
  padding-bottom: 4px;
}

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #f0f2f5;
}

.list-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2d3d;
}

.list-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.batch-btn {
  border-radius: 18px;
  padding: 6px 16px;
  font-size: 13px;

  &.el-button--success {
    background: #ecf7ef;
    border-color: #b8e0c1;
    color: #52c41a;

    &:hover {
      background: #d9f0dc;
    }
  }

  &.el-button--warning {
    background: #fff4e5;
    border-color: #f3d19c;
    color: #e8931a;

    &:hover {
      background: #ffe9cc;
    }
  }
}

.refresh-btn {
  font-size: 13px;
  padding: 6px 8px;
}

.list-table-wrapper {
  padding: 8px 12px 4px;
}

:deep(.el-table) {
  --el-table-border-color: #eef0f4;
  --el-table-header-bg-color: #fafbfc;

  th.el-table__cell {
    color: #1f2d3d;
  }

  td.el-table__cell {
    color: #495060;
  }
}

.task-name-text {
  font-size: 13px;
  color: #1f2d3d;
  font-weight: 500;
}

.creator-text {
  color: #495060;
  font-size: 13px;
}

.time-text,
.progress-text {
  color: #495060;
  font-size: 13px;
}

.empty-cell {
  color: #c0c4cc;
}

.op-btns {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* 分页 */
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 16px 18px;
}

.total-text {
  font-size: 13px;
  color: #495060;
}

.page-size-select {
  width: 120px;

  :deep(.el-select__wrapper) {
    border-radius: 6px;
  }
}

.pager {
  --el-pagination-hover-color: #2d5ffb;
}

/* 回到顶部 */
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 32px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2d5ffb;
  cursor: pointer;
  z-index: 20;
  transition: all 0.2s;

  &:hover {
    background: #2d5ffb;
    color: #fff;
    transform: translateY(-2px);
  }
}

/* 响应式 */
@media screen and (max-width: 1200px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .task-name-input,
  .fasta-textarea {
    max-width: 100%;
  }

  .fasta-uploader {
    max-width: 100%;
  }
}

@media screen and (max-width: 992px) {
  .phylogenetic-page {
    padding: 12px;
  }

  .tab-form {
    padding: 16px;
  }

  .form-item {
    flex-direction: column;
    align-items: stretch;

    &.form-item-inline {
      align-items: stretch;
    }
  }

  .form-label {
    text-align: left;
    min-width: auto;
    max-width: none;
    padding-top: 0;
    padding-right: 0;
    justify-content: flex-start;
  }

  .outgroup-select {
    width: 100%;
  }

  .form-actions {
    padding-left: 0;
    flex-wrap: wrap;
  }

  .list-table-wrapper {
    overflow-x: auto;
  }

  .pagination-wrapper {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media screen and (max-width: 768px) {
  :deep(.el-tabs__item) {
    padding: 0 14px;
    font-size: 13px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 16px;
  }

  .list-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}

/* ============ 进化树查看弹窗 ============ */
.tree-view-dialog {
  :deep(.el-dialog) {
    margin-top: 4vh;
    border-radius: 10px;
    padding: 0;
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.18);
    overflow: hidden;
  }
  :deep(.el-dialog__body) {
    padding: 0;
    max-height: 88vh;
    overflow: hidden;
  }
}

.tree-viewer {
  display: flex;
  flex-direction: column;
  height: 88vh;
  background: #fff;
}

.tree-viewer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #eef0f4;
  background: #fff;
}

.tree-viewer-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.tree-close-btn {
  font-size: 20px;
  color: #808695;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;

  &:hover {
    color: #f56c6c;
    background: #fef0f0;
  }
}

/* 工具栏 */
.tree-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 12px 24px;
  border-bottom: 1px solid #eef0f4;
  background: #fafbfc;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.tool-check {
  font-size: 13px;
  color: #495060;
  margin-right: 0;

  :deep(.el-checkbox__label) {
    padding-left: 4px;
  }
}

.tool-divider {
  width: 1px;
  height: 18px;
  background: #e0e3e8;
  margin: 0 4px;
}

.tool-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.tool-value {
  min-width: 28px;
  text-align: center;
  font-size: 13px;
  color: #1f2d3d;
  font-weight: 500;
}

.tool-mini-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border-radius: 4px;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;

  &:hover {
    color: #2d5ffb;
    border-color: #2d5ffb;
  }
}

.tree-search-input {
  width: 180px;

  :deep(.el-input__wrapper) {
    border-radius: 6px;
  }
}

.layout-radio {
  :deep(.el-radio-button__inner) {
    padding: 6px 14px;
    font-size: 12px;
  }
}

.tool-reset-btn {
  border-radius: 6px;
  background: #fff;
  border-color: #dcdfe6;
  color: #495060;
}

.tool-download-btn {
  border-radius: 6px;
  background: #2d5ffb;
  border-color: #2d5ffb;

  &:hover {
    background: #3a6eff;
    border-color: #3a6eff;
  }
}

/* SVG 画布 */
.tree-canvas-wrapper {
  flex: 1;
  overflow: auto;
  background: #f4f5f7;
}

.tree-image-wrapper {
  flex: 1;
  overflow: auto;
  background: #f4f5f7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.tree-layout-img {
  max-width: 100%;
  max-height: 100%;
  display: block;
  border-radius: 4px;
}

.tree-svg {
  display: block;
  min-height: 100%;
  background: #f4f5f7;
}

.leaf-label {
  font-size: 12px;
  fill: #1f2d3d;
  font-family: 'Segoe UI', Roboto, sans-serif;
}

.leaf-length {
  font-size: 11px;
  fill: #a4a9b3;
  font-family: Consolas, Monaco, monospace;
}

.tree-bootstrap {
  font-size: 11px;
  fill: #f08c00;
  font-weight: 600;
}

.leaf-dot {
  filter: drop-shadow(0 0 1px rgba(45, 95, 251, 0.4));
}

.tree-leaves .is-highlight .leaf-label {
  fill: #2d5ffb;
  font-weight: 600;
}

/* Tabs */
.tree-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  :deep(.el-tabs__header) {
    margin: 0;
    padding: 0 24px;
    background: #fafbfd;
    border-bottom: 1px solid #eef0f4;
  }
  :deep(.el-tabs__nav-wrap::after) {
    display: none;
  }
  :deep(.el-tabs__item) {
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
  }
  :deep(.el-tabs__item.is-active) {
    color: #2d5ffb;
    font-weight: 600;
  }
  :deep(.el-tabs__active-bar) {
    background: #2d5ffb;
  }
  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
    display: flex;
    min-height: 0;
  }
  :deep(.el-tab-pane) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: auto;
    height: 100%;
  }
}

/* ===== 运行命令代码区 ===== */
.cmd-json {
  margin: 0;
  padding: 28px 32px;
  flex: 1;
  overflow: auto;
  background: #1f2937;
  font-family: 'Menlo', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 13px;
  color: #e5e7eb;
  line-height: 1.7;
}
.cmd-json code {
  color: #e5e7eb;
  font-size: 13px;
}
</style>
