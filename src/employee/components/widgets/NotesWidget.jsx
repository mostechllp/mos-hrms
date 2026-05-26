import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addNote, deleteNote } from '../../store/slices/notesSlice';

const NotesWidget = () => {
  const dispatch = useAppDispatch();
  const { notes } = useAppSelector((state) => state.notes);
  const [isOpen, setIsOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [position, setPosition] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const widgetRef = useRef(null);

  useEffect(() => {
    // Load saved position
    const savedPos = localStorage.getItem('notesWidgetPosition');
    if (savedPos) {
      const pos = JSON.parse(savedPos);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPosition(pos);
    } else {
      // Default position: bottom right, above task widget
      setPosition({ x: window.innerWidth - 350, y: window.innerHeight - 250 });
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
      localStorage.setItem('notesWidgetPosition', JSON.stringify(position));
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

  const handleAddNote = () => {
    if (newNote.trim()) {
      dispatch(addNote(newNote.trim()));
      setNewNote('');
    }
  };

  return (
    <>
      {/* Floating Icon */}
      <div
        onClick={() => setIsOpen(true)}
        className="floating-icon fixed w-14 h-14 rounded-full bg-[#EEAD16] shadow-lg flex items-center justify-center cursor-pointer z-1000 transition-transform active:scale-95"
        style={{ bottom: '30px', right: '20px' }}
      >
        <i className="fas fa-sticky-note text-white text-2xl"></i>
        {notes.length > 0 && (
          <span className="floating-badge absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[20px] text-center border-2 border-white">
            {notes.length}
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
            bottom: position.y === null ? '30px' : 'auto',
            top: position.y !== null ? `${position.y}px` : 'auto',
            width: '320px',
            maxWidth: 'calc(100vw - 32px)'
          }}
        >
          <div
            className="widget-header bg-gradient-to-r from-yellow-400 to-yellow-500 dark:from-yellow-500 dark:to-orange-500 text-gray-800 dark:text-white p-3.5 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
          >
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <i className="fas fa-sticky-note"></i> Sticky Notes
            </h3>
            <div className="widget-actions flex gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="bg-black/10 dark:bg-white/20 border-none text-gray-700 dark:text-white w-7 h-7 rounded-md text-xs cursor-pointer hover:bg-black/20 dark:hover:bg-white/30 transition-colors"
              >
                <i className="fas fa-compress"></i>
              </button>
            </div>
          </div>
          
          <div className="widget-content flex flex-col h-[300px] p-3">
            <ul className="notes-list list-none flex-1 overflow-y-auto pr-1">
              {notes.length === 0 ? (
                <li className="text-center text-gray-400 dark:text-gray-500 text-xs py-4">
                  No notes yet. Add one below!
                </li>
              ) : (
                notes.map((note, idx) => (
                  <li key={idx} className="note-item bg-yellow-50 dark:bg-gray-700 border-l-4 border-yellow-400 dark:border-yellow-500 rounded-lg p-3 mb-2.5 relative">
                    <div className="note-text text-sm text-gray-700 dark:text-gray-200 mb-2 pr-6">
                      {note.text}
                    </div>
                    <small className="note-date text-[10px] text-gray-400 dark:text-gray-500 block">
                      {note.date}
                    </small>
                    <button
                      onClick={() => dispatch(deleteNote(idx))}
                      className="note-delete absolute top-2 right-2 bg-none border-none text-red-400 dark:text-red-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </li>
                ))
              )}
            </ul>
            
            <div className="add-note-form flex flex-col gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows="2"
                placeholder="Write a note..."
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 font-poppins text-sm text-gray-700 dark:text-gray-200 resize-y outline-none focus:border-yellow-400 dark:focus:border-yellow-500 focus:ring-1 focus:ring-yellow-400 dark:focus:ring-yellow-500"
              />
              <button
                onClick={handleAddNote}
                className="bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-500 dark:hover:bg-yellow-600 border-none rounded-lg py-2 font-semibold cursor-pointer text-white transition-colors"
              >
                <i className="fas fa-save"></i> Add Note
              </button>
            </div>
          </div>
          
          <div className="widget-footer p-2.5 border-t border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700">
            <span>{notes.length}</span> notes
          </div>
        </div>
      )}
    </>
  );
};

export default NotesWidget;