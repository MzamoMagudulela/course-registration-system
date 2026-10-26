import React from 'react';
import { BookOpen, Users, Clock, Award, CheckCircle } from 'lucide-react';

export default function CourseCard({ course, onSelect, onRegister, isRegistered, isStudent }) {
  const percentFilled = Math.min(
    100,
    Math.round((course.enrolled_count / course.max_capacity) * 100)
  );

  return (
    <div className={`course-card ${course.is_full ? 'is-full' : ''}`}>
      <div className="course-card-header">
        <div className="course-badge-row">
          <span className="course-code-badge">{course.code}</span>
          <span className="course-dept-badge">{course.department}</span>
        </div>
        <span className="course-credits-badge">
          <Award className="w-3.5 h-3.5" />
          {course.credits} {course.credits === 1 ? 'Credit' : 'Credits'}
        </span>
      </div>

      <h3 className="course-card-title">{course.name}</h3>

      <p className="course-card-desc">
        {course.description.length > 130
          ? `${course.description.substring(0, 130)}...`
          : course.description}
      </p>

      {course.prerequisites && course.prerequisites !== 'None' && (
        <div className="course-prereq">
          <span className="prereq-label">Prerequisites:</span> {course.prerequisites}
        </div>
      )}

      {/* Capacity & Seat Availability Bar */}
      <div className="course-capacity-section">
        <div className="capacity-label-row">
          <span className="capacity-text">
            <Users className="w-4 h-4 inline mr-1 text-slate-500" />
            {course.enrolled_count} / {course.max_capacity} Enrolled
          </span>
          <span className={`seats-badge ${course.is_full ? 'seats-zero' : 'seats-available'}`}>
            {course.is_full ? 'Full' : `${course.available_seats} seats left`}
          </span>
        </div>
        <div className="capacity-progress-track">
          <div 
            className={`capacity-progress-fill ${
              percentFilled >= 100 
                ? 'bg-rose-500' 
                : percentFilled >= 80 
                ? 'bg-amber-500' 
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentFilled}%` }}
          />
        </div>
      </div>

      {/* Card Actions */}
      <div className="course-card-actions">
        <button 
          onClick={() => onSelect(course)}
          className="btn-outline-secondary"
        >
          View Details
        </button>

        {isStudent && (
          isRegistered ? (
            <button className="btn-enrolled" disabled>
              <CheckCircle className="w-4 h-4 mr-1.5" /> Enrolled
            </button>
          ) : (
            <button
              onClick={() => onRegister(course)}
              disabled={course.is_full}
              className={`btn-primary ${course.is_full ? 'btn-disabled' : ''}`}
            >
              {course.is_full ? 'Class Full' : 'Register'}
            </button>
          )
        )}
      </div>
    </div>
  );
}
