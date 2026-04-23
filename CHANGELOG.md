# DIT Pro Suite - Change Log

All notable changes to this project will be documented in this file.

## [v5.0] - 2026-04-18
### Radically Changed
- **Total Suite Purge**: All ancillary tools (`Data Integrity Verifier`, `Batch Media Logger`, `Data Footprint Estimator`, `Timecode Math Engine`) have been completely obliterated based on user request.
- **Single-Purpose Pivot**: The application is now laser-focused entirely on the `Folder Structure Generator`, enforcing strict adherence to only one primary responsibility.

## [v4.1] - 2026-04-18
### Added
- **New Tool: Data Footprint Estimator**: A pre-production and on-set estimating tool. Configured mathematically to output baseline payload requirements based on specific ARRI, RED, and Sony CODECS alongside an automated 3:2:1 Strategy metric.
- **New Tool: Timecode Math Engine**: Execute frame-accurate NDF Timecode operations (Addition, Subtraction, Duration Math) spanning standard framerates (23.98-60fps). Includes a historic ledger layout.

## [v4.0] - 2026-04-18
### Radically Changed
- **Tool Swap**: As part of an extreme DIT pivot, **Metadata Extractor** and **Offline Proxy Generator** have been completely deleted from the suite.
- **New Tool: Data Integrity Verifier**: Added an in-browser SHA-256 chunk-based file hasher. Generates secure mathematical hashes for offline media and exports an industry-compliant `.mhl` (Media Hash List) XML manifest.
- **New Tool: Batch Media Logger**: Added a robust metadata registry designed to generate standardized naming conventions (`[CAM][REEL]_C[ID]_[DATE]`) alongside scene/take logging. Export to CSV for Editor NLE systems or download shell scripts (`.sh`) for rapid batch renaming via Terminal.

## [v3.0] - 2026-04-18
### Radically Changed
- **Total Codebase Eradication**: Obliterated the messy prototype UI and legacy hooks. Completely rewrote the `ProxyGenerator` component from a clean slate.
- **DIT Minimalist Layout**: Deployed a dual-pane streamlined UI focusing strictly on NLE standards (720p/1080p MP4) stripped of experimental WebM or canvas cruft.
- **Bulletproof React Pipeline**: State management of FFmpeg instances replaced with rigid `useEffect` daemons. Eliminates previous "Stuck on Start" and 0% bugs implicitly by running strict mathematical length calculations natively through DOM before executing encoding logic.
- **Accents**: Shifted visual motif from Hacker-Purple to Resolve-Emerald confirming its transition to a purely functional workhorse.

## [v2.2] - 2026-04-18
### Fixed
- **Single-Threaded WASM Deadlock (0% Freeze)**: Passed `-threads 1` to the FFmpeg engine explicitly. High-end video blocks (especially `libx264`) attempt to spin up Pthreads (web workers) dynamically by default. If the WASM environment doesn't offer `SharedArrayBuffer` for threading, FFmpeg silently froze, leaving the progress bar permanently at 0%.
- **Progress Synchronization Reliability**: Sometimes FFmpeg doesn't parse file length locally to establish progress thresholds. Implemented a fallback calculator utilizing JS metadata durations alongside FFmpeg's `timestamp(us)` logging output to guarantee continuous visual percentage feedback.

## [v2.1] - 2026-04-18
### Extended
- **Detailed WASM Status Tracking**: Broke down the FFmpeg loading process to report exactly which piece of the core is being downloaded. Users will now see specific statuses such as `Downloading core.js...`, `Downloading core.wasm (~30MB)...`, and `Initializing WebAssembly Engine...`.
- **Advanced Error Logging**: Replaced generic "Init Failed" messages with precise, substring-evaluated error strings derived from the Web Browser's failure state, directly exposing CORS or out-of-memory WebAssembly violations.

## [v2.0] - 2026-04-18
### Changed
- **Architectural Shift (`FFmpeg.wasm`)**: Radically changed the rendering engine. Completely removed `MediaRecorder` + `canvas.captureStream` and rebuilt the encoder using true **`@ffmpeg/ffmpeg` (WASM)**.
- **Bit-Perfect Output**: Transcoding is now handled natively via FFmpeg passing CLI args (e.g., `-c:v libx264 -preset ultrafast`), solving absolute hardware codec incompatibilities on the web.
- **WASM Progress Sync**: Tracks real-time muxing and encoding percentage via the FFmpeg internal event listener.
- **Removed**: "Visual Timecode Burn-in" is temporarily sidelined in v2.0 as Font dependencies are difficult to isolate purely through WebAssembly, but 100% NLE format integrity is guaranteed.
- **UI Update**: Purple "WASM / Terminal" theme added to visually acknowledge the FFmpeg backend architecture shift.

## [v1.9] - 2026-04-18
### Added
- **DIT Workflow Mode**: "편집 가능하게" (Editable Proxy Format). Engineered specifically for Digital Imaging Technician workflows in NLEs (Non-Linear Editors like Premiere/Resolve).
- **Timecode & Metadata Burn-in**: The engine now physically draws Visual Timecode (BITC), Clip Name, and resolution/FPS metadata as an overlay on the exported proxy frames. This is invaluable for offline editing conform.
- **NLE Default Settings**: 
  - Standardized default output codec to `H.264 (MP4)` to ensure maximum NLE compatibility, avoiding WebM format issues during editing.
  - Added new "NLE Pro (16M)" high-bitrate preset to enable faster scrubbing by forcing heavily loaded intermediate frames.
- **Engine Status**: Upgraded to "DIT_Workflow_Ready".

## [v1.8] - 2026-04-18
### Added
- **Adaptive Codec Engine**: Added dynamic support for multiple codecs including AV1, VP9, VP8, and H.264.
- **Browser Capability Detection**: The engine now queries `MediaRecorder.isTypeSupported()` on initialization to hide unsupported codecs from the UI, ensuring encoding reliability across different browsers.
- **Dynamic File Extensions**: Outputs automatically adapt to `.webm` or `.mp4` respectively based on the selected codec.
- **Engine Label**: Updated to "Adaptive_Codec_Engine" status.

## [v1.7] - 2026-04-18
### Fixed
- **Rendering Algorithm Rewrite**: Completely replaced the manual `captureStream(0)` + `requestFrame()` logic with a native "Live Automatic Sync" (`captureStream(fps)`). This resolves a critical bug in some browsers where manual frame pushing resulted in 0fps or 64kbps output due to timestamp dropping.
- **Engine Label**: Updated to "Live_Auto_Sync_Engine" status.

## [v1.6] - 2026-04-18
### Added
- **Proxy Engine v1.6**: Integrated technical FPS selector with fractional support (23.976, 29.97, 59.94, etc.).
- **Metadata Detection**: Added a 'Detected_Media' panel in the sidebar that displays filename, duration, and target FPS for pre-conversion verification.
- **Frame Sync**: Maintained `captureStream(0)` driven by `requestVideoFrameCallback()` for perfect fractional frame adherence.
- **Engine Label**: Updated to "Precision_Metadata_Lock" status.

## [v1.5] - 2026-04-18
### Fixed
- **Termination Bug**: Resolved issue where rendering would stall at 100% without showing the download button.
- **Improved Reliability**: Added a redundant `ended` event listener fallback for the render loop.
- **Frame Lock**: Implemented a mandatory final frame flush and buffer delay to ensure all recorded data is finalized before stopping.
- **Engine Label**: Updated to "Deterministic_Frame_Lock" status.

## [v1.4] - 2026-04-18
### Added
- **Proxy Engine v1.4**: High-Precision Frame Engine using `requestVideoFrameCallback()`.
- **Capture Strategy**: Transitioned to `captureStream(0)` for deterministic frame-controlled recording.
- **Queue System**: Implemented sequential (one-at-a-time) file processing for better resource management.
- **Scaling Logic**: Added professional letterbox scaling to preserve original aspect ratios regardless of target resolution.
- **Bitrate Refinement**: Optimized quality presets to Low (1M), Medium (4M), and High (8M).

## [v1.3] - 2026-04-18
### Added
- **Proxy Engine v1.3**: Complete rebuild using pure Web-API (Canvas + MediaRecorder).
- **VP9 Support**: Enforced high-efficiency VP9 WebM encoding as the primary output format.
- **Resolution Presets**: Added 480p (854x480) support.
- **Quality Presets**: Standardized to Low (1.5M), Medium (4M), and High (10M) bitrates.
- **WASM-Free Compatibility**: Removed FFmpeg.wasm dependencies to ensure 100% compatibility with restricted iframe and sandbox environments.
- **Deterministic Loop**: Implemented frame-accurate seek-and-draw processing for zero-frame loss.

### Changed
- Refined Dashboard status indicators to "Precision_Canvas_Online".
- Optimized UI responsiveness during heavy transcode operations.

---

## [v1.2] - 2026-04-18
### Added
- **FFmpeg Integration**: Attempted migration to FFmpeg.wasm for H.264/MP4 support.
### Fixed
- **Container Unification**: Standardized download extensions to .mp4.
### Removed
- FFmpeg logic (reverted in v1.3 due to SharedArrayBuffer/COI constraints in target environments).

---

## [v1.1] - 2026-04-18
### Changed
- **MP4 Unification**: Prioritized MP4 container for broad hardware compatibility.
- **Header Synchronization**: Applied unified "Ais_Proxy Engine" title styling (Italic, Uppercase, Bolder) across all tool headers.

---

## [v1.0] - 2026-04-18
### Fixed
- **Critical Bug Fix**: Resolved "0.0 MB" file size issue by implementing 1s timeslice recording.
- **Macroblock Alignment**: Forced output dimensions to even integers (Multiple of 4) to satisfy hardware encoder requirements.
- **Rendering Stability**: Transitioned from requestAnimationFrame to a deterministic while-loop.
- **Audio Integrity**: Added silent AudioContext gain node to keep the audio pipeline active during transcoding.

### Added
- **Base Baseline**: Initial synchronized stable release of the DIT Pro Suite.
- **Folder Generator**: Visual tree preview and ZIP export protocol.
- **Metadata Extractor**: Support for MediaInfo.js parsing and PDF report generation.

---

## [v0.5 - Beta] - Initial Prototype
- Basic GUI layout for Proxy Video Generator (legacy tkinter inspired).
- Initial DIT dashboard design with sidebar navigation.
- Dark Shell theme Implementation.
