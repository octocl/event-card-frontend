# EventCard invitation maker

An EventCard editor for weddings and birthdays, with ten original invitation designs. Choose a design, edit details and photos, add guest blocks, choose an opening animation and optional music, customize the future link card, preview it live, and download a PNG or standalone HTML page. Drafts are saved in the current browser.

## Local preview

Run `npm run dev`, then open `http://localhost:4300`.

## Scope of this review build

This editor was updated after inspecting the separate `invite.uz-editor` project and the live Worldinvite editor. Its six-step editing flow informed the EventCard experience. The EventCard designs were left as they were; no Worldinvite templates, client photos, names, music files, credentials, or backend connections were copied. A vendored Leaflet library and its license support the map picker. We made no edits to the separate Worldinvite project.

The current app is static. Hosted invitation links, user accounts, payments, and server-side draft storage require the planned EventCard backend. Downloaded HTML pages can be shared as files, and downloaded images can be sent directly. Uploaded music is included in the downloaded HTML page and must be selected again after a browser refresh.
