import os
from pathlib import Path
from typing import Final

DEFAULT_TMP_DIR: Final[str] = "/tmp/protocyber_uploads"
DIR_PERMISSIONS: Final[int] = 0o700


def get_tmp_upload_dir() -> Path:
    """Return the directory for temporary uploads, ensuring it exists and is locked down."""
    base_dir = Path(os.getenv("TMP_UPLOAD_DIR", DEFAULT_TMP_DIR)).resolve()
    base_dir.mkdir(parents=True, exist_ok=True)
    try:
        os.chmod(base_dir, DIR_PERMISSIONS)
    except PermissionError:
        pass
    return base_dir
