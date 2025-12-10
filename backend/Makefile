.PHONY: run test install clean

run:
	uv run --active uvicorn src.main:app --reload

test:
	uv run --active pytest tests

test-integration:
	uv run --active pytest tests_integration

install:
	uv sync

clean:
	rm -rf __pycache__
	rm -rf .pytest_cache
	find . -type d -name "__pycache__" -exec rm -rf {} +
