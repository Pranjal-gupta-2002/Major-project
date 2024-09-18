import React, { useState, useEffect } from 'react';
import './TimeTable.css';

const TimeTable = () => {
  const [teachers] = useState(['Mr. Smith', 'Ms. Johnson', 'Dr. Brown','Mr Ahirwar Mardchod','Mr Santosh Bhenchod']);
  const [subjects] = useState(['Math', 'Science', 'English', 'History','DSA']);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5];
  const [schedule, setSchedule] = useState({});
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTeacherChange = (teacher) => {
    setSelectedTeachers(prev =>
      prev.includes(teacher)
        ? prev.filter(t => t !== teacher)
        : [...prev, teacher]
    );
  };

  const handleSubjectChange = (subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  };

  const sendDataToBackend = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Sending data to backend:', { selectedTeachers, selectedSubjects });
      const response = await fetch('http://localhost:3001/createtimetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedTeachers,
          selectedSubjects
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Raw data received from backend:', result);
      
      if (typeof result !== 'object' || result === null) {
        throw new Error('Invalid data received from backend');
      }

      setSchedule(result.timetable);
      console.log('Schedule state updated:', result);
    } catch (error) {
      console.error('Error in sendDataToBackend:', error);
      setError(`Failed to load timetable: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Schedule state in effect:', schedule);
  }, [schedule]);

  const renderSchedule = () => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return <p>No schedule data available. Please create a timetable.</p>;
    }
  
    console.log('Rendering schedule:', schedule);
    return (
      <table>
        <thead>
          <tr>
            <th>Period</th>
            {days.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {periods.map((period) => (
            <tr key={period}>
              <td>{period}</td>
              {days.map((day) => (
                <td key={`${day}-${period}`} className="schedule-cell">
                  {/* Check if schedule[day] exists and schedule[day][period - 1] is valid */}
                  {schedule[day] && schedule[day][period - 1] ? (
                    <>
                      <div className="schedule-item teacher">
                        {schedule[day][period - 1].teacher}
                      </div>
                      <div className="schedule-item subject">
                        {schedule[day][period - 1].subject}
                      </div>
                    </>
                  ) : (
                    <div>No class</div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };
  

  return (
    <div className="class-schedule">
      <div className="header">
        <div className="selects">
          <select>
            <option>Class</option>
          </select>
          <select>
            <option>Section</option>
          </select>
        </div>
        <button className="create-button" onClick={sendDataToBackend} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Create Time Table'}
        </button>
      </div>

      <div className="main-content">
        <div className="schedule-table">
          {isLoading && <p>Loading timetable...</p>}
          {error && <p className="error">{error}</p>}
          {!isLoading && !error && Object.keys(schedule).length > 0 && renderSchedule()}
          {!isLoading && !error && Object.keys(schedule).length === 0 && <p>No schedule data available. Please create a timetable.</p>}
        </div>

        <div className="sidebar">
          <div className="list-container">
            <h3>Teachers</h3>
            <div className="list">
              {teachers.map((teacher) => (
                <label key={teacher} className="list-item">
                  <input
                    type="checkbox"
                    value={teacher}
                    checked={selectedTeachers.includes(teacher)}
                    onChange={() => handleTeacherChange(teacher)}
                  />
                  {teacher}
                </label>
              ))}
            </div>
          </div>
          <div className="list-container">
            <h3>Subjects</h3>
            <div className="list">
              {subjects.map((subject) => (
                <label key={subject} className="list-item">
                  <input
                    type="checkbox"
                    value={subject}
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                  />
                  {subject}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeTable;