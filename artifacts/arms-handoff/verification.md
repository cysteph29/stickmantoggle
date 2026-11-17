# Arms handoff and alternate start verification

- Alternate knob start: 261.5 → 311.5 SVG units (+50). Entrance and pushing coordinates inherit the same offset through WALK_OFFSET_X. Final knob center remains 890.5.
- Initial, hand-contact, and widest-push captures inspected. The head is fully visible at contact and widest push; the curved clip still hides part of the lower body.
- Cause: completion updated knobSide, causing React to solve INITIAL_RIG with grip=1 against the right knob. Changed arm transform props overwrote GSAP's relaxed endpoint.
- Fix: completion supplies a copy of the finished rig to React; ToggleStage renders that rig. Both routes now preserve the full finished pose without an added tween.
- Both routes played naturally through completion. Immediate and two-second hold captures match the authored final transforms exactly, including upper/forearm angles 14°/-8° and 7°/-4°, upright torso/chest/head, and the narrow stance. Visually compared against ../narrow-rest/final-frame.png, the saved arms-down reference.
- Track, clip path, clearance, endpoint, authored poses, and release/stumble timing unchanged.
- npm run build: passed. npm run lint: passed. git diff --check: passed.

| Route | Initial | Contact | Widest push | Completion | Two-second hold |
| --- | --- | --- | --- | --- | --- |
| Default | [Capture](default-initial.png) | [Capture](default-contact.png) | [Capture](default-widest-push.png) | [Capture](default-completed.png) | [Capture](default-hold-2s.png) |
| Walk | [Capture](walk-initial.png) | [Capture](walk-contact.png) | [Capture](walk-widest-push.png) | [Capture](walk-completed.png) | [Capture](walk-hold-2s.png) |

Machine assertions and transforms: [results.json](results.json). Reproduce with `node artifacts/arms-handoff/verify.cjs` while Vite runs on port 5175.
