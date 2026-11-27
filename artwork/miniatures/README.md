# Ajimi illustrated pantry

Artwork and procedural models by Aidan McFarlane. All ingredient forms, ceramic profiles, surface materials, and lighting in this set were made specifically for Ajimi. They use Blender primitives, authored meshes, and curves. The ingredient miniatures use no third-party textures, models, or photography.

Run Blender in background mode with `--python render.py` to regenerate the editable scene geometry and render masters. Optional ingredient keys follow `--`. The two cookware names are `donabe` and `chawan-m`. The PNG masters are retained in `renders/`. Run `python3 export.py` using Pillow to write the transparent WebP assets to the app’s pantry folder. Blender and Python are authoring dependencies only.

The three animated ingredients use camera views around the same mesh. A media query selects a still image for reduced-motion settings. The other ingredient tiles have subtle CSS motion. Kagawa’s cut garnishes and noodles are individually composited inside the bowl. The actual boiling step reserves both garnishes and shows just the noodles in the cooking pot.
