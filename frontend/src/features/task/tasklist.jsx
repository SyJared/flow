import { useEffect, useState } from "react";
import { handleStatusDoing, taskMarkAsDone } from "../../api/handleStatusChange";
import { taskUpdates } from "../../api/taskUpdates";
import { getTaskUpdates } from "../../api/getTask";
import { useLocation } from "react-router-dom";

function TaskModal({ isOpen, setIsOpen, selectedTask, user , workspaceId, setSelectedTask}) {
  const [updates, setUpdates] = useState([]);
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [doingMessage, setDoingMessage]= useState('');

  const [submitMessage, setSubmitMessage]= useState('');

  const [doneMessage, setDoneMessage] = useState('')
  const [taskUpdateId, setTaskUpdateId] = useState();
  


  

  function formatHoursSpent(decimalHours) {
  if (!decimalHours && decimalHours !== 0) return "0m";

  const totalMinutes = Math.round(decimalHours * 60);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;

  return `${hours}h ${minutes}m`;
}  

  if (!isOpen || !selectedTask) return null;

  

  useEffect(()=>{ 
    const loadUpdates= async()=>{
      try {
      const data = await getTaskUpdates({workspaceId, taskId:selectedTask.id})
      setUpdates(data.results || []);
      setTaskUpdateId(data.results.id)
    } catch (err) {
      console.log(err, "useeffecterror")
    }
    }
    loadUpdates();
  },[selectedTask])

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const res = await taskUpdates({id: user, status: 'doing', workspaceId, taskId: selectedTask.id, message, progress})
      if (res.update) {
        setUpdates((prev) => [res.update, ...prev]);
      }
      setSubmitMessage(res.message);
      
    }catch(err){
      console.log(err, 'from handlesubmit')
    }
    
    setMessage("");
    setProgress(0);
  };
  const handleStatusChange = async()=>{
    
    try{
      const data = await handleStatusDoing({id: user, status: 'doing', workspaceId, taskId: selectedTask.id})
      if(data.length===0){
        setUpdates(prev => [
      { message, progress, created_at: new Date() },
      ...prev
    ]);
    setSelectedTask(prev => ({
      ...prev,
      status: 'doing'
    }));
      }
      setDoingMessage(data.message)
    }catch(err){
      console.log(err.message + 'handlestatuschange error')
    }
  }

  const handleDone = async () => {
  try {
    const res = await taskMarkAsDone({
      taskId: selectedTask.id,
      workspaceId,
      status: 'done'
    });

    if (res.update) {
      setUpdates((prev) => [res.update, ...prev]);
      setSelectedTask(prev => ({
      ...prev,
      status: 'done'
    }));
    }

    setDoneMessage(res.message);
  } catch (error) {
    console.log(error, "from handleDone");
  }
};

  return (
    <div className="fixed inset-0 z-50 flex">

      {/* Overlay */}
      <div
        onClick={() => setIsOpen(false)}
        className="flex-1 bg-black/40"
      />

      {/* Drawer */}
      <div className="w-[380px] bg-white h-full shadow-xl p-5 flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {selectedTask.title}
          </h2>
          <button onClick={() => setIsOpen(false)}>✕</button>
        </div>

        {/* Task Info */}
        <div className="space-y-2 text-sm mb-4">
          <p>{selectedTask.description}</p>
          <p><strong>Status:</strong> {selectedTask.status}</p>
        </div>

        {/* Updates List */}
        <div className="flex-1 overflow-y-auto mb-4">
          <h3 className="text-sm font-semibold mb-2">Updates</h3>

          {updates.length === 0 ? (
            <p className="text-xs text-gray-500">No updates yet</p>
          ) : (
            updates.map((u, i) => (
              <div key={i} className="border rounded-lg p-2 mb-2">
                <p className="text-xs">{u.message}</p>
                <p className="text-[10px] text-gray-500">
                  {u.progress}% • {new Date(u.created_at).toLocaleTimeString()}
                </p>
                <p> Time spent: {formatHoursSpent(u.hours_spent)}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Update Form */}
        {selectedTask.status === 'todo' && (
          <div className="mb-3">
            <button
              onClick={() => handleStatusChange('doing')}
              className="w-full bg-amber-100 text-amber-900 text-sm py-2 rounded hover:bg-amber-200"
            >
              Start Task (Set to Doing)
            </button>
            {doingMessage && (<p>{doingMessage}</p>)}
          </div>
        )}

        {selectedTask.status === 'doing' && (
          <form onSubmit={handleSubmit} className="border-t pt-3">
          <textarea
            placeholder={
              selectedTask.status === 'todo'
                ? "Start the task first or leave a note..."
                : "Write update..."
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded p-2 text-sm mb-2"
          />

          <div className="mb-2 text-sm">
            <label className="mr-2">Set status:</label>

          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full mb-2"
          />
 {submitMessage && (<p>{submitMessage}</p>)}
          <button className="w-full bg-gray-900 text-white py-2 rounded">
            Add Update
          </button>
         
        </form>
        )}
            {selectedTask.status !== 'done' && (
              <>
              <button onClick={()=>handleDone()}>mark as done</button>
            {doneMessage && (<p>{doneMessage}</p>)}
            </>
            )}
      </div>
    </div>
  );
}

function TaskList({tasks, tasksMessage, user, workspaceId}){
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.openTask) {
      setSelectedTask(location.state.openTask);
      setIsOpen(true);
    }
  }, [location.state]);
  const selected =(task)=>{
    setSelectedTask(task);
    setIsOpen(true)
  }
    
  return(
    <>
    <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" >
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-gray-900 text-base font-semibold">Tasks</h2>
            <span className="bg-gray-900 text-amber-100 text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full">
              {tasks && tasks.length || '0'}
            </span>
          </div>
          <div className="p-4">
            {tasksMessage && <p className="mb-3 text-xs text-gray-800 bg-amber-100/30 border border-amber-200 rounded-lg px-3 py-2">{tasksMessage}</p>}
            {tasks.length > 0 ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {tasks.map((task) => (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all" onClick={() => selected(task)}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-gray-900 font-semibold text-sm leading-snug">{task.title}</h3>
                      <div className="flex flex-col gap-1 items-end flex-shrink-0">
                        <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${task.priority === 'high' ? 'bg-red-100 text-red-800' : task.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-800">
                          {task.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 leading-relaxed">{task.description}</p>
              
                    <hr className="border-gray-200 mb-3" />
                    <div className="flex flex-wrap gap-4">
                      {[
                        { label: 'Assigned To', value: task.assigned_to },
                        { label: 'Assigned By', value: task.assigned_by },
                        { label: 'Created By', value: task.created_by },
                        { label: 'Due Date', value: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
                        { label: 'Created', value: new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</span>
                          <span className="text-xs font-medium text-gray-800">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-gray-500 italic py-10">No tasks yet. Create one above.</p>
            )}
          </div>
        </div>
        {isOpen && <TaskModal isOpen={isOpen} selectedTask={selectedTask} setIsOpen={setIsOpen} user={user} workspaceId={workspaceId} setSelectedTask={setSelectedTask} />}
        </>
  )
}
export default TaskList