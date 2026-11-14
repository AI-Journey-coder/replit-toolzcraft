# Third-party distribution review

This is an outstanding release item, not a declaration that all licence requirements have been fulfilled. The repository's MIT licence does not replace the licences of bundled dependencies.

- Installed @ffmpeg/core 0.12.10 declares GPL-2.0-or-later. Its compiled WebAssembly includes FFmpeg and external codecs; the app uses libx264. The MIT licence on @ffmpeg/ffmpeg covers its JavaScript wrapper, not this core. Before distributing the binary, retain required notices and arrange the applicable corresponding-source distribution, including the precise build inputs/scripts for the shipped version. A link to an arbitrary latest upstream tree is not a verified corresponding-source package. See the [upstream licensing explanation](https://ffmpegwasm.netlify.app/docs/faq/) and review the actual build's component licences.
- Installed Pyodide 314.0.6 declares MPL-2.0. Its Python runtime and bundled standard library also contain their own notices. Preserve the distribution's applicable notices and source information when copying the runtime into public/vendor.
- The bundled SQLGlot wheel is version 30.18.0. Preserve its MIT notice along with the wheel. PDF.js, pdf-lib, Tesseract, DOMPurify, React and the other shipped dependencies likewise need their applicable notices retained.

Before the first release, generate an inventory from the frozen lockfile and actual emitted browser/runtime assets, collect the licence/copyright files, publish the required notices and matching source material, and verify them in the deployed image. Review any unavailable or ambiguous notice rather than treating package metadata as complete licence text. Repeat after dependency changes. The production readiness checklist remains open until this review is complete.
