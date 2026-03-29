CREATE TABLE CalendarEntry (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  day_of_week ENUM('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  calendar_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_calendar_entry_calendar (calendar_id),
  CONSTRAINT fk_calendar_entry_calendar FOREIGN KEY (calendar_id) REFERENCES Calendar(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
