CREATE TABLE CalendarEntryActivity (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  calendar_entry_id BIGINT NOT NULL,
  activity_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cea_calendar_entry (calendar_entry_id),
  INDEX idx_cea_activity (activity_id),
  CONSTRAINT fk_cea_calendar_entry FOREIGN KEY (calendar_entry_id) REFERENCES CalendarEntry(id) ON DELETE CASCADE,
  CONSTRAINT fk_cea_activity FOREIGN KEY (activity_id) REFERENCES Activity(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
