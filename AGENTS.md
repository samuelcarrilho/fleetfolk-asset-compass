<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep FROTATech demonstration data in the shared FleetProvider and validate mutations with the shared Zod schemas; this keeps list screens and indicators consistent without implying permanent storage.
- Use src/features/frota for shared application UI and distinct TanStack leaf routes for each navigation item; this preserves the reference shell and makes unavailable modules explicit.
- Keep visual styling and semantic colors in src/styles.css; this centralizes fidelity adjustments across all reference screens.
