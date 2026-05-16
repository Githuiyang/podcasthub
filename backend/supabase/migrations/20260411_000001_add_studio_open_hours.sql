-- 新增 open_hours 独立字段，将开放时间从 description 中拆分出来
ALTER TABLE studios ADD COLUMN IF NOT EXISTS open_hours VARCHAR(200);

-- 从现有 description 中提取开放时间，回填到新字段
-- 仅处理 description 以 "开放时间:" 或 "开放时间：" 开头或包含该模式的记录
UPDATE studios
SET open_hours = TRIM(REGEXP_REPLACE(
  SUBSTRING(description FROM '开放时间[:：]\s*([^\n]+)'),
  '\s+$', ''
))
WHERE open_hours IS NULL
  AND description IS NOT NULL
  AND description ~ '开放时间[:：]';

-- 回填后，从 description 中移除已迁出的开放时间行
UPDATE studios
SET description = TRIM(REGEXP_REPLACE(
  description,
  '(^|\n)\s*开放时间[:：]\s*[^\n]+',
  '\1',
  'g'
))
WHERE open_hours IS NOT NULL
  AND description IS NOT NULL
  AND description ~ '开放时间[:：]';
