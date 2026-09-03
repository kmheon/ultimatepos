import React, { useState } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Bell, 
  Plus, 
  Search, 
  Trash2, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Circle,
  X,
  FileCheck
} from 'lucide-react';

interface TodoTask {
  id: string;
  title: string;
  assignedTo: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  status: 'pending' | 'completed';
}

interface DocNote {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: string;
}

interface Reminder {
  id: string;
  title: string;
  date: string;
  time: string;
  forCustomer?: string;
  status: 'pending' | 'done';
}

export const EssentialsView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'todo' | 'docs' | 'reminders'>('todo');

  const [tasks, setTasks] = useState<TodoTask[]>([
    { id: '1', title: 'Verify month-end inventory physical count with audit checklist', assignedTo: 'Marcus Vance', priority: 'high', dueDate: '2026-09-05', status: 'pending' },
    { id: '2', title: 'Contact supplier for OLED replacement screens batch delivery', assignedTo: 'Alex Rivera', priority: 'urgent', dueDate: '2026-09-02', status: 'pending' },
    { id: '3', title: 'Update retail price tags for seasonal back-to-school accessories', assignedTo: 'Sarah Jenkins', priority: 'medium', dueDate: '2026-09-04', status: 'completed' },
  ]);

  const [notes, setNotes] = useState<DocNote[]>([
    { id: '1', title: 'POS Shift Opening & Closing Standard Operating Procedure', category: 'Operations SOP', content: 'Always count cash drawer float twice before opening register. Close batch at 8:00 PM and deposit envelope in safe.', createdAt: '2026-08-15' },
    { id: '2', title: 'Apple Certified Technician Warranty Protocol', category: 'Workshop Policy', content: 'Ensure all screen replacements include true-tone serial programmer transfer before sealing waterproof adhesive gasket.', createdAt: '2026-08-20' },
  ]);

  const [reminders, setReminders] = useState<Reminder[]>([
    { id: '1', title: 'Follow-up with John Smith regarding MacBook logic board repair estimate', date: '2026-09-02', time: '11:00 AM', forCustomer: 'John Smith', status: 'pending' },
    { id: '2', title: 'Process GST/VAT monthly invoice report submission', date: '2026-09-07', time: '04:00 PM', status: 'pending' },
  ]);

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Sarah Jenkins');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [newTaskDue, setNewTaskDue] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const taskObj: TodoTask = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      assignedTo: newTaskAssignee,
      priority: newTaskPriority,
      dueDate: newTaskDue || '2026-09-10',
      status: 'pending',
    };
    setTasks([taskObj, ...tasks]);
    setIsAddTaskOpen(false);
    setNewTaskTitle('');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            Essentials & Workflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Internal task management, operational document notes, and customer follow-up reminders.
          </p>
        </div>

        {activeSubTab === 'todo' && (
          <button
            onClick={() => setIsAddTaskOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('todo')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'todo' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>To Do Tasks ({tasks.filter(t => t.status === 'pending').length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('docs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'docs' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Documents & Notes</span>
        </button>

        <button
          onClick={() => setActiveSubTab('reminders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeSubTab === 'reminders' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Reminders & Alerts</span>
        </button>
      </div>

      {/* To Do Tab */}
      {activeSubTab === 'todo' && (
        <div className="space-y-3">
          {tasks.map(t => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl bg-white border transition-all flex items-center justify-between gap-4 ${
                t.status === 'completed' ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTasks(tasks.map(item => item.id === t.id ? { ...item, status: item.status === 'completed' ? 'pending' : 'completed' } : item))}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {t.status === 'completed' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-slate-400" />}
                </button>
                <div>
                  <div className={`text-xs sm:text-sm font-bold ${t.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                    {t.title}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 mt-1">
                    <span>Assignee: <strong className="text-slate-700">{t.assignedTo}</strong></span>
                    <span>Due: {t.dueDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                  t.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : t.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {t.priority}
                </span>
                <button
                  onClick={() => setTasks(tasks.filter(item => item.id !== t.id))}
                  className="p-1 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Docs & Notes Tab */}
      {activeSubTab === 'docs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map(n => (
            <div key={n.id} className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px]">
                  {n.category}
                </span>
                <span className="text-[11px] text-slate-400">{n.createdAt}</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900">{n.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{n.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Reminders Tab */}
      {activeSubTab === 'reminders' && (
        <div className="space-y-3">
          {reminders.map(r => (
            <div key={r.id} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">{r.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {r.date} at {r.time} {r.forCustomer && `• Customer: ${r.forCustomer}`}
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-bold rounded-full">
                Scheduled
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add Task Modal */}
      {isAddTaskOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add New Task</h3>
              <button onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Call supplier regarding PO-991"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assignee</label>
                  <select
                    value={newTaskAssignee}
                    onChange={e => setNewTaskAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="Sarah Jenkins">Sarah Jenkins</option>
                    <option value="Marcus Vance">Marcus Vance</option>
                    <option value="Alex Rivera">Alex Rivera</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDue}
                  onChange={e => setNewTaskDue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
