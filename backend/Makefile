.PHONY: run test install clean

run:
	uv run uvicorn src.main:app --reload

test:
	uv run pytest

install:
	uv sync

clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
