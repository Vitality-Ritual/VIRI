# encoding: utf-8
require_relative 'png'
DIR = File.dirname(__FILE__)
src = Png.read(File.join(DIR, 'src.png'))
out = Png.read(File.join(DIR, 'brown.png'))
w, h, ch = out[:w], out[:h], out[:ch]
so, oo = src[:rows], out[:rows]

# The recolour painted every fabric pixel, so the logo is a hole in the painted
# region. Flood-filling inward from the edge of a padded window separates that
# hole from skin and background, which are reachable from the window border.
# The patch then grows only onto painted pixels, and since painted means fabric
# it can never spread onto her arm - the earlier attempts either missed the
# lightened anti-aliased ring or bled into her forearm.
BOXES = [[838, 724, 884, 756], [942, 890, 982, 922]]
PAD   = 30
GROW  = 5

painted = Array.new(w * h, false)
h.times do |y|
  w.times do |x|
    o = x * ch
    painted[y * w + x] = (0...3).any? { |k| so[y].getbyte(o + k) != oo[y].getbyte(o + k) }
  end
end

mask = Array.new(w * h, false)
BOXES.each do |bx0, by0, bx1, by1|
  wx0 = [bx0 - PAD, 0].max; wx1 = [bx1 + PAD, w].min
  wy0 = [by0 - PAD, 0].max; wy1 = [by1 + PAD, h].min

  outside = {}
  queue = []
  (wx0...wx1).each do |x|
    [wy0, wy1 - 1].each { |y| i = y * w + x; next if painted[i] || outside[i]; outside[i] = true; queue << i }
  end
  (wy0...wy1).each do |y|
    [wx0, wx1 - 1].each { |x| i = y * w + x; next if painted[i] || outside[i]; outside[i] = true; queue << i }
  end
  until queue.empty?
    jy, jx = queue.pop.divmod(w)
    [[-1,0],[1,0],[0,-1],[0,1]].each do |dx, dy|
      nx = jx + dx; ny = jy + dy
      next if nx < wx0 || nx >= wx1 || ny < wy0 || ny >= wy1
      k = ny * w + nx
      next if painted[k] || outside[k]
      outside[k] = true; queue << k
    end
  end

  found = []
  (wy0...wy1).each do |y|
    (wx0...wx1).each do |x|
      i = y * w + x
      found << [x, y] if !painted[i] && !outside[i]
    end
  end
  next if found.empty?
  xs = found.map(&:first); ys = found.map(&:last)
  puts format('logo core x %d..%d  y %d..%d  (%d px)', xs.min, xs.max, ys.min, ys.max, found.length)
  found.each { |(x, y)| mask[y * w + x] = true }
end

GROW.times do
  add = []
  h.times do |y|
    w.times do |x|
      i = y * w + x
      next if mask[i] || !painted[i]                 # painted means fabric, so this stays off skin
      add << i if [[-1,0],[1,0],[0,-1],[0,1]].any? { |dx, dy| mask[(y + dy) * w + (x + dx)] }
    end
  end
  add.each { |i| mask[i] = true }
end
puts "#{mask.count(true)} px to cover"

# harmonic inpaint: each masked pixel relaxes to the mean of its 4 neighbours,
# so the patch takes the surrounding fabric's gradient instead of a flat fill
todo = []
h.times { |y| w.times { |x| todo << (y * w + x) if mask[y * w + x] } }
buf = (0...3).map { |k| todo.to_h { |i| y, x = i.divmod(w); [i, oo[y].getbyte(x * ch + k).to_f] } }
sample = lambda do |k, i|
  return buf[k][i] if mask[i]
  y, x = i.divmod(w)
  oo[y].getbyte(x * ch + k).to_f
end
1500.times do
  3.times do |k|
    nxt = {}
    todo.each { |i| nxt[i] = (sample.call(k, i - 1) + sample.call(k, i + 1) +
                              sample.call(k, i - w) + sample.call(k, i + w)) / 4.0 }
    buf[k] = nxt
  end
end
todo.each { |i| y, x = i.divmod(w); 3.times { |k| oo[y].setbyte(x * ch + k, buf[k][i].round.clamp(0, 255)) } }

Png.write(File.join(DIR, 'brown.png'), out)
puts 'covered -> brown.png'
