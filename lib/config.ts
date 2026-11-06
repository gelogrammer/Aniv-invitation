// ---- Edit these to personalize the invitation ----
export const config = {
  herName: "My love", // e.g. "Hi Bea"
  from: "Angelo",
  cakeDate: "2026-12-05T00:00:00+08:00", // Manila time — the countdown counts to this
  cakeTime: "", // optional, e.g. "2:00 PM"
  churchTime: "6:00 PM",
  dinnerTime: "", // optional, e.g. "7:00 PM"
  // Background music. Leave empty for the built-in music box, or put your song in
  // public/music/ and set e.g. "music/our-song.mp3"
  musicFile: "",
};

const mapsSearch = (q: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
const mapsEmbed = (q: string) => `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=17&output=embed`;

export const SEOUL_SKY = {
  name: "Seoul Sky Restaurant",
  address: "Eastwood City, Libis, Quezon City",
  link: mapsSearch("Seoul Sky Restaurant Eastwood City Quezon City"),
  embed: mapsEmbed("Seoul Sky Restaurant Eastwood City Quezon City"),
};

// Where she said yes. Change the map search if the pin lands in the wrong place.
export const CHURCH = {
  name: "Sunday service at Shangri-La",
  address: "Shangri-La Plaza, Mandaluyong City",
  link: mapsSearch("Shangri-La Plaza Mandaluyong"),
  embed: mapsEmbed("Shangri-La Plaza Mandaluyong"),
};

const branch =(key: string, mall: string, address: string, city: string) => {
  const q = `IDIM DIY Bakery ${mall} ${city}`;
  return { key, mall, address, city, link: mapsSearch(q), embed: mapsEmbed(q) };
};

// IDIM DIY Bakery branches she can pick from. The first one is your suggestion.
export const BRANCHES = [
  branch("moa", "SM Mall of Asia", "3/F North Entertainment Mall, SM Mall of Asia", "Pasay City"),
  branch("megamall", "SM Megamall", "4/F Mega Atrium, SM Megamall, Ortigas Center", "Mandaluyong City"),
  branch("north", "SM North EDSA", "Level 2 (Annex L2), SM North EDSA", "Quezon City"),
];

export type Branch = (typeof BRANCHES)[number];

// Empty polaroids she fills in after each date. Each unlocks at the start of its day (Manila time).
export const MEMORIES = [
  { id: "cake", unlocks: "2026-12-05T00:00:00+08:00", date: "Dec 5", caption: "Our cake 🎂" },
  { id: "church", unlocks: "2026-12-06T00:00:00+08:00", date: "Dec 6", caption: "Time with God 🙏" },
  { id: "dinner", unlocks: "2026-12-07T00:00:00+08:00", date: "Dec 7", caption: "One year of us 🍷" },
];

export const SUGGESTED_BRANCH = BRANCHES[0].key;

export const findBranch = (key: unknown) => BRANCHES.find((b) => b.key === key);
