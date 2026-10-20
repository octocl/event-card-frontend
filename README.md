# EventCard invitation maker

An EventCard editor for weddings and birthdays, with ten original invitation designs. Choose a design, edit the event details, add an optional photo, preview it live, and download a PNG or standalone HTML page. Drafts are saved in the current browser.

## Local preview

Run `npm run dev`, then open `http://localhost:4300`.

## Scope of this review build

This editor was built after inspecting the separate `invite.uz-editor` project. Its split editor flow and variety of template styles informed this implementation. None of its client photos, names, music files, credentials, or backend connections were copied. The original `invite.uz` and `invite.uz-editor` directories were left untouched.

The current app is static. Hosted invitation links, user accounts, payments, and server-side draft storage require the planned EventCard backend. Downloaded HTML pages can be shared as files, and downloaded images can be sent directly.
