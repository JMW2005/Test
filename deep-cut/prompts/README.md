# Deep Cut prompt bank

Every question in the game comes from the `.txt` files in this folder. Edit them on github.com and the live game picks up the changes after GitHub Pages republishes, usually within a few minutes.

## Editing on GitHub

1. Open a file here, for example `movies.txt`, and tap the pencil icon.
2. Make your changes using the format below.
3. Tap **Commit changes**.
4. After a few minutes, open `bank.html` on the live site (the "Prompt bank" link at the bottom of the game's home screen). It lists any mistakes with links to the exact line.

## Format

```
## Movies                         <- category for the prompts below it
# Name a Pixar movie               <- a new prompt ("#" then a space)
Toy Story                          <- answers, one per line, MOST common first
Finding Nemo
Monsters, Inc. | monsters inc      <- "|" adds another spelling that also counts
*Luca                              <- "*" marks the Mother Lode (optional)

# Name a Friends character {names} <- {names}: a first or last name alone also counts
Rachel Green
Ross Geller
```

- **Order matters.** The first answer is treated as the most popular, and each answer after it counts as rarer and scores deeper.
- **Each prompt needs at least 5 answers.** If it has fewer, it's left out of the game.
- **Without a `*`,** the game picks a Mother Lode about 70% of the way down the list.
- **You don't need to list spelling variants.** Capitals, punctuation, accents, a leading "The" and small typos are handled automatically. Titles like "Spider-Man: No Way Home" also match "No Way Home", and "Title (2019)" also matches "Title".
- **Hashtags are fine as answers.** A line like `#MeToo` stays an answer, because a prompt needs `#` followed by a space.
- **Comments:** lines starting with `//` are ignored.
- **New files:** add the file name to `_files.txt`, or the game won't load it.

## How the daily game picks prompts

The bank is shuffled into a fixed order based on each prompt's text, and each day takes the next 7. Everyone on the same bank gets the same daily prompts, and nothing repeats until the whole bank has been used. Adding or removing prompts shifts which ones come up on future days.
