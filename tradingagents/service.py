"""FastAPI wrapper around TradingAgents.

Exposes:
  GET  /health             -> liveness
  POST /analyze            -> {ticker, date?} -> agent decision payload
  GET  /                   -> service info

The TradingAgentsGraph itself is initialized lazily on first /analyze call so the
container starts fast and we don't crash at boot if env vars are missing.
"""

from __future__ import annotations

import logging
import os
import threading
from datetime import date
from typing import Any, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logger = logging.getLogger("tradingagents-sidecar")
logging.basicConfig(level=logging.INFO)

app = FastAPI(title="TradingAgents Sidecar", version="0.1.0")

# CORS — restrict to the Next.js origin in production via TRADINGAGENTS_ALLOWED_ORIGIN.
allowed_origin = os.environ.get("TRADINGAGENTS_ALLOWED_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[allowed_origin] if allowed_origin != "*" else ["*"],
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Lazy graph init — TradingAgentsGraph instantiation can pull config that touches
# the network, so we avoid running it at import time.
_graph_lock = threading.Lock()
_graph: Optional[Any] = None


def _get_graph() -> Any:
    global _graph
    if _graph is not None:
        return _graph
    with _graph_lock:
        if _graph is None:
            try:
                from tradingagents.graph.trading_graph import TradingAgentsGraph
            except ImportError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"TradingAgents not installed in image: {e}",
                )
            logger.info("Initializing TradingAgentsGraph…")
            _graph = TradingAgentsGraph()
    return _graph


class AnalyzeRequest(BaseModel):
    ticker: str = Field(..., min_length=1, max_length=10)
    date: Optional[str] = Field(
        None,
        description="ISO date YYYY-MM-DD; defaults to today.",
    )


class AnalyzeResponse(BaseModel):
    ticker: str
    date: str
    decision: Any
    state_summary: dict[str, Any]


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "tradingagents-sidecar",
        "version": "0.1.0",
        "endpoints": "GET /health, POST /analyze",
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    target_date = req.date or date.today().isoformat()
    ticker = req.ticker.upper()

    # Optional shared-secret gate to keep this from being publicly callable.
    expected_secret = os.environ.get("TRADINGAGENTS_API_SECRET")
    # FastAPI doesn't pass the request directly here; we read from env-vs-header
    # in middleware below. (See verify_secret middleware.)

    graph = _get_graph()
    logger.info("Running TradingAgents on %s for %s", ticker, target_date)

    try:
        state, decision = graph.propagate(ticker, target_date)
    except Exception as e:
        logger.exception("propagate failed")
        raise HTTPException(status_code=502, detail=f"agent run failed: {e}") from e

    # Trim state to printable summary — full state can be very large.
    summary: dict[str, Any] = {}
    if isinstance(state, dict):
        for k in (
            "market_report",
            "fundamentals_report",
            "news_report",
            "sentiment_report",
            "investment_plan",
            "trader_investment_plan",
            "final_trade_decision",
        ):
            if k in state:
                v = state[k]
                summary[k] = v if isinstance(v, str) else str(v)

    return AnalyzeResponse(
        ticker=ticker,
        date=target_date,
        decision=decision,
        state_summary=summary,
    )


@app.middleware("http")
async def verify_secret(request, call_next):
    """If TRADINGAGENTS_API_SECRET is set, require matching X-API-Key on /analyze."""
    if request.url.path == "/analyze":
        expected = os.environ.get("TRADINGAGENTS_API_SECRET")
        if expected:
            provided = request.headers.get("x-api-key", "")
            if provided != expected:
                from starlette.responses import JSONResponse
                return JSONResponse({"detail": "unauthorized"}, status_code=401)
    return await call_next(request)
