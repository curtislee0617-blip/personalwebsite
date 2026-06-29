# Curtis Lee — Personal Website

A responsive personal website built with Next.js App Router, TypeScript, and Tailwind CSS.

## Development

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

The content, contact form, external links, and CV download are placeholders. No database or backend features are included.

## Background photos

Add `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, or `.gif` files to `public/photos`. The homepage discovers them during the build, places them in a deterministic shuffled order, and scrolls the portrait 3:4 grid continuously behind the main navigation.

Images can use any source dimensions. Each image is center-cropped evenly to fill its portrait 3:4 tile without stretching or distortion.

Run `npm run photos:optimize` after adding a batch. It creates 450×600 WebP copies for the collage and moves the originals into the git-ignored `.photo-originals` backup folder.

Add `profile.jpg`, `profile.jpeg`, `profile.png`, `profile.webp`, or `profile.avif` directly inside `public` to use it as the center portrait. It is automatically centered and cropped into the circular frame.

Caltech and UC Davis logo tiles use deterministic randomized placement. Matching logos stay more than three blocks apart, and different logos stay more than two blocks apart in both desktop and mobile grid arrangements.
