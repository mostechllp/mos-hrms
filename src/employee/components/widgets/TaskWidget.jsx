import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addTask, toggleTask, deleteTask, clearCompletedTasks } from '../../store/slices/tasksSlice';

const TaskWidget = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.tasks);
  const [isOpen, setIsOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  const pendingCount = tasks.filter(t => !t.completed).length;

  useEffect(() => {
    // Load saved position
    const savedPos = localStorage.getItem('taskWidgetPosition');
    if (savedPos) {
      const pos = JSON.parse(savedPos);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(pos);
    } else {
      // Default position: bottom right
      setPosition({ x: window.innerWidth - 350, y: window.innerHeight - 400 });
    }
  }, []);

  const handleMouseDown = (e) => {
    if (e.target.closest('.widget-actions')) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (position.x || 0),
      y: e.clientY - (position.y || 0)
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Constrain to viewport
    const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 320);
    const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 400);
    
    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      localStorage.setItem('taskWidgetPosition', JSON.stringify(position));
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position]);

  const handleAddTask = () => {
    if (newTask.trim()) {
      dispatch(addTask(newTask.trim()));
      setNewTask('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  };

  return (
    <>
      {/* Floating Icon */}
      <div
        onClick={() => setIsOpen(true)}
        className="floating-icon fixed w-14 h-14 rounded-full bg-[#9753B3] shadow-lg flex items-center justify-center cursor-pointer z-1000 transition-transform active:scale-95"
        style={{ bottom: '100px', right: '20px' }}
      >
        <i className="fas fa-list-check text-white text-2xl"></i>
        {pendingCount > 0 && (
          <span className="floating-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-[var(--surface)]">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Widget Panel */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="widget-panel fixed bg-[#9753B3] rounded-xl shadow-lg border border-[var(--border)] z-1001 flex flex-col overflow-hidden"
          style={{
            left: position.x !== null ? `${position.x}px` : 'auto',
            right: position.x === null ? '90px' : 'auto',
            bottom: position.y === null ? '100px' : 'auto',
            top: position.y !== null ? `${position.y}px` : 'auto',
            width: '320px',
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          <div
            className="widget-header bg-gradient-to-r from-purple-600 to-purple-700 text-white p-3.5 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-list-check"></i> Task Manager
            </h3>
            <div className="widget-actions flex gap-2">
              <button
                onClick={() => dispatch(clearCompletedTasks())}
                className="bg-white/20 border-none text-white w-7 h-7 rounded-md text-xs cursor-pointer hover:bg-white/30"
                title="Clear completed tasks"
              >
                <i className="fas fa-check-double"></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-white/20 border-none text-white w-7 h-7 rounded-md text-xs cursor-pointer hover:bg-white/30"
              >
                <i className="fas fa-compress"></i>
              </button>
            </div>
          </div>
          
          <div className="widget-content flex flex-col h-[300px]">
            <ul className="task-list list-none flex-1 overflow-y-auto pr-1">
              {tasks.length === 0 ? (
                <li className="text-center text-[var(--muted)] text-xs py-4">
                  No tasks yet. Add one below!
                </li>
              ) : (
                tasks.map((task, idx) => (
                  <li key={idx} className="task-item bg-[var(--surface2)] border border-[var(--border)] rounded-lg p-2.5 mb-2 flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => dispatch(toggleTask(idx))}
                      className="w-4 h-4 cursor-pointer accent-green-500"
                    />
                    <span className={`task-text flex-1 text-xs text-[var(--text)] ${task.completed ? 'line-through text-[var(--muted)]' : ''}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => dispatch(deleteTask(idx))}
                      className="task-delete bg-none border-none text-red-500 cursor-pointer hover:text-red-600"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <div className="add-task-form flex gap-2 mt-2 pt-2 border-t border-[var(--border)]">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 bg-[var(--surface2)] border border-[var(--border)] rounded-lg px-3 py-2 text-xs outline-none focus:border-green-500 text-[var(--text)]"
              />
              <button
                onClick={handleAddTask}
                className="bg-green-500 border-none rounded-lg px-4 text-white cursor-pointer hover:bg-green-600"
              >
                <i className="fas fa-plus"></i>
              </button>
            </div>
          </div>
          
          <div className="widget-footer p-2.5 border-t border-[var(--border)] text-[10px] text-[var(--muted)] text-center bg-[var(--surface2)]">
            <span id="taskCount">{pendingCount}</span> tasks pending
          </div>
        </div>
      )}
    </>
  );
};

export default TaskWidget;