#!/usr/bin/env bash
# Deploy ProtoCyber stack on EC2 using AWS Secrets Manager for sensitive values.
#
# Prerequisites:
#   - awscli v2 installed and configured with an instance profile (IAM role) that
#     has secretsmanager:GetSecretValue permission for the specified secret ID.
#   - jq installed (sudo yum install -y jq).
#   - Repository already cloned at /home/ec2-user/protocyber128_Take_Home_Assignment.
#
# Usage:
#   chmod +x scripts/deploy_ec2.sh
#   ./scripts/deploy_ec2.sh Protocyber/BackendSecrets
#
# Optional environment variables:
#   GIT_BRANCH (default: main) -> branch to pull before deploying.
#   BASE_URL (default: https://www.virustotal.com/api/v3/)
#   VITE_API_URL (default: https://api.yourdomain.com)
#
set -euo pipefail

SECRET_ID=${1:-Protocyber/BackendSecrets}
REPO_DIR=${REPO_DIR:-"/home/ec2-user/protocyber128_Take_Home_Assignment"}
GIT_BRANCH=${GIT_BRANCH:-"main"}

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI not found. Install awscli v2 before running this script." >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found. Install it with 'sudo yum install -y jq'." >&2
  exit 1
fi

if [ ! -d "$REPO_DIR" ]; then
  echo "Repository directory $REPO_DIR not found." >&2
  exit 1
fi

# Fetch secrets as a JSON document
SECRET_JSON=$(aws secretsmanager get-secret-value \
  --secret-id "$SECRET_ID" \
  --query SecretString --output text)

export VT_API_KEY=$(echo "$SECRET_JSON" | jq -r '.VT_API_KEY')
export OPENAI_API_KEY=$(echo "$SECRET_JSON" | jq -r '.OPENAI_API_KEY')
export REDIS_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.REDIS_PASSWORD')
export REDIS_USERNAME=${REDIS_USERNAME:-"default"}
export REDIS_HOST=${REDIS_HOST:-"redis"}
export REDIS_PORT=${REDIS_PORT:-6379}
export TMP_UPLOAD_DIR=${TMP_UPLOAD_DIR:-"/app/tmp_uploads"}
export BASE_URL=${BASE_URL:-"https://www.virustotal.com/api/v3/"}
export VITE_API_URL=${VITE_API_URL:-"https://api.yourdomain.com"}

cd "$REPO_DIR"

echo "Checking out branch $GIT_BRANCH..."
git fetch --prune
git checkout "$GIT_BRANCH"
git pull --ff-only origin "$GIT_BRANCH"

echo "Rebuilding containers..."
docker compose pull || true
docker compose up -d --build

echo "Deployment complete. Current containers:"
docker compose ps
