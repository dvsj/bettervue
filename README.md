# bettervue

heres the gist: i made this because Synergy's SIS is just not it. looks like it was designed in 2015, no dark mode, no modern features, no soul. so i built bettervue. it's a studentvue alternative that isn't perfect, but it's a lot better. at least i think so.

---

## what is this?

bettervue is a modern, client-side dashboard that talks to the actual studentvue api (via a proxy, because soap is cursed), grabs your grades, attendance, schedule, health records, and more, and shows it all in a way that doesn't make you want to gouge your eyes out. it's built with next.js, react, tailwind, and a bunch of other stuff that makes it look nice and run fast. everything is rendered client-side, so your data stays in your browser.

---

## how does it work?

when you log in, bettervue sends your credentials to a backend proxy (see [`app/api/studentvue-proxy/route.ts`](app/api/studentvue-proxy/route.ts)), which then talks to the real studentvue soap api. the proxy parses the xml responses and sends back clean json. the frontend (all those dashboard pages) fetches your grades, attendance, schedule, calendar, health info, etc, and displays it in a way that's aesthetically pleasing. all the logic for parsing and displaying your data is in the [`lib/studentvue-api.ts`](lib/studentvue-api.ts) and the dashboard pages.

---

## features

- dark mode
- dashboard with quick stats and recent activity
- grades page: see your current grades, gpa, and courses
- attendance page: see your attendance rate, days present, absences, and recent records
- schedule page: view your class schedule, by term, with teacher info
- profile page: see your personal info, school, grade, contact, and photo
- calendar page: see upcoming events and important dates
- [currently figuring out a bug with this not loading] health records: view immunizations and health conditions
- navigation grid for easy access to everything

---

## to-do

- "what if" grades (will figure it out once gradebook opens up)
- charts
- idk lol email me any ideas at dev@dvsj.xyz

---

## tech stack

- next.js (app router, client-side rendering)
- react
- tailwindcss
- radix-ui, lucide-react, + plenty of other ui libraries
- custom api proxy for studentvue (cus soap)

---

## setup

If you'd like to set this up locally:

1. clone the repo `git clone github.com/dvsj/bettervue`
2. install dependencies: `npm install`
3. `npm run dev` to start the dev server at `localhost:3000`
4. open in browser, log in with your studentvue creds

---

## note

i made this project mostly for me, so it is mainly tailored to my interests n stuff whether it be visual or whatnot. if you would like to use this project, please do so at your own risk; i say so because you may get flagged for multiple requests from an unknown IP address by IT or someone of authority. i'm not sure whether or not they care about this type of thing or not but better safe than sorry. this isn't not super polished, but i think that it's much better than SIS. if you find any bugs please open an issue, and if you want to contribute, please submit a pr (i might not review your pr for a while though as i'm not super active on GH). 

similarly: 

- bettervue is not affiliated with fcps or studentvue. 
- your password is only used to fetch data, never stored.
- if it breaks, its most likely to be an issue on studentvue's end.

---

## screenshots
maybe i'll add some later. just try it out.

---

## license
idk, probably mit.