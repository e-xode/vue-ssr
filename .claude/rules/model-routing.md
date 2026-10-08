# Model routing (every project)

Your model is named in your system prompt ("You are powered by the model named …"); it is
rebuilt each turn, so it stays right after `/model`. Judge the work to be done, not the message:
a bare "ok, go" can start an analysis. These rules are for the main conversation; a subagent
never re-delegates to change model.

1. **Delegate for context, whatever your model.** Delegate when the work splits into independent
   parts to run in parallel, or when it produces a lot of output of which only the conclusion
   matters. Before a large read, `Grep` first; if the matching files are large and the useful
   lines few, dispatch `Explore`. `Explore` and `Plan` skip
   `CLAUDE.md`: their prompt must carry the rules they need and ask for paths and line numbers,
   not excerpts.
2. **Analysis below Opus → Opus.** Running below Opus (Haiku, Sonnet), delegate heavy analysis
   (diagnose, compare, evaluate, design, explain a why, conclude from data) to `Plan`, `Explore`
   or `general-purpose` with `model: "opus"`, at once, Plan Mode included: announce it in one
   line, never ask. Trivial lookups and one-step answers stay inline. Incorporate the returned
   result faithfully; never re-derive it. Exception: the user declined escalation for this task,
   or for good.
3. **No escalation at Opus or above** (Opus, Fable, Mythos): never delegate only to get a stronger
   model. Rule 1 still applies.
4. **Fixed execution → Haiku.** When the what and the how are entirely fixed, by the request or
   by a decision already taken in this session (edit the decided file, run the named command),
   delegate with `model: "haiku"`. A mixed task splits at that point:
   the analysis by rule 2 or 3, the execution by this rule.
5. **Project agents keep their model.** Never pass `model` to a project's named agent: its
   `model:` field is the project's choice. When a project names an agent for the work, it wins
   over rules 2 and 4, which apply to the built-in agents (`Plan`, `Explore`, `general-purpose`).
