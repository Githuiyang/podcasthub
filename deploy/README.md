# PodcastHub 后端公网部署包

这套部署包面向 `api.daydayup.media`，目标是把 `backend/` 里的 FastAPI 服务以最小可上线方式跑到一台稳定的公网 Python 主机上。

## 目录说明

- `backend.env.example`：后端生产环境变量清单
- `start-backend.sh`：手动启动脚本
- `systemd/podcasthub-api.service`：systemd 服务模板
- `nginx/podcasthub-api.conf`：Nginx 反代模板
- `caddy/Caddyfile`：Caddy 反代模板

## 上线顺序

1. 准备一台有持久磁盘的 Linux Python 主机。
2. 配好 `deploy/backend.env.example` 里的环境变量。
3. 安装依赖。
4. 执行数据库迁移。
5. 启动后端服务。
6. 用 Nginx 或 Caddy 把 `api.daydayup.media` 反代到本地 `127.0.0.1:8000`。

## 推荐生产启动命令

```bash
cd /opt/podcasthub/backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
GUNICORN_BIN=.venv/bin/gunicorn bash ../deploy/start-backend.sh
```

## 生产注意事项

- `AUTO_INIT_DB` 在生产环境必须关闭，避免应用启动时偷偷建表。
- `DATABASE_URL` 必须指向 Supabase/Postgres 或其他公网数据库。
- 当前后端仍会把上传图片写到 `backend/data/uploads`，所以部署主机需要持久磁盘。
- 这个目录只是最小上线包，图片对象存储、备份、监控、告警后续再补。

