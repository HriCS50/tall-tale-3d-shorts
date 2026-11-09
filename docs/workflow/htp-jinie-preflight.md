# HTP_Jinie Short Preflight

## Ask the style before you build

- Ask the user which style to use before you start any new short, even when the brief already names a style.

- Treat a style named in a brief as a proposal to confirm, not as permission to skip the question.

- Skip the question only when the user gave an explicit decision for that video or an explicit series-wide decision that covers it.

- Keep the style question separate from any review or approval ask, and do not present a plan and wait for approval before building.

## Check the channel before you upload or report status

- Open the channel uploads list and read it before you upload a short and before you tell the user what is live or still unuploaded.

- Match by title and read the video id and publish time shown in the list, and report only what the list shows.

- Treat a timed out, throttled or interrupted upload attempt as possibly live until the list proves otherwise, and never upload a second copy on the assumption that the first attempt failed.

- If an upload is throttled, stop retrying in the same window, wait, and check the channel again much later instead of hammering retries.

## Carry series continuity into the next reel

- Re-read the previous reel delivery notes and script before you build a sequel, and keep the same voices, character designs, places and facts unless the new brief changes them.

- Check background text in inserts and register pages against the named characters, and fix a name collision before rendering where you can.

- Verify the exact length, frame rate and resolution from the brief before you deliver, and report any QA gap honestly instead of shipping it silently.

## A dropped project stays dropped

- Re-read the latest user instruction and MEMORY.md for a drop, cancel or stop instruction on the project before you deliver any prepared work for it, including a posting pack, a continuity sheet or a recap.

- If the project was dropped, deliver nothing for it, do not resume it, and do not offer to continue it later.

- Treat a dropped project as closed unless the user himself revives it with a new instruction, and do not frame it as waiting until he says otherwise.

- Check the drop status again when a scheduled or prepared job is about to deliver, not only when the work was first prepared.

## Deliver the posting pack

- Give the title, caption and hashtags with the finished video, and give the cover as an image file in PNG or JPG form, never as WebP.

- Name the cover file clearly and keep the title and caption in text the user can copy.

## Available connectors

- [Zapier](/opt/hatch/connectors/zapier/CONNECTOR.md) for the connected YouTube upload action and for checking a write result before any retry.

- Use muse.connector_search to find other connectors and muse.skill_search to find related skills.

- If nothing here fits, look on the web for a maintained API or MCP server and set it up with [Custom Connectors and MCPs](/opt/muse/skills/custom-connector-setup/SKILL.md), or build a custom connector.

## Alternatives for better results

- Build the short itself with the faceless-shorts skill once the style is settled, and follow its build and QA steps for the render.

- For HTP_Jinie shorts, this preflight takes precedence over the faceless-shorts skill. Do not confirm first before a YouTube upload.

- When the user posts a short himself after a throttled upload, give the posting pack in one place instead of splitting it across messages.
