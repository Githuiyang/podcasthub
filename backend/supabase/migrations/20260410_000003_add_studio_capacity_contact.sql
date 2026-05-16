-- 20260410_000003: 新增 capacity / need_own_equipment_for_video / contact_info

ALTER TABLE studios
  ADD COLUMN IF NOT EXISTS capacity INTEGER,
  ADD COLUMN IF NOT EXISTS need_own_equipment_for_video BOOLEAN,
  ADD COLUMN IF NOT EXISTS contact_info VARCHAR(200);
