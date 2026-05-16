-- Generated from Alembic revision 20260410_000002.
-- Alembic is the schema source of truth; keep this file as a mirror.

alter table public.studios
    add column if not exists charging_method varchar(100);

update public.studios
set charging_method = case
    when coalesce(price_note, '') ilike '%免费%' then '免费'
    when coalesce(price_note, '') ~* '(2\s*小时|两小时|2h)' then '按时段收费'
    when price_per_hour is not null or coalesce(price_note, '') ~* '(r/h|/h|每小时|小时|hour|按小时)' then '按小时收费'
    when price_per_day is not null or coalesce(price_note, '') ~* '(按天|按日|daily|per\s*day)' then '按天收费'
    when coalesce(price_note, '') ~* '(预约|咨询|面议|私信|联系)' then '咨询后报价'
    when coalesce(price_note, '') ilike '%收费%' then '收费'
    else charging_method
end
where charging_method is null;
