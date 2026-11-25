# Optimization Results & Reproducible Benchmarks

This document provides the structured template and measurement protocol for the DEV Community article:
**"Stop Serving Heavy Images: A Developer's Guide to Cloudinary and Angular"**

## Measurement Method

1. Run `npm install && npm start` locally with active internet access.
2. Open `http://localhost:4200/lab` in a modern browser (e.g., Chrome or Firefox).
3. Select each demo asset and apply the target transformation configuration.
4. Record the live browser values displayed in **Real Optimization Metrics** (`Blob.size` via CORS `fetch()`, response `Content-Type`, and decoded natural dimensions).

## Recorded Results

> **Status**: Pending local live execution. The development sandbox environment did not have outbound internet access to fetch live payloads from `res.cloudinary.com/demo`, so no synthetic or estimated metrics have been inserted here.

| Asset (`publicId`) | Original URL | Transformed URL | Config Applied | Orig Format | Opt Format | Orig Dims | Opt Dims | Orig Size | Opt Size | Reduction (%) | Date |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `sample` | `https://res.cloudinary.com/demo/image/upload/sample` | `https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/sample` | `c_limit,w_800`, `q_auto`, `f_auto` | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| `vieste_italy` | `https://res.cloudinary.com/demo/image/upload/vieste_italy` | `https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/vieste_italy` | `c_limit,w_800`, `q_auto`, `f_auto` | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| `docs/profile-pic` | `https://res.cloudinary.com/demo/image/upload/docs/profile-pic` | `https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/docs/profile-pic` | `c_limit,w_800`, `q_auto`, `f_auto` | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| `docs/camera-640` | `https://res.cloudinary.com/demo/image/upload/docs/camera-640` | `https://res.cloudinary.com/demo/image/upload/c_limit,w_640/q_auto/f_auto/docs/camera-640` | `c_limit,w_640`, `q_auto`, `f_auto` | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |
| `cld-sample` | `https://res.cloudinary.com/demo/image/upload/cld-sample` | `https://res.cloudinary.com/demo/image/upload/c_limit,w_800/q_auto/f_auto/cld-sample` | `c_limit,w_800`, `q_auto`, `f_auto` | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ | _TBD_ |

## Limitations

- `f_auto` responses vary by browser (`Accept` header: AVIF vs. WebP vs. JPEG). Record the browser name and version alongside each measurement.
- `Blob.size` measures decoded payload bytes, not compressed HTTP/2 or HTTP/3 wire transfer bytes.
