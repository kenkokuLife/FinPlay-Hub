# Skill: UI/UX Standards (FinTech Terminal Style)

## 1. Visual Identity
- **Theme**: Pure Dark Mode. Background: `#0a0a0c`, Cards: `#111114`.
- **Style**: Glassmorphism with 1px borders (`rgba(255,255,255,0.1)`).
- **Layout**: Full-viewport, no global scrollbars. Use `flex: 1` for main content areas.

## 2. Iconography (No Emoji Policy)
- **Library**: Strictly use `lucide-react`. 
- **Constraint**: **NEVER** use emojis or text-based icons (颜文字) in the UI.
- **Props**: Default `size={18}`, `strokeWidth={1.5}`.

## 3. Micro-interactions
- **Feedback**: Buttons must have `active:scale-95` and specific pulse animations for CapEx actions.
- **Transitions**: Smooth opacity and height transitions for accordion expansions.