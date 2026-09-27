# Lavanya's Record Day

A party app for Lavanya's birthday. Guests answer a few questions and get a Guinness World Records title to attempt in the sports hall, with a built-in timer, tap counter and result screen.

Live: https://ofb-ib.github.io/lavanya-record-day/

## Change what's on the kit table

Edit `src/data/kit.ts`. A record is only offered if every item it needs is in that list. Pushing to `main` redeploys the site in about a minute.

## Party book database

Guests add the record they are attempting and paste the requirements Guinness sent them. Entries are stored in a Supabase table so every phone shares one book.

1. Create a free project at supabase.com.
2. Run `supabase/schema.sql` in its SQL editor.
3. In this repo's Settings, under Secrets and variables, then Actions, then Variables, add `VITE_SUPABASE_URL` (the project URL) and `VITE_SUPABASE_KEY` (the publishable, or anon, key).
4. Re-run the deploy workflow.

Until then, entries are saved on each guest's phone only.

## The records

`src/data/records.json` holds 531 records, checked against guinnessworldrecords.com in September 2026. Rules are plain-English summaries, not Guinness's official guidelines.

Just for fun. Not affiliated with Guinness World Records.
