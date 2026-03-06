# ══════════════════════════════════════
# WAZZAL — Secrets Folder
# ══════════════════════════════════════
#
# This folder contains Docker secrets.
# Each file holds ONE secret value (no quotes, no key=value).
#
# Files:
#   openrouter_api_key  → AI provider API key
#   db_password         → PostgreSQL password
#   jwt_secret          → JWT signing key
#
# ⚠️  NEVER commit this folder to git.
#     It is excluded via .gitignore.
#
# To set up on a new machine:
#   mkdir -p secrets
#   echo "your-openrouter-key" > secrets/openrouter_api_key
#   echo "your-db-password"    > secrets/db_password
#   echo "your-jwt-secret"     > secrets/jwt_secret
