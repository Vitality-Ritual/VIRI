# Photo recolour — red workout set to brown

Pipeline used on 28 September 2026 to turn the red outfit in the Find your circle
photograph brown. Written from scratch because this machine has only `sips`: no
ImageMagick, no Python/PIL, no AI image editing.

    sips -s format png KerbSet-original-red.webp --out src.png
    ruby -E UTF-8 recolor.rb mask     # green overlay, to check the selection
    ruby -E UTF-8 recolor.rb out      # writes brown.png
    ruby -E UTF-8 cover.rb            # paints out the two logos, in place

`png.rb` is a pure-Ruby PNG reader/writer (8-bit RGB/RGBA, non-interlaced, all
five scanline filters) plus RGB/HSV conversion. `crop.rb src dst x0 y0 x1 y1`
cuts a region out for inspection.

## Why the selection is shaped the way it is

Four things made a plain hue-and-saturation swap fail, and each guard in
`recolor.rb` answers one of them:

- **Her lips** are in the same hue band, and the strap's tip touches the corner
  of her mouth, so they form one connected blob with the garment. Neither hue,
  saturation nor blob size separates them. Mapping the boundary row by row put
  the strap's right edge at x<=858 through the whole band, so the `LIPS` box
  starts at 859 and takes the lips without clipping fabric.
- **Lit fabric runs past 360 to hue 0-5**, just outside a naive window, so those
  pixels got partial weight and kept their red as blocky artifacts.
- **Deep shadow under her arm** warms to hue 17 at saturation 0.97. That hue
  also covers skin, and an overlay showed the high-saturation orange elsewhere
  in the frame *is* skin: arm rim, thigh edge, ear. So the hue window cannot
  simply be widened. It opens up only where a pixel is enclosed by garment -
  fabric shadow sits inside the garment, every skin false-positive sits on a rim.
- **A red halo** outlined every edge, from anti-aliased pixels blending fabric
  with skin. Those are never more than a few pixels from solid fabric, which is
  what makes a wider hue window safe there.

`cover.rb` treats each logo as a hole in the recoloured region and flood-fills
inward from a padded window, which is what tells the logo apart from skin and
background. The patch then grows only onto already-recoloured pixels - painted
means fabric, so it cannot spread onto her arm - and the fill is harmonic
diffusion, so it picks up the fabric's shading gradient instead of flat colour.

## Rights

Recolouring does not change the rights position. This is still third-party
photography and unlicensed, like the rest of the imagery on the site.
