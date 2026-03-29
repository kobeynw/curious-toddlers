CREATE TABLE ActivityTag (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT NOT NULL,
  tag_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX idx_activity_tag_unique (activity_id, tag_id),
  INDEX idx_activity_tag_tag (tag_id),
  CONSTRAINT fk_activity_tag_activity FOREIGN KEY (activity_id) REFERENCES Activity(id) ON DELETE CASCADE,
  CONSTRAINT fk_activity_tag_tag FOREIGN KEY (tag_id) REFERENCES Tag(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
