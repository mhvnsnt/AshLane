"""Pull a mesh from a public Hunyuan3D space. No Tripo, no local GPU.

Usage: python3 scripts/generate_asset.py <image> <out.glb>

Tries tencent/Hunyuan3D-2.1 first (that space accepted an anonymous job).
Falls back to tencent/Hunyuan3D-2. Set HF_TOKEN if a space asks you to log in.
TRELLIS's official space is down, so this does not call it.
"""
import os
import shutil
import sys
from pathlib import Path

from gradio_client import Client, handle_file


def path_of(value) -> str | None:
    if isinstance(value, str) and value:
        return value
    if isinstance(value, dict):
        raw = value.get("value") or value.get("path")
        if isinstance(raw, str) and raw:
            return raw
    return None


def main() -> None:
    if len(sys.argv) != 3:
        raise SystemExit("usage: generate_asset.py image out.glb")
    image, out = sys.argv[1], Path(sys.argv[2])
    token = os.environ.get("HF_TOKEN") or None
    last = "no space answered"
    for src, kind in (("tencent/Hunyuan3D-2.1", "21"), ("tencent/Hunyuan3D-2", "2")):
        try:
            client = Client(src, token=token)
            if kind == "21":
                result = client.predict(
                    handle_file(image),
                    None, None, None, None,
                    5, 5.0, 1, 128, True, 2000, False,
                    api_name="/shape_generation",
                )
                src_path = path_of(result[0])
            else:
                result = client.predict(
                    None, handle_file(image),
                    None, None, None, None,
                    8, 5.0, 1234, 128, True, 8000, False,
                    api_name="/generation_all",
                )
                src_path = path_of(result[1]) or path_of(result[0])
            if not src_path:
                last = f"{src} returned no file"
                continue
            out.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(src_path, out)
            print(out, out.stat().st_size, "from", src)
            return
        except Exception as e:
            last = f"{src}: {e}"
    raise SystemExit(last)


if __name__ == "__main__":
    main()
