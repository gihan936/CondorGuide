import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Search, CheckCircle, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const wings = ['A', 'B', 'C', 'D', 'E', 'F'];

const AvailableClassrooms = () => {
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedWing, setSelectedWing] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Date picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Time picker states
  const [showFromTimePicker, setShowFromTimePicker] = useState(false);
  const [showToTimePicker, setShowToTimePicker] = useState(false);

  // Time options (8 AM to 10 PM, hourly)
  const timeOptions = [
    { value: '08:00', label: '8:00 AM' },
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' },
    { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
    { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' },
    { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
    { value: '21:00', label: '9:00 PM' },
    { value: '22:00', label: '10:00 PM' },
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month's trailing days
    for (let i = startingDay - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({ date: currentDate, isCurrentMonth: true });
    }
    
    // Next month's leading days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({ date: nextDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTimeDisplay = (timeString) => {
    if (!timeString) return 'Select Time';
    const option = timeOptions.find(opt => opt.value === timeString);
    return option ? option.label : timeString;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateSelect = (selectedDate) => {
    if (!isDateDisabled(selectedDate)) {
      setDate(formatDate(selectedDate));
      setShowDatePicker(false);
    }
  };

  const handleTimeSelect = (timeValue, isFromTime) => {
    if (isFromTime) {
      setFrom(timeValue);
      setShowFromTimePicker(false);
    } else {
      setTo(timeValue);
      setShowToTimePicker(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleWingClick = async (wing) => {
    setSelectedWing(wing);
    setMessage('');

    if (!date || !from || !to) {
      setMessage('Please select date and time range.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('${import.meta.env.VITE_API_BASE_URL}/api/classrooms/available', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, from, to, wing })
      });
      
      const data = await response.json();
      
      setAvailableRooms(data);
      setLoading(false);
      
      if (data.length === 0) {
        setMessage(`No available rooms found in ${wing} Wing at that time.`);
      }
    } catch (err) {
      console.error(err);
      setMessage('Error fetching availability.');
      setLoading(false);
    }
  };

  return (
    <div>
      <section className="classroom-section">
        <div className="classroom-overlay"></div>
        
        <div className="classroom-container">
          <div className="classroom-header">
            <h1 className="classroom-title">
              Classroom Availability
            </h1>
            <p className="classroom-subtitle">
              Find the perfect space for your next session
            </p>
          </div>

          <div className="classroom-form-card">
            <div className="classroom-form-row">
              {/* Custom Date Picker */}
              <div className="classroom-form-group">
                <label className="classroom-label">
                  <Calendar size={16} />
                  Select Date
                </label>
                <button
                  className={`classroom-input-button ${showDatePicker ? 'active' : ''}`}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                >
                  <span>{formatDateDisplay(date)}</span>
                  <Calendar size={16} />
                </button>
                {showDatePicker && (
                  <div className="custom-picker">
                    <div className="date-picker">
                      <div className="date-picker-header">
                        <button 
                          className="month-nav-button"
                          onClick={() => navigateMonth(-1)}
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <span className="month-year-display">
                          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button 
                          className="month-nav-button"
                          onClick={() => navigateMonth(1)}
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                      <div className="calendar-grid">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                          <div key={day} className="day-header">{day}</div>
                        ))}
                        {getDaysInMonth(currentMonth).map((dayObj, index) => {
                          const isToday = dayObj.date.toDateString() === new Date().toDateString();
                          const isSelected = date === formatDate(dayObj.date);
                          const isDisabled = isDateDisabled(dayObj.date);
                          
                          return (
                            <div
                              key={index}
                              className={`day-cell ${dayObj.isCurrentMonth ? 'current-month' : 'other-month'} ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                              onClick={() => handleDateSelect(dayObj.date)}
                            >
                              {dayObj.date.getDate()}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Custom From Time Picker */}
              <div className="classroom-form-group">
                <label className="classroom-label">
                  <Clock size={16} />
                  From Time
                </label>
                <button
                  className={`classroom-input-button ${showFromTimePicker ? 'active' : ''}`}
                  onClick={() => setShowFromTimePicker(!showFromTimePicker)}
                >
                  <span>{formatTimeDisplay(from)}</span>
                  <Clock size={16} />
                </button>
                {showFromTimePicker && (
                  <div className="custom-picker">
                    <div className="time-picker">
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`time-option ${from === option.value ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(option.value, true)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Custom To Time Picker */}
              <div className="classroom-form-group">
                <label className="classroom-label">
                  <Clock size={16} />
                  To Time
                </label>
                <button
                  className={`classroom-input-button ${showToTimePicker ? 'active' : ''}`}
                  onClick={() => setShowToTimePicker(!showToTimePicker)}
                >
                  <span>{formatTimeDisplay(to)}</span>
                  <Clock size={16} />
                </button>
                {showToTimePicker && (
                  <div className="custom-picker">
                    <div className="time-picker">
                      {timeOptions.map((option) => (
                        <div
                          key={option.value}
                          className={`time-option ${to === option.value ? 'selected' : ''}`}
                          onClick={() => handleTimeSelect(option.value, false)}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {date && from && to && (
              <div className="classroom-info-badge">
                <CheckCircle size={16} />
                Ready to search • {new Date(date).toLocaleDateString()} • {formatTimeDisplay(from)} - {formatTimeDisplay(to)}
              </div>
            )}
          </div>

          <div className="classroom-wings-grid">
            {/* First Row: A, B, C */}
            <div className="classroom-wings-row">
              {wings.slice(0, 3).map((wing) => (
                <div
                  key={wing}
                  className={`classroom-wing-card ${selectedWing === wing ? 'selected' : ''}`}
                  onClick={() => handleWingClick(wing)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Check available rooms in ${wing} Wing`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWingClick(wing);
                    }
                  }}
                >
                  <span className="classroom-wing-letter">{wing}</span>
                  <div className="classroom-wing-text">Wing</div>
                </div>
              ))}
            </div>
            {/* Second Row: D, E, F */}
            <div className="classroom-wings-row">
              {wings.slice(3, 6).map((wing) => (
                <div
                  key={wing}
                  className={`classroom-wing-card ${selectedWing === wing ? 'selected' : ''}`}
                  onClick={() => handleWingClick(wing)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Check available rooms in ${wing} Wing`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWingClick(wing);
                    }
                  }}
                >
                  <span className="classroom-wing-letter">{wing}</span>
                  <div className="classroom-wing-text">Wing</div>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className="classroom-message-alert">
              <AlertCircle size={20} />
              {message}
            </div>
          )}

          {loading && (
            <div className="classroom-loading">
              <div className="classroom-spinner"></div>
            </div>
          )}

          {availableRooms.length > 0 && !loading && (
            <div className="classroom-results-card">
              <div className="classroom-results-header">
                <div className="classroom-results-title">
                  <Search size={20} />
                  Available Rooms in {selectedWing} Wing
                </div>
                <div className="classroom-results-subtitle">
                  {availableRooms.length} rooms found for {formatDateDisplay(date)} • {formatTimeDisplay(from)} - {formatTimeDisplay(to)}
                </div>
              </div>
              
              <table className="classroom-table">
                <thead>
                  <tr>
                    <th className="classroom-table-header">Room Number</th>
                    <th className="classroom-table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {availableRooms.map((room, i) => (
                    <tr key={i} className="classroom-table-row">
                      <td className="classroom-table-cell">
                        <strong>{room.location_number}</strong>
                      </td>
                      <td className="classroom-table-cell">
                        <span className="classroom-status-available">
                          <CheckCircle size={16} />
                          Available
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default AvailableClassrooms;