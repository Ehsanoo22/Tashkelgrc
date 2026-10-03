import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CalendarClock, LogIn, LogOut, Loader2, Search } from 'lucide-react';

export default function AttendanceManager() {
  const [logs, setLogs] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]); // Default to today
  
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [dateFilter]);

  const fetchData = async () => {
    setLoading(true);
    // Fetch logs for the selected date
    const { data: attendanceData } = await supabase
      .from('erp_attendance')
      .select('*, erp_employees(first_name, last_name, role_id, erp_roles(name))')
      .eq('date', dateFilter)
      .order('check_in_time', { ascending: false });
      
    if (attendanceData) setLogs(attendanceData);

    // Fetch active employees for the manual clock-in dropdown
    const { data: empData } = await supabase
      .from('erp_employees')
      .select('id, first_name, last_name')
      .eq('is_active', true)
      .order('first_name');
      
    if (empData) setEmployees(empData);
    setLoading(false);
  };

  const handleManualClockIn = async () => {
    if (!selectedEmployeeId) return alert('Select an employee');
    setIsSubmitting(true);
    try {
      await supabase.from('erp_attendance').insert([{
        employee_id: selectedEmployeeId,
        date: dateFilter,
        check_in_time: new Date().toISOString()
      }]);
      setSelectedEmployeeId('');
      fetchData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClockOut = async (logId) => {
    try {
      await supabase.from('erp_attendance').update({
        check_out_time: new Date().toISOString()
      }).eq('id', logId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const calculateHours = (checkIn, checkOut) => {
    if (!checkOut) return 'Active';
    const diffMs = new Date(checkOut) - new Date(checkIn);
    const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(1);
    return `${diffHrs} hrs`;
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-dark flex items-center gap-3">
            <CalendarClock className="text-brand-warm" /> Attendance Logs
          </h1>
          <p className="text-stone-500 mt-2">Track factory and office team check-ins.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-stone-200">
          <input 
            type="date" 
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-stone-600 font-bold px-4"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-8 flex items-end gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-stone-700 mb-2">Manual Clock-In</label>
          <select 
            value={selectedEmployeeId} 
            onChange={e => setSelectedEmployeeId(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 focus:ring-2 focus:ring-brand-warm outline-none"
          >
            <option value="">Select Employee...</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleManualClockIn}
          disabled={!selectedEmployeeId || isSubmitting}
          className="bg-brand-dark text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-800 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />} Clock In
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-brand-warm" />
            Loading attendance records...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-xs font-bold text-stone-500 uppercase">Employee</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase">Role</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase">Time In</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase">Time Out</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase">Total Hours</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-stone-500">No attendance records for {dateFilter}.</td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-brand-dark">
                        {log.erp_employees?.first_name} {log.erp_employees?.last_name}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-stone-600">
                      {log.erp_employees?.erp_roles?.name || 'Unassigned'}
                    </td>
                    <td className="p-4 font-mono text-sm text-green-700 bg-green-50/50 rounded">
                      {formatTime(log.check_in_time)}
                    </td>
                    <td className="p-4 font-mono text-sm text-red-700 bg-red-50/50 rounded">
                      {formatTime(log.check_out_time)}
                    </td>
                    <td className="p-4 font-bold text-stone-700">
                      {calculateHours(log.check_in_time, log.check_out_time)}
                    </td>
                    <td className="p-4 text-right">
                      {!log.check_out_time && (
                        <button 
                          onClick={() => handleClockOut(log.id)}
                          className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-stone-300 transition-colors flex items-center gap-2 ml-auto"
                        >
                          <LogOut size={14} /> Clock Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
