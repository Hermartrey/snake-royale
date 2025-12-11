BEGIN;
INSERT INTO users ("id", "username", "email", "password", "created_at") VALUES ('3caf8ff1-1251-4802-95a5-ce355d5391d0', 'user1', 'user1@snake.game', 'user1', '2025-12-10 05:54:44.437035') ON CONFLICT DO NOTHING;
INSERT INTO leaderboard ("id", "username", "score", "mode", "date") VALUES ('7e481f5e-84c8-4d23-b694-f78cf15b46b3', 'user1', 150, 'passthrough', '2025-12-10 05:55:32.957480') ON CONFLICT DO NOTHING;
INSERT INTO leaderboard ("id", "username", "score", "mode", "date") VALUES ('f90bc16a-7a4a-4d69-97d1-403a0a000bfb', 'user1', 310, 'passthrough', '2025-12-10 06:12:40.172648') ON CONFLICT DO NOTHING;
COMMIT;
