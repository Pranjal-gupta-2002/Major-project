import "./TimeTable.css"
import React, { useState, useCallback, useEffect } from 'react';
const TimeTable = () => {
  const [teachers] = useState(['Mr. Smith', 'Ms. Johnson', 'Dr. Brown', 'Mr Ahirwar', 'Mr Santosh']);
  const [subjects] = useState(['Math', 'Science', 'English', 'History', 'DSA']);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const periods = [1, 2, 3, 4, 5];
  const [schedule, setSchedule] = useState({});
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [activeCell, setActiveCell] = useState(null);

  const handleTeacherChange = useCallback((teacher) => {
    setSelectedTeachers(prev =>
      prev.includes(teacher)
        ? prev.filter(t => t !== teacher)
        : [...prev, teacher]
    );
  }, []);

  const handleSubjectChange = useCallback((subject) => {
    setSelectedSubjects(prev =>
      prev.includes(subject)
        ? prev.filter(s => s !== subject)
        : [...prev, subject]
    );
  }, []);

  const sendDataToBackend = useCallback(async () => {
    if (!selectedClass || !selectedSection) {
      setError('Please select a class and section before creating a timetable.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSchedule = {};
      days.forEach(day => {
        mockSchedule[day] = periods.map(() => ({
          teacher: teachers[Math.floor(Math.random() * teachers.length)],
          subject: subjects[Math.floor(Math.random() * subjects.length)]
        }));
      });

      setSchedule(mockSchedule);
    } catch (error) {
      console.error('Error in sendDataToBackend:', error);
      setError(`Failed to load timetable: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTeachers, selectedSubjects, selectedClass, selectedSection, teachers, subjects]);

  const renderSchedule = useCallback(() => {
    if (!schedule || Object.keys(schedule).length === 0) {
      return <p className="no-schedule">No schedule data available. Please create a timetable.</p>;
    }
  
    return (
      <div className="schedule-grid">
        {days.map((day, index) => (
          <div key={day} className={`day-column ${index % 2 === 0 ? 'light' : 'dark'}`}>
            <div className="day-header">{day}</div>
            {periods.map((period) => (
              <div
                key={`${day}-${period}`}
                className={`schedule-cell ${activeCell === `${day}-${period}` ? 'active' : ''}`}
                onClick={() => setActiveCell(`${day}-${period}`)}
              >
                {schedule[day] && schedule[day][period - 1] ? (
                  <>
                    <div className="period-number">{period}</div>
                    <div className="teacher">{schedule[day][period - 1].teacher}</div>
                    <div className="subject">{schedule[day][period - 1].subject}</div>
                  </>
                ) : (
                  <div className="no-class">No class</div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }, [schedule, days, periods, activeCell]);

  return (
    <div className="timetable-container">
      <div className="header">
        <h1>Interactive Timetable</h1>
        <div className="controls">
          <select 
            value={selectedClass} 
            onChange={(e) => setSelectedClass(e.target.value)}
            className="select-input"
          >
            <option value="">Select Class</option>
            <option value="class1">Class 1</option>
            <option value="class2">Class 2</option>
            <option value="class3">Class 3</option>
          </select>
          <select 
            value={selectedSection} 
            onChange={(e) => setSelectedSection(e.target.value)}
            className="select-input"
          >
            <option value="">Select Section</option>
            <option value="sectionA">Section A</option>
            <option value="sectionB">Section B</option>
            <option value="sectionC">Section C</option>
          </select>
          <button className="create-button" onClick={sendDataToBackend} disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Create Timetable'}
          </button>
          <button className="sidebar-toggle" onClick={() => setShowSidebar(!showSidebar)}>
            {showSidebar ? '◀' : '▶'}
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="schedule-container">
          {isLoading && (
            <div className="loading-overlay">
              <div className="loader"></div>
              <p>Generating your timetable...</p>
            </div>
          )}
          {error && <div className="error">{error}</div>}
          {!isLoading && !error && renderSchedule()}
        </div>

        <div className={`sidebar ${showSidebar ? 'show' : 'hide'}`}>
          <div className="list-container light">
            <h3>Teachers</h3>
            <div className="list">
              {teachers.map((teacher) => (
                <label key={teacher} className="list-item">
                  <input
                    type="checkbox"
                    checked={selectedTeachers.includes(teacher)}
                    onChange={() => handleTeacherChange(teacher)}
                  />
                  <span>{teacher}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="list-container dark">
            <h3>Subjects</h3>
            <div className="list">
              {subjects.map((subject) => (
                <label key={subject} className="list-item">
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(subject)}
                    onChange={() => handleSubjectChange(subject)}
                  />
                  <span>{subject}</span>
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