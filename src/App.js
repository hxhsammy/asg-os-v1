import React, { useState, useEffect } from "react";

// ==================================================================================
// 🚀 部署关键步骤 (DEPLOYMENT STEP)
// ==================================================================================
// 在 CodeSandbox 或 Vercel 中部署时，请【删除】下面这行代码开头的 "//" 双斜杠
// 这样才能真正连接到您的云端数据库。
// ==================================================================================

import { createClient } from "@supabase/supabase-js";

import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  Plus,
  Search,
  Trash2,
  ChevronRight,
  LayoutList,
  Kanban as KanbanIcon,
  Clock,
  User,
  LogOut,
  X,
  AlertTriangle,
  Layers,
  Cloud,
  Wifi,
} from "lucide-react";

// ==================================================================================
// 🔴 必填配置区 (请把您的 Supabase 信息填在引号里面)
// ==================================================================================
const SUPABASE_URL = "https://nduyqicjxmqlwjlnzrgz.supabase.co"; // 例如: "https://nduyqicjxmqlwjlnzrgz.supabase.co"
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdXlxaWNqeG1xbHdqbG56cmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU1OTUsImV4cCI6MjA3OTQ1MTU5NX0.SPDmyhQtjR4RlZ4s-InvVwvemuwoAzHSZI_vr91idUA"; // 例如: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdXlxaWNqeG1xbHdqbG56cmd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4NzU1OTUsImV4cCI6MjA3OTQ1MTU5NX0.SPDmyhQtjR4RlZ4s-InvVwvemuwoAzHSZI_vr91idUA"
// ==================================================================================

// --- 模拟客户端 (为了防止预览报错，正式部署会自动切换) ---
const mockClient = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: [], error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    delete: () => ({ eq: () => Promise.resolve({ error: null }) }),
  }),
  channel: () => ({ on: () => ({ subscribe: () => {} }) }),
  removeChannel: () => {},
};

// --- 初始化逻辑 ---
let supabase = mockClient;

// 这是一个自动检测：如果您在 CodeSandbox 里取消了 import 的注释，这里就会自动连接云端
if (typeof createClient !== "undefined" && SUPABASE_URL && SUPABASE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
}

// --- 配置常量 ---
const ACCESS_CODES = { ADMIN: "8888", EMPLOYEE: "6666" };

const STATUS_CONFIG = {
  pending: {
    label: "未开始",
    color: "bg-gray-400",
    next: "working",
    hex: "#9ca3af",
  },
  working: {
    label: "进行中",
    color: "bg-[#fdab3d]",
    next: "stuck",
    hex: "#fdab3d",
  },
  stuck: {
    label: "有延迟",
    color: "bg-[#e2445c]",
    next: "done",
    hex: "#e2445c",
  },
  done: {
    label: "完成",
    color: "bg-[#00c875]",
    next: "pending",
    hex: "#00c875",
  },
};

const PRIORITY_CONFIG = {
  high: { label: "高", color: "text-red-600 bg-red-50" },
  medium: { label: "中", color: "text-blue-600 bg-blue-50" },
  low: { label: "低", color: "text-gray-600 bg-gray-50" },
};

// --- 组件部分 ---

const ModalBase = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-4">
    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h3 className="text-lg font-bold text-slate-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-6">{children}</div>
    </div>
  </div>
);

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDangerous,
}) => {
  if (!isOpen) return null;
  return (
    <ModalBase title={title} onClose={onClose}>
      <div className="flex flex-col items-center text-center space-y-4">
        {isDangerous && (
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-2">
            <AlertTriangle size={24} />
          </div>
        )}
        <p className="text-gray-600">{message}</p>
        <div className="flex gap-3 w-full pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2 rounded-lg text-white font-medium shadow-md transition-colors ${
              isDangerous
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#407DB2] hover:bg-[#336591]"
            }`}
          >
            确认
          </button>
        </div>
      </div>
    </ModalBase>
  );
};

const LoginScreen = ({ onLogin }) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (code === ACCESS_CODES.ADMIN)
        onLogin({ role: "admin", name: "管理员" });
      else if (code === ACCESS_CODES.EMPLOYEE)
        onLogin({ role: "employee", name: "" });
      else {
        setError("无效的访问代码");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md animate-fade-in-up border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#407DB2] opacity-5 rounded-full transform translate-x-10 -translate-y-10"></div>
        <div className="text-center mb-12 relative z-10 flex flex-col items-center pt-4">
          <h1 className="text-4xl font-extrabold text-[#0F172A] mb-2 tracking-tight font-sans">
            ASG <span className="text-[#407DB2]">OS</span>
          </h1>
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-[0.2em]">
            Project Cloud
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Access Code
            </label>
            <input
              type="password"
              maxLength={4}
              className="w-full px-4 py-4 rounded-xl border-2 border-gray-100 focus:ring-0 focus:border-[#407DB2] outline-none text-center text-3xl tracking-[0.5em] font-mono text-slate-700 transition-all bg-gray-50 focus:bg-white"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="••••"
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg font-medium animate-pulse">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F172A] hover:bg-[#1e293b] text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex justify-center items-center gap-2 group"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              <>
                进入系统{" "}
                <ChevronRight
                  size={18}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  // 数据刷新逻辑
  const fetchData = async () => {
    if (supabase === mockClient) return; // 预览模式不拉取
    setLoadingData(true);
    try {
      const { data: pData } = await supabase.from("projects").select("*");
      const { data: tData } = await supabase.from("tasks").select("*");

      if (pData)
        setProjects(
          pData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
      if (tData)
        setTasks(
          tData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        );
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!user || supabase === mockClient) return;
    fetchData();

    let channel = null;
    if (typeof supabase.channel === "function") {
      channel = supabase
        .channel("schema-db-changes")
        .on("postgres_changes", { event: "*", schema: "public" }, () => {
          fetchData();
        })
        .subscribe();
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setView("dashboard");
  };

  if (!user) return <LoginScreen onLogin={setUser} />;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden font-sans text-slate-800">
      <Sidebar
        view={view}
        setView={setView}
        projects={projects}
        setActiveProjectId={setActiveProjectId}
        activeProjectId={activeProjectId}
        onLogout={handleLogout}
      />
      <main className="flex-1 overflow-hidden relative flex flex-col">
        {/* 状态指示条 */}
        {supabase === mockClient ? (
          <div className="bg-yellow-50 text-yellow-700 text-[10px] py-0.5 px-4 text-center flex items-center justify-center gap-2 border-b border-yellow-100">
            <Wifi size={10} /> 预览模式 (无数据库)。请按照代码顶部的注释，取消
            import 注释以连接 Supabase。
          </div>
        ) : (
          <div className="bg-[#407DB2] text-white text-[10px] py-0.5 px-4 text-center flex items-center justify-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
            <Cloud size={10} /> 数据已连接至 Supabase 云端 (CN/Global)
          </div>
        )}

        {view === "dashboard" && (
          <Dashboard
            projects={projects}
            tasks={tasks}
            user={user}
            onOpenProject={(id) => {
              setActiveProjectId(id);
              setView("project");
            }}
            refreshData={fetchData}
          />
        )}
        {view === "project" && activeProjectId && (
          <ProjectBoard
            project={projects.find((p) => p.id === activeProjectId)}
            tasks={tasks.filter((t) => t.projectId === activeProjectId)}
            user={user}
            refreshData={fetchData}
          />
        )}
        {view === "calendar" && <CalendarView tasks={tasks} />}
      </main>
    </div>
  );
}

const Sidebar = ({
  view,
  setView,
  projects,
  setActiveProjectId,
  activeProjectId,
  onLogout,
}) => (
  <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full shadow-sm z-10">
    <div className="p-6 flex items-center gap-3 border-b border-gray-100">
      <span className="font-extrabold text-xl text-slate-800 tracking-tight">
        ASG <span className="text-[#407DB2]">OS</span>
      </span>
    </div>
    <div className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
      <NavItem
        icon={<LayoutDashboard size={18} />}
        label="工作台"
        active={view === "dashboard"}
        onClick={() => {
          setView("dashboard");
          setActiveProjectId(null);
        }}
      />
      <NavItem
        icon={<CalendarIcon size={18} />}
        label="全局日程"
        active={view === "calendar"}
        onClick={() => {
          setView("calendar");
          setActiveProjectId(null);
        }}
      />
      <div className="mt-8 mb-3 px-3 text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
        <Layers size={12} /> 项目列表
      </div>
      {projects.map((p) => (
        <NavItem
          key={p.id}
          icon={<div className="w-2 h-2 rounded-full bg-[#407DB2]"></div>}
          label={p.name}
          active={view === "project" && activeProjectId === p.id}
          onClick={() => {
            setActiveProjectId(p.id);
            setView("project");
          }}
        />
      ))}
    </div>
    <div className="p-4 border-t border-gray-100">
      <button
        onClick={onLogout}
        className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors w-full px-2 py-2 rounded hover:bg-red-50 text-sm font-medium"
      >
        <LogOut size={16} /> 退出登录
      </button>
    </div>
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      active ? "bg-[#E5F4FF] text-[#407DB2]" : "text-gray-600 hover:bg-gray-50"
    }`}
  >
    {icon} <span className="truncate">{label}</span>
  </button>
);

const Dashboard = ({ projects, tasks, user, onOpenProject, refreshData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    projectId: null,
  });

  const getProgress = (projId) => {
    const projTasks = tasks.filter((t) => t.projectId === projId);
    if (projTasks.length === 0) return 0;
    return Math.round(
      (projTasks.filter((t) => t.status === "done").length / projTasks.length) *
        100
    );
  };

  const handleCreateProject = async (data) => {
    if (user.role !== "admin") return;
    if (typeof createClient === "undefined")
      return alert("请先按照代码里的指示，取消 import 注释以启用数据库！");
    await supabase.from("projects").insert([data]);
    setIsModalOpen(false);
    refreshData();
  };

  const confirmDelete = async () => {
    if (deleteModal.projectId && supabase !== mockClient) {
      await supabase.from("projects").delete().eq("id", deleteModal.projectId);
      setDeleteModal({ isOpen: false, projectId: null });
      refreshData();
    }
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f6f8f9]">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">工作台</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.name ? `欢迎回来，${user.name}` : "欢迎回来"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="搜索项目..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#407DB2] outline-none w-64 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {user.role === "admin" && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#407DB2] hover:bg-[#336591] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
            >
              <Plus size={16} /> 新建项目
            </button>
          )}
        </div>
      </header>
      <div className="p-8 overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const progress = getProgress(project.id);
            return (
              <div
                key={project.id}
                onClick={() => onOpenProject(project.id)}
                className="group bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-lg cursor-pointer transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#407DB2] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                    {project.name}
                  </h3>
                  {user.role === "admin" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteModal({ isOpen: true, projectId: project.id });
                      }}
                      className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all z-20"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-500">
                    <User size={14} className="mr-2" />
                    <span>{project.owner}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock size={14} className="mr-2" />
                    <span>
                      {project.startDate} - {project.endDate}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-500 mb-1">
                    <span>进度</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#00c875] h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredProjects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Search size={48} className="mb-4 opacity-20" />
              <p>没有找到相关项目</p>
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
        <ProjectModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateProject}
        />
      )}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, projectId: null })}
        onConfirm={confirmDelete}
        title="删除项目"
        message="您确定要删除这个项目吗？所有数据将永久丢失，且无法恢复。"
        isDangerous={true}
      />
    </div>
  );
};

const ProjectBoard = ({ project, tasks, user, refreshData }) => {
  const [boardView, setBoardView] = useState("list");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deleteTaskModal, setDeleteTaskModal] = useState({
    isOpen: false,
    taskId: null,
  });
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  const handleStatusChange = async (taskId, currentStatus) => {
    if (supabase === mockClient) return;
    await supabase
      .from("tasks")
      .update({ status: STATUS_CONFIG[currentStatus].next })
      .eq("id", taskId);
    refreshData();
  };
  const handleCreateTask = async (data) => {
    if (supabase === mockClient)
      return alert("预览模式无法创建任务，请部署并连接 Supabase。");
    await supabase
      .from("tasks")
      .insert([{ projectId: project.id, ...data, status: "pending" }]);
    setIsTaskModalOpen(false);
    refreshData();
  };
  const confirmDeleteTask = async () => {
    if (deleteTaskModal.taskId && supabase !== mockClient) {
      await supabase.from("tasks").delete().eq("id", deleteTaskModal.taskId);
      setDeleteTaskModal({ isOpen: false, taskId: null });
      refreshData();
    }
  };

  if (!project) return <div>项目不存在</div>;
  return (
    <div className="flex-1 flex flex-col h-full bg-white">
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              {project.name}
            </h2>
            <p className="text-gray-500 mt-1 text-sm max-w-2xl">
              {project.description || "无项目描述"}
            </p>
          </div>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-[#407DB2] hover:bg-[#336591] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
          >
            <Plus size={16} /> 新建任务
          </button>
        </div>
        <div className="flex items-center gap-1 border-b border-transparent">
          <button
            onClick={() => setBoardView("list")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              boardView === "list"
                ? "border-[#407DB2] text-[#407DB2] bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <LayoutList size={16} /> 主表格
          </button>
          <button
            onClick={() => setBoardView("kanban")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all flex items-center gap-2 ${
              boardView === "kanban"
                ? "border-[#407DB2] text-[#407DB2] bg-blue-50/50"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <KanbanIcon size={16} /> 看板
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-[#f6f8f9] p-6">
        {boardView === "list" ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col">
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3 border-r border-gray-100">
                      任务名称
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 border-r border-gray-100 text-center">
                      负责人
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40 border-r border-gray-100 text-center">
                      状态
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32 border-r border-gray-100 text-center">
                      截止日期
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24 border-r border-gray-100 text-center">
                      优先级
                    </th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-16 text-center">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sortedTasks.map((task) => (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="px-6 py-3 border-r border-gray-100">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-1 h-8 rounded-full ${
                              STATUS_CONFIG[task.status].color
                            }`}
                          ></div>
                          <span className="text-sm font-medium text-slate-700">
                            {task.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3 border-r border-gray-100 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-bold text-gray-600 border border-white shadow-sm">
                          {task.owner ? task.owner.charAt(0) : "?"}
                        </div>
                      </td>
                      <td className="px-1 py-1 border-r border-gray-100 p-2">
                        <button
                          onClick={() =>
                            handleStatusChange(task.id, task.status)
                          }
                          className={`w-full h-9 ${
                            STATUS_CONFIG[task.status].color
                          } text-white text-sm font-medium rounded shadow-sm hover:opacity-90 transition-all flex items-center justify-center relative overflow-hidden group/btn`}
                        >
                          <span className="group-hover/btn:-translate-y-8 transition-transform duration-300 block">
                            {STATUS_CONFIG[task.status].label}
                          </span>
                          <span className="absolute translate-y-8 group-hover/btn:translate-y-0 transition-transform duration-300 flex items-center justify-center w-full h-full bg-black/10">
                            <ChevronRight size={14} />
                          </span>
                        </button>
                      </td>
                      <td className="px-6 py-3 border-r border-gray-100 text-center text-sm text-gray-500">
                        {task.dueDate}
                      </td>
                      <td className="px-6 py-3 border-r border-gray-100 text-center">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            PRIORITY_CONFIG[task.priority]?.color ||
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {PRIORITY_CONFIG[task.priority]?.label || "无"}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        {user.role === "admin" && (
                          <button
                            onClick={() =>
                              setDeleteTaskModal({
                                isOpen: true,
                                taskId: task.id,
                              })
                            }
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <KanbanBoard
            tasks={sortedTasks}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
      {isTaskModalOpen && (
        <TaskModal
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
        />
      )}
      <ConfirmModal
        isOpen={deleteTaskModal.isOpen}
        onClose={() => setDeleteTaskModal({ isOpen: false, taskId: null })}
        onConfirm={confirmDeleteTask}
        title="删除任务"
        message="确认要永久删除此任务吗？"
        isDangerous={true}
      />
    </div>
  );
};

const KanbanBoard = ({ tasks, onStatusChange }) => {
  const columns = Object.keys(STATUS_CONFIG);
  const handleDragStart = (e, taskId) =>
    e.dataTransfer.setData("taskId", taskId);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e, status) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find((t) => t.id === taskId);
    if (task && task.status !== status) onStatusChange(taskId, status);
  }; // Simplified for adapter
  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((statusKey) => {
        const columnTasks = tasks.filter((t) => t.status === statusKey);
        return (
          <div
            key={statusKey}
            className="flex-shrink-0 w-80 flex flex-col h-full rounded-xl bg-gray-100/50 border border-gray-200/60"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, statusKey)}
          >
            <div
              className={`p-3 rounded-t-xl border-b border-gray-200/60 flex items-center justify-between ${
                statusKey === "done" ? "bg-green-50" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${STATUS_CONFIG[statusKey].color}`}
                ></span>
                <span className="font-semibold text-gray-700">
                  {STATUS_CONFIG[statusKey].label}
                </span>
              </div>
              <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-move hover:shadow-md transition-all active:scale-95"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        PRIORITY_CONFIG[task.priority].color
                      }`}
                    >
                      {PRIORITY_CONFIG[task.priority].label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {task.dueDate}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-slate-800 mb-3">
                    {task.name}
                  </h4>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs text-gray-500 border border-white shadow-sm">
                        {task.owner ? task.owner.charAt(0) : "?"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const CalendarView = ({ tasks }) => {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);
  const getTasksForDate = (day) => {
    const monthStr = (currentMonth + 1).toString().padStart(2, "0");
    const dayStr = day.toString().padStart(2, "0");
    return tasks.filter(
      (t) => t.dueDate === `${currentYear}-${monthStr}-${dayStr}`
    );
  };
  return (
    <div className="flex-1 flex flex-col h-full bg-[#f6f8f9] overflow-hidden">
      <div className="p-6 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="text-[#407DB2]" /> {currentYear}年{" "}
          {currentMonth + 1}月
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (currentMonth === 0) {
                setCurrentMonth(11);
                setCurrentYear(currentYear - 1);
              } else {
                setCurrentMonth(currentMonth - 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600"
          >
            上一月
          </button>
          <button
            onClick={() => {
              if (currentMonth === 11) {
                setCurrentMonth(0);
                setCurrentYear(currentYear + 1);
              } else {
                setCurrentMonth(currentMonth + 1);
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 text-gray-600"
          >
            下一月
          </button>
        </div>
      </div>
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-7 gap-4 mb-4">
          {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
            <div
              key={d}
              className="text-center font-semibold text-gray-500 text-sm"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-4 auto-rows-fr">
          {blanks.map((b) => (
            <div key={`blank-${b}`} className="min-h-[120px]"></div>
          ))}
          {days.map((day) => {
            const dailyTasks = getTasksForDate(day);
            const isToday =
              day === today.getDate() &&
              currentMonth === today.getMonth() &&
              currentYear === today.getFullYear();
            return (
              <div
                key={day}
                className={`bg-white rounded-lg p-3 min-h-[120px] shadow-sm border ${
                  isToday
                    ? "border-[#407DB2] ring-1 ring-[#407DB2]"
                    : "border-gray-200"
                }`}
              >
                <div className="text-right mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isToday
                        ? "bg-[#407DB2] text-white w-6 h-6 inline-flex items-center justify-center rounded-full"
                        : "text-gray-700"
                    }`}
                  >
                    {day}
                  </span>
                </div>
                <div className="space-y-1">
                  {dailyTasks.map((t) => (
                    <div
                      key={t.id}
                      className={`text-xs p-1.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 ${
                        STATUS_CONFIG[t.status].color
                      } bg-opacity-20 border-${STATUS_CONFIG[t.status].hex}`}
                    >
                      <span className="font-medium text-slate-700">
                        {t.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ProjectModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };
  return (
    <ModalBase title="新建项目" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            项目名称
          </label>
          <input
            required
            type="text"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            负责人
          </label>
          <input
            required
            type="text"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
            value={formData.owner}
            onChange={(e) =>
              setFormData({ ...formData, owner: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              开始日期
            </label>
            <input
              required
              type="date"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              结束日期
            </label>
            <input
              required
              type="date"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
            />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#407DB2] text-white px-6 py-2 rounded-lg hover:bg-[#336591] transition-colors font-medium"
          >
            创建项目
          </button>
        </div>
      </form>
    </ModalBase>
  );
};
const TaskModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    owner: "",
    priority: "medium",
    dueDate: "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    onSubmit(formData);
  };
  return (
    <ModalBase title="添加新任务" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            任务名称
          </label>
          <input
            required
            type="text"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              负责人
            </label>
            <input
              required
              type="text"
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
              value={formData.owner}
              onChange={(e) =>
                setFormData({ ...formData, owner: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              优先级
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2] bg-white"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            截止日期
          </label>
          <input
            required
            type="date"
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-[#407DB2]"
            value={formData.dueDate}
            onChange={(e) =>
              setFormData({ ...formData, dueDate: e.target.value })
            }
          />
        </div>
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className="bg-[#407DB2] text-white px-6 py-2 rounded-lg hover:bg-[#336591] transition-colors font-medium"
          >
            添加任务
          </button>
        </div>
      </form>
    </ModalBase>
  );
};
