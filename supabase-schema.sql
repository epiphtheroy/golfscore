-- 오륜기파 시즌 2026 — Supabase 테이블 생성 SQL
-- Supabase Dashboard > SQL Editor 에서 이 쿼리 전체를 실행하세요.

-- 1) rounds 테이블
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  round_no integer not null check (round_no between 1 and 10),
  date date not null,
  course_name text not null,
  created_at timestamptz default now()
);

-- 2) scores 테이블
create table if not exists scores (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references rounds(id) on delete cascade,
  player text not null check (player in ('비비', '에이블', '에단', '제리')),
  total_strokes integer not null,
  total_putts integer not null,
  birdies integer not null default 0,
  game_points integer not null default 0,
  created_at timestamptz default now(),
  unique(round_id, player)
);

-- 3) RLS 비활성화 (4명만 사용하는 비공개 앱이므로 간소화)
alter table rounds enable row level security;
alter table scores enable row level security;

-- 모든 사용자에게 읽기/쓰기 허용 (anon key 사용)
create policy "Allow all on rounds" on rounds for all using (true) with check (true);
create policy "Allow all on scores" on scores for all using (true) with check (true);

-- 4) Realtime 활성화
alter publication supabase_realtime add table rounds;
alter publication supabase_realtime add table scores;

-- 5) 더미 데이터 3라운드 삽입
insert into rounds (round_no, date, course_name) values
  (1, '2026-04-19', '파인밸리CC'),
  (2, '2026-05-17', '레이크사이드CC'),
  (3, '2026-06-21', '이스트밸리CC');

-- R01 scores
insert into scores (round_id, player, total_strokes, total_putts, birdies, game_points)
select r.id, s.player, s.total_strokes, s.total_putts, s.birdies, s.game_points
from rounds r,
(values
  ('비비', 85, 30, 3, 12),
  ('에이블', 89, 33, 1, 3),
  ('에단', 91, 34, 1, -5),
  ('제리', 95, 36, 0, -10)
) as s(player, total_strokes, total_putts, birdies, game_points)
where r.round_no = 1;

-- R02 scores
insert into scores (round_id, player, total_strokes, total_putts, birdies, game_points)
select r.id, s.player, s.total_strokes, s.total_putts, s.birdies, s.game_points
from rounds r,
(values
  ('비비', 83, 29, 4, 15),
  ('에이블', 90, 34, 1, -3),
  ('에단', 88, 32, 2, 5),
  ('제리', 96, 37, 0, -17)
) as s(player, total_strokes, total_putts, birdies, game_points)
where r.round_no = 2;

-- R03 scores
insert into scores (round_id, player, total_strokes, total_putts, birdies, game_points)
select r.id, s.player, s.total_strokes, s.total_putts, s.birdies, s.game_points
from rounds r,
(values
  ('비비', 82, 28, 3, 8),
  ('에이블', 87, 31, 2, 6),
  ('에단', 92, 35, 0, -2),
  ('제리', 97, 38, 0, -12)
) as s(player, total_strokes, total_putts, birdies, game_points)
where r.round_no = 3;
