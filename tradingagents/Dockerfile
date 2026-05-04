# TradingAgents Sidecar Dockerfile
# Builds a Python 3.13 image that clones TradingAgents at build time, installs it,
# layers on FastAPI, and serves /analyze over HTTP.

FROM python:3.13-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# git is needed to clone TradingAgents; build-essential covers any C extensions
# that come along with deps (e.g., pandas wheels missing for some platforms).
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Pin the TradingAgents commit via build arg so deploys are reproducible.
ARG TRADINGAGENTS_REF=main
RUN git clone --depth 1 --branch ${TRADINGAGENTS_REF} \
    https://github.com/TauricResearch/TradingAgents.git /app/upstream

# Install TradingAgents (package).
RUN pip install /app/upstream

# Layer the FastAPI wrapper.
COPY requirements.txt /app/requirements.txt
RUN pip install -r /app/requirements.txt

COPY service.py /app/service.py

EXPOSE 8080

# --proxy-headers lets us trust X-Forwarded-* from Render/Railway/Fly.
CMD ["uvicorn", "service:app", "--host", "0.0.0.0", "--port", "8080", "--proxy-headers"]
