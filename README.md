# Barnyard Uprising

A first-person shooter that runs in the browser, set in the Wilmas Farm neighborhood of Chesterfield, Missouri. The animals of the old farm want their land back, and you defend the yard with a pistol, a pump shotgun, a machine gun and grenades.

## The map
The street layout is the real one: Wilmas Farm Drive, Wilmas Hollow Drive, Wilmas Valley Court and Wild Horse Creek Road, taken from [OpenStreetMap](https://www.openstreetmap.org/copyright) (© OpenStreetMap contributors, ODbL). It's scaled to about a third of real distances so the area fits a playable arena. Houses are generic stylized homes placed lot by lot along the streets. They are not copies of the real homes, and their positions are approximate. Animals come down the streets and out of the surrounding woods.

Open `index.html` in a browser. Three.js loads from a CDN, so you need an internet connection.

## Controls
- **WASD**: move. **Shift**: sprint. **Space**: jump.
- **Mouse**: aim. **Click**: fire. Headshots do double damage.
- **1 / 2 / 3** or the **mouse wheel**: switch between pistol, shotgun and machine gun.
- **G** or **right click**: throw a grenade.
- **F**: call a missile strike where you're aiming.
- **R**: reload. **Esc / P**: pause.
- On touch screens, use the left thumb stick to move, drag on the right side to aim, and hold FIRE to shoot. SWAP changes guns, GREN throws a grenade and AIR calls a missile strike.

## Weapons
| Weapon | Magazine | Notes |
|---|---|---|
| Ranch pistol | 12 | Semi-automatic and accurate. Good for headshots at range. |
| 12-gauge pump | 6 | Fires 9 pellets. Deadly up close; reloads one shell at a time. |
| Harvester machine gun | 40 | Fully automatic. Less accurate while you're moving. |
| Grenade | 5 max | Bounces, then explodes after about 2 seconds. Hurts you too if you're close. |

You start each game with 3 grenades. Clearing a wave gives you 1 more, and pigs, cows and the bull sometimes drop grenades (green squares on the radar).

## Missile strikes
Press **F** to mark the spot you're aiming at with red smoke. About 1.3 seconds later, three missiles hit in and around the marker. Each blast covers about 10 m and can badly hurt the bull. Missiles hurt you too, so call them in away from yourself.

You start with 1 strike and can hold up to 2. Kills fill the strike meter: chicken 1 point, pig 2, cow 4, bull 15. Every 30 points earns another strike.

## Enemies
| Animal | Notes |
|---|---|
| Chicken | Fast and zig-zags. One pellet kills it. |
| Pig | Sturdy and bites hard. |
| Cow | Slow, but it has lots of health and hits hard. |
| Bull | Boss on every 5th wave. It paws the ground, then charges. |

Kill animals quickly to build a combo multiplier (up to x5). Eggs restore 20 health. Golden eggs from the bull restore all of it.

---

# Deep Cut

A separate daily word game in `deep-cut/index.html`. Open the file in a browser to play; it works offline (only the fonts load from the web).

- Each day gives you **7 prompts**, such as "Name a breed of dog", with **20 seconds** each to type one answer.
- **The rarer your answer, the deeper you dig.** Answers are grouped into strata: Topsoil 10 m, Clay 25 m, Shale 40 m, Bedrock 60 m, Magma 80 m.
- Every prompt hides one **Mother Lode** (120 m), a satisfying answer some players will find.
- Guesses that aren't on the list don't use up your turn. Small typos and common alternative names are accepted.
- **Practice shaft** gives endless random prompts. Your streak, best depth and Mother Lodes found are saved in your browser.

There is no server. The popularity figures ("X diggers picked this") are estimated from a built-in ranking of each answer list. To add prompts, edit the `PROMPTS` array: answers are listed from most to least common, `|` separates alternative names and `*` marks the Mother Lode.
