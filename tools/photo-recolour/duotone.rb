# encoding: utf-8
require_relative 'png'
DIR = File.dirname(__FILE__)
img = Png.read(File.join(DIR, 'pair_src.png'))
w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]

# A warm duotone rather than a CSS filter. The picture is true black-and-white,
# and sepia() over grey gives a flat wash; mapping luminance between two brand
# tones keeps the contrast and puts the whole thing in the palette. The
# highlight is a shade off --paper so the studio wall sits with the cream page,
# and the shadow is warmer than pure black so the blacks are not a cold hole.
SHADOW    = [46, 37, 29]      # #2E251D
HIGHLIGHT = [246, 242, 235]   # #F6F2EB
CONTRAST  = 1.05              # a touch of punch back after the compression

h.times do |y|
  row = rows[y]
  w.times do |x|
    o = x * ch
    l = (0.299 * row.getbyte(o) + 0.587 * row.getbyte(o + 1) + 0.114 * row.getbyte(o + 2)) / 255.0
    l = ((l - 0.5) * CONTRAST + 0.5).clamp(0.0, 1.0)
    3.times { |c| row.setbyte(o + c, (SHADOW[c] + (HIGHLIGHT[c] - SHADOW[c]) * l).round.clamp(0, 255)) }
  end
end
Png.write(File.join(DIR, 'pair_toned.png'), img)
puts 'pair_toned.png written'
