# base64ToBlob

Decodes a base64 string into a `Blob` of the given media type. Round-trip
helper for edge-function responses that return binary PNGs as base64.

| # | input base64                          | media type   | expected size | expected bytes                     |
|---|---------------------------------------|--------------|---------------|-------------------------------------|
| 1 | PNG magic `iVBORw0KGgo` (8 bytes)     | `image/png`  | 8             | `[137,80,78,71,13,10,26,10]`        |
| 2 | empty string                          | `image/png`  | 0             | `[]`                                |
| 3 | single-char `x`                       | `image/webp` | 1             | media type applied (bytes not tested) |
