import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addTask, toggleTask, deleteTask, clearCompletedTasks } from '../../store/slices/myTasksSlice';

const TaskWidget = () => {
  const dispatch = useAppDispatch();
  const { tasks } = useAppSelector((state) => state.myTasks);
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
          <span className="floating-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white">
            {pendingCount}
          </span>
        )}
      </div>

      {/* Widget Panel */}
      {isOpen && (
        <div
          ref={widgetRef}
          className="widget-panel fixed bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-1001 flex flex-col overflow-hidden"
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
            className="widget-header bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-600 dark:to-purple-700 text-gray-800 dark:text-white p-3.5 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-list-check"></i> Task Manager
            </h3>
            <div className="widget-actions flex gap-2">
              <button
                onClick={() => dispatch(clearCompletedTasks())}
                className="bg-black/10 hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30 border-none text-gray-700 dark:text-white w-7 h-7 rounded-md text-xs cursor-pointer transition-colors"
                title="Clear completed tasks"
              >
                <i className="fas fa-check-double"></i>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="bg-black/10 hover:bg-black/20 dark:bg-white/20 dark:hover:bg-white/30 border-none text-gray-700 dark:text-white w-7 h-7 rounded-md text-xs cursor-pointer transition-colors"
              >
                <i className="fas fa-compress"></i>
              </button>
            </div>
          </div>
          
          <div className="widget-content flex flex-col h-[300px] p-3">
            <ul className="task-list list-none flex-1 overflow-y-auto pr-1 custom-scrollbar">
              {tasks.length === 0 ? (
                <li className="text-center text-gray-400 dark:text-gray-500 text-xs py-4">
                  No tasks yet. Add one below!
                </li>
              ) : (
                tasks.map((task, idx) => (
                  <li key={idx} className="task-item bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 mb-2 flex items-center gap-2.5 hover:shadow-sm transition-shadow">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => dispatch(toggleTask(idx))}
                      className="w-4 h-4 cursor-pointer accent-purple-500 dark:accent-purple-400"
                    />
                    <span className={`task-text flex-1 text-sm text-gray-700 dark:text-gray-200 ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                      {task.text}
                    </span>
                    <button
                      onClick={() => dispatch(deleteTask(idx))}
                      className="task-delete bg-none border-none text-red-400 dark:text-red-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <div className="add-task-form flex gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a new task..."
                className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-purple-400 dark:focus:border-purple-500 focus:ring-1 focus:ring-purple-400 dark:focus:ring-purple-500 transition-all"
              />
              <button
                onClick={handleAddTask}
                className="bg-purple-500 hover:bg-purple-600 dark:bg-purple-600 dark:hover:bg-purple-700 border-none rounded-lg px-4 text-white cursor-pointer transition-colors flex items-center gap-1"
              >
                <i className="fas fa-plus text-xs"></i>
                <span className="hidden sm:inline text-sm">Add</span>
              </button>
            </div>
          </div>
          
          <div className="widget-footer p-2.5 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700">
            <span id="taskCount">{pendingCount}</span> tasks pending
          </div>
        </div>
      )}
    </>
  );
};

export default TaskWidget;