# Snake Royale Backend

## Running the Server

This project uses `uv` for dependency management.

To run the development server:

```bash
uv run uvicorn src.main:app --reload
```

## Dependencies

Dependencies are managed in `pyproject.toml`. To install them individually (if not using `uv run`):

```bash
uv sync
```
