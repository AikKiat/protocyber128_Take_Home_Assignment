# Deployment & Packaging Playbook

This document captures the full checklist for taking the ProtoCyber stack (FastAPI + React + Redis) from local development to an EC2-hosted, Dockerized deployment with CI/CD. Treat it as a living runbook—update it whenever the workflow evolves.

---

## 1. Secrets & Environment Variables

1. **Rotate leaked keys immediately.** The `.env` files currently hold real VirusTotal / OpenAI keys. Regenerate new credentials and invalidate the ones in git history. Never commit secrets going forward.
2. **Backend `.env` essentials:**
   ```properties
   VT_API_KEY=<rotated>
   BASE_URL=https://www.virustotal.com/api/v3/
   OPENAI_API_KEY=<rotated>
   REDIS_HOST=redis
   REDIS_PORT=6379
   REDIS_USERNAME=default
   REDIS_PASSWORD=<choose strong password>
   TMP_UPLOAD_DIR=/app/tmp_uploads
   ```
3. **Frontend `.env` (Vite):**
   ```properties
   VITE_API_URL=http://localhost:8000   # override during prod build via --build-arg
   ```
4. **Convention:** keep `.env` and `.env.local` out of git. Provide a `.env.example` once secrets are rotated.

---

## 2. Backend Container Usage

### Production image
```bash
# From repo root
docker build -t protocyber-backend \
  -f backend/Dockerfile backend

docker run --rm -p 8000:8000 \
  --env-file backend/.env \
  protocyber-backend
```
- Multi-stage build uses `python:3.11-slim` and runs uvicorn as a non-root user.
- `TMP_UPLOAD_DIR` defaults to `/app/tmp_uploads` and is chmod `700` inside the image.

### Development image
```bash
docker build -t protocyber-backend-dev \
  -f backend/Dockerfile.dev backend

docker run --rm -p 8000:8000 \
  --env-file backend/.env \
  -v "$PWD/backend":/app \
  protocyber-backend-dev
```
- Uses `uvicorn --reload`; bind-mount keeps hot reload working.

---

## 3. Frontend Container Usage

### Production image (static build served by Nginx)
```bash
docker build -t protocyber-frontend \
  -f client/Dockerfile \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  client

docker run --rm -p 4173:80 protocyber-frontend
```
- Build stage (Node 20) → runtime stage (Nginx w/ SPA config `client/nginx.conf`).

### Development image (Vite dev server)
```bash
docker build -t protocyber-frontend-dev \
  -f client/Dockerfile.dev client

docker run --rm -p 5173:5173 \
  -e VITE_API_URL=http://localhost:8000 \
  -v "$PWD/client":/app \
  protocyber-frontend-dev
```
- `CHOKIDAR_USEPOLLING=1` ensures reliable file watching inside Docker.

---

## 4. Docker Compose Stack (DONE)

`docker-compose.yml` at the repo root now bundles Redis, backend, and frontend:

```yaml
services:
  redis:
    image: redis:7-alpine
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD:-changeme}"]
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
    environment:
      - REDIS_HOST=redis
      - TMP_UPLOAD_DIR=/app/tmp_uploads
    volumes:
      - uploads_tmp:/app/tmp_uploads

  frontend:
    build:
      context: ./client
      args:
        VITE_API_URL: ${VITE_API_URL:-http://localhost:8000}

volumes:
  redis_data:
  uploads_tmp:
```

**How to run locally**

1. Export the required secrets so Compose can substitute them (or put them in a root `.env`):
   ```bash
   export VT_API_KEY=...
   export OPENAI_API_KEY=...
   export REDIS_PASSWORD=supersecure
   export VITE_API_URL=http://localhost:8000
   ```
2. Start the stack:
   ```bash
   docker compose up --build
   ```
   - Backend → http://localhost:8000
   - Frontend → http://localhost:4173
   - Redis exposed on 6379 for local debugging (limit SG ingress in prod).
3. Stop and remove containers:
   ```bash
   docker compose down
   ```
4. The `uploads_tmp` volume isolates `/app/tmp_uploads` with `chmod 700`; use `docker volume rm protocyber128_take_home_assignment_uploads_tmp` if you need to flush it.

> **Note:** Compose does not read `backend/.env` automatically because it contains spaces around `=`. Either reformat that file to `KEY=value` and pass `docker compose --env-file backend/.env up`, or export the env vars as shown above.

---

## 5. CI/CD with GitHub Actions (planned)

> **Status:** pending implementation.

Target workflow files (`.github/workflows/ci.yml` and optionally `deploy.yml`). Outline:
1. **ci.yml**
   - `backend-tests`: `actions/setup-python`, install deps, run pytest (add tests) or at least `uvicorn --help` to confirm environment.
   - `frontend-tests`: `actions/setup-node`, `npm ci`, `npm run build`.
   - `docker-build`: `docker/setup-buildx-action`, build backend and frontend images, optionally push to GHCR/ECR when on `main`.
2. **deploy.yml** (optional) triggered on `main`/tags/manual:
   - Build + push Docker images to Amazon ECR.
   - SSH/SSM into EC2 to run `docker compose pull && docker compose up -d`.
   - Use `aws-actions/configure-aws-credentials` for auth; keep AWS keys in GitHub Secrets.

Action items:
- Decide on deployment target (direct EC2 via SSH vs. ECS/EKS). Current plan: SSH into EC2 and run compose.
- Create GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `EC2_HOST`, `EC2_SSH_KEY`, `VT_API_KEY`, etc.).

---

## 6. EC2 Deployment Checklist

1. Launch Amazon Linux 2023 t3.small (or t2.micro for free tier) in a public subnet.
2. Security group: allow inbound 22 (SSH), 80/443 (HTTP/HTTPS). Restrict SSH to your IP.
3. Install Docker + Docker Compose:
   ```bash
   sudo yum update -y
   sudo amazon-linux-extras enable docker
   sudo yum install -y docker
   sudo systemctl enable --now docker
   sudo usermod -aG docker ec2-user
   DOCKER_CONFIG=${HOME}/.docker sudo -E sh -c "curl -L https://github.com/docker/compose/releases/download/v2.27.0/docker-compose-linux-x86_64 -o /usr/local/lib/docker/cli-plugins/docker-compose && chmod +x /usr/local/lib/docker/cli-plugins/docker-compose"
   ```
4. Clone repo or pull images from registry. Copy production `.env` files to `/home/ec2-user/app/backend/.env`, etc.
5. Run `docker compose up -d --build` (once compose file exists). Use `systemd` unit to auto-start on reboot if desired.
6. Set up HTTPS (optionally) using Nginx reverse proxy or AWS ALB + ACM certificate.

---

## 7. Redis vs. In-Process State

- Redis centralizes cache/state so multiple backend replicas (or restarts) share the same view. The previous in-process singleton (`FileUploadsRecord`) lost state on restart and couldn’t scale horizontally.
- Production advantages:
  - **Durability:** survive backend crashes, optional persistence.
  - **Horizontal scaling:** multiple containers share the cache.
  - **Security:** can be isolated via Docker network, protected by password.
  - **Extensibility:** can add TTL, analytics, etc., without changing backend memory structures.

---

## 8. Testing & Quality (to add)

- Add basic FastAPI tests (e.g., `tests/test_health.py`) to ensure `/health` responds.
- For frontend, keep `npm run build` in CI as a sanity check; add unit tests if time permits.
- Consider integration test script that uploads a sample file (from the provided dataset) and verifies the response flow (can be skipped in CI if VirusTotal rate limits apply).

---

## 9. Documentation Updates (pending)

Once compose + CI are in place:
1. Update root `README.md` with:
   - Project overview & architecture diagram (frontend ↔ backend ↔ Redis ↔ VT API ↔ AI service).
   - Local development instructions (npm + uvicorn or docker compose dev stack).
   - Production deployment instructions (compose on EC2).
   - CI/CD description with badge.
   - Known limitations / future enhancements.
2. Include table detailing environment variables for both services.
3. Provide link to this `README_instructions.md` for deeper operations guidance.

---

## 10. Remaining Tasks Snapshot

- [ ] Implement `docker-compose.yml` (backend, frontend, redis, volumes, networks).
- [ ] Add `.github/workflows/ci.yml` (and optional `deploy.yml`).
- [ ] Update documentation per §9.
- [ ] Rotate and secure all API keys.

---

## 11. Secrets Management & Deployment Automation (AWS)

### 11.1 Create Secrets in AWS Secrets Manager

For each sensitive value (VirusTotal key, OpenAI key, Redis password, etc.), create a managed secret:

1. Go to **AWS Console → Secrets Manager → Store a new secret**.
2. Choose **Other type of secret** and enter key/value pairs (e.g., `VT_API_KEY`, `OPENAI_API_KEY`, `REDIS_PASSWORD`).
3. Name the secret something like `Protocyber/BackendSecrets`.
4. Repeat for frontend-only secrets if needed (most should be backend-only).

### 11.2 IAM Role for EC2 Instance

- Attach (or create) an IAM role for the EC2 instance with policy:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "secretsmanager:GetSecretValue"
        ],
        "Resource": ["arn:aws:secretsmanager:REGION:ACCOUNT:secret:Protocyber/*"]
      }
    ]
  }
  ```
- Attach the role to the running EC2 instance (via Console → Instance → Security → Modify IAM role).

### 11.3 Deploy Script on EC2

Use the provided script [`scripts/deploy_ec2.sh`](scripts/deploy_ec2.sh) (copy it to your EC2 home directory and chmod +x):

```bash
./scripts/deploy_ec2.sh Protocyber/BackendSecrets
```

Notes:
- Requires `jq` on the instance (`sudo yum install -y jq`).
- Secrets stay in memory only; nothing written to disk.
- Update `VITE_API_URL` export to the public backend URL.

### 11.4 Rotation Workflow

1. In Secrets Manager, edit `Protocyber/BackendSecrets`, replace the value (e.g., `VT_API_KEY`).
2. Save; optionally enable automatic rotation later.
3. SSH into EC2 and rerun `./deploy.sh` so containers restart with the new env vars.
4. If CI/CD needs the new keys (for integration tests), update GitHub Secrets as well.

### 11.5 Optional CI/CD Deployment Automation

- Extend `.github/workflows/ci.yml` or add `deploy.yml` to:
  1. Build & push Docker images to ECR (using `aws-actions/amazon-ecr-login@v2`).
  2. Trigger `deploy.sh` via SSH (using `appleboy/ssh-action`) or via SSM `aws ssm send-command`.
  3. Pass secrets to the workflow via GitHub Secrets; they can differ from AWS Secrets Manager (CI may need read-only keys).

---

## 12. Updated Remaining Tasks

- [ ] Create AWS Secrets Manager entries for backend secrets.
- [ ] Attach IAM role with `secretsmanager:GetSecretValue` to EC2.
- [ ] Install `jq` + write `deploy.sh` on EC2 to fetch secrets & run compose.
- [ ] (Optional) Extend CI to build/push to ECR and trigger deploy script.

Once the above are complete you’ll have a fully Dockerized, CI-backed, EC2-deployable stack. Ping this doc whenever you need the exact commands or checklist. Happy shipping!
