# encoding: utf-8
require_relative 'png'
DIR  = File.dirname(__FILE__)
MODE = ARGV[0] || 'out'          # 'mask' to preview the selection, else recolour

img = Png.read(File.join(DIR, 'src.png'))
w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]

X_MIN  = 640           # everything left of this is the other woman
S_FULL = 0.62
S_SOFT = 0.46
V_MIN  = 0.16

# Her lips fall in the same hue band and the strap tip touches the corner of her
# mouth, so they land in one connected blob and neither size nor hue separates
# them. Per-row mapping puts the strap's right edge at x<=858 through this whole
# y band, so the box starts at 859 and takes the lips without clipping fabric.
LIPS = { x0: 859, x1: 902, y0: 540, y1: 594 }

MIN_BLOB = 400         # drops stray specks at the red/skin contrast edges

# A pixel that is light AND weakly saturated is never a fabric blend - both
# fabric and skin are saturated enough that any mix of them stays saturated.
# This protects the pale blue logo on the bra and on the shorts.
def logo?(s, v) v > 0.70 && s < 0.55 end

NEW_HUE = 22.0         # brown
SAT_MUL = 0.50
VAL_MUL = 0.44

def hue_in(hh, lo, hi)
  lo > hi ? (hh >= lo || hh <= hi) : (hh >= lo && hh <= hi)
end

def ramp(v, a, b)
  return 0.0 if v <= a
  return 1.0 if v >= b
  t = (v - a) / (b - a)
  t * t * (3 - 2 * t)                     # smoothstep, so edges do not stair-step
end

# Degrees outside the core 338-358 band, wrapping through 360.
def hue_dist(hh)
  return 0.0 if hue_in(hh, 338.0, 358.0) || hh > 358.0
  if    hh <= 60.0  then hh + 2.0
  elsif hh >= 300.0 then 338.0 - hh
  else 99.0
  end
end

def skip_lips?(x, y) x >= LIPS[:x0] && x < LIPS[:x1] && y >= LIPS[:y0] && y < LIPS[:y1] end

hsv = Array.new(w * h)
h.times do |y|
  row = rows[y]
  (X_MIN...w).each do |x|
    o = x * ch
    hsv[y * w + x] = Png.rgb_to_hsv(row.getbyte(o), row.getbyte(o + 1), row.getbyte(o + 2))
  end
end

# --- pass 1: conservative core ----------------------------------------------
# Tight hue window, wide enough for lit fabric and narrow enough to keep skin
# (hue 20-24) and the orange watch (hue 25) out. This is only used to locate the
# garment, not to paint it.
core = Array.new(w * h, false)
h.times do |y|
  (X_MIN...w).each do |x|
    i = y * w + x
    next if skip_lips?(x, y)
    hh, s, v = hsv[i]
    next if v < V_MIN
    next if (1.0 - ramp(hue_dist(hh), 0.0, 8.0)) * ramp(s, S_SOFT, S_FULL) < 0.5
    core[i] = true
  end
end

# --- pass 2: how enclosed by garment is each pixel? --------------------------
R  = 5
ii = Array.new((w + 1) * (h + 1), 0)
h.times do |y|
  ro = (y + 1) * (w + 1); po = y * (w + 1); run = 0
  w.times do |x|
    run += 1 if core[y * w + x]
    ii[ro + x + 1] = ii[po + x + 1] + run
  end
end
enclosure = lambda do |x, y|
  x0 = [x - R, 0].max; x1 = [x + R + 1, w].min
  y0 = [y - R, 0].max; y1 = [y + R + 1, h].min
  s = ii[y1 * (w + 1) + x1] - ii[y0 * (w + 1) + x1] - ii[y1 * (w + 1) + x0] + ii[y0 * (w + 1) + x0]
  s.to_f / ((x1 - x0) * (y1 - y0))
end

# --- pass 3: weight, with a hue window that opens up inside the garment ------
# Lit fabric actually runs past 360 to hue 0-5, and in the deep shadow under her
# arm it warms all the way to hue 17 at saturation 0.97. Both overlap skin, so
# the window cannot simply be widened: an overlay showed the high-saturation
# orange elsewhere in the frame is skin (arm rim, thigh edge, ear). Enclosure is
# what separates them - fabric shadow sits inside the garment, every skin
# false-positive sits on a rim with open space beside it.
wt = Array.new(w * h, 0.0)
h.times do |y|
  (X_MIN...w).each do |x|
    i = y * w + x
    next if skip_lips?(x, y)
    hh, s, v = hsv[i]
    next if v < V_MIN
    sw = ramp(s, S_SOFT, S_FULL)
    next if sw <= 0.01
    wide = ramp(enclosure.call(x, y), 0.55, 0.80)
    a = (1.0 - ramp(hue_dist(hh), 22.0 * wide, 8.0 + 26.0 * wide)) * sw
    wt[i] = a if a > 0.01
  end
end

# --- pass 4: drop specks -----------------------------------------------------
label = Array.new(w * h, 0)
kill  = []
NB = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]].freeze
(0...h).each do |y|
  (X_MIN...w).each do |x|
    i = y * w + x
    next if wt[i].zero? || !label[i].zero?
    id = kill.length + 1
    stack = [i]; label[i] = id; members = [i]
    until stack.empty?
      jy, jx = stack.pop.divmod(w)
      NB.each do |dx, dy|
        nx = jx + dx; ny = jy + dy
        next if nx < X_MIN || nx >= w || ny < 0 || ny >= h
        k = ny * w + nx
        next if wt[k].zero? || !label[k].zero?
        label[k] = id; stack << k; members << k
      end
    end
    kill << members if members.length < MIN_BLOB
  end
end
dropped = kill.sum(&:length)
kill.each { |m| m.each { |i| wt[i] = 0.0 } }

# --- pass 5: kill the red halo -----------------------------------------------
# Anti-aliased pixels on the garment edge are a blend of fabric and skin, so
# they land near hue 0-15 at middling saturation and fall out of pass 3, leaving
# a red outline. They are only ever a few pixels from solid fabric, so proximity
# is what makes the wider hue window safe here.
HALO_R = 3
dist  = Array.new(w * h, 0)
front = []
wt.each_with_index { |a, i| front << i if a >= 0.5 }
seed = front.to_h { |i| [i, true] }
(1..HALO_R).each do |d|
  nxt = []
  front.each do |j|
    jy, jx = j.divmod(w)
    NB.each do |dx, dy|
      nx = jx + dx; ny = jy + dy
      next if nx < X_MIN || nx >= w || ny < 0 || ny >= h
      k = ny * w + nx
      next if seed[k] || !dist[k].zero?
      dist[k] = d; nxt << k
    end
  end
  front = nxt
end

haloed = 0
h.times do |y|
  (X_MIN...w).each do |x|
    i = y * w + x
    d = dist[i]
    next if d.zero? || skip_lips?(x, y)
    hh, s, v = hsv[i]
    next if v < V_MIN || logo?(s, v)
    hw = if hue_in(hh, 330.0, 12.0) then 1.0
         elsif hh > 12.0 && hh < 24.0 then 1.0 - ramp(hh, 12.0, 24.0)
         elsif hh < 330.0 && hh > 310.0 then 1.0 - ramp(330.0 - hh, 0.0, 20.0)
         else 0.0
         end
    a = hw * ramp(s, 0.28, 0.55) * (1.0 - (d - 1).to_f / HALO_R) * 0.9
    if a > wt[i]
      haloed += 1 if wt[i].zero?
      wt[i] = a
    end
  end
end

# --- pass 6: paint -----------------------------------------------------------
changed = 0
h.times do |y|
  row = rows[y]
  (X_MIN...w).each do |x|
    i = y * w + x
    a = wt[i]
    next if a.zero?
    o = x * ch
    r = row.getbyte(o); g = row.getbyte(o + 1); b = row.getbyte(o + 2)
    if MODE == 'mask'
      nr, ng, nb = 0, 255, 0
    else
      _hh, s, v = hsv[i]
      nr, ng, nb = Png.hsv_to_rgb(NEW_HUE, s * SAT_MUL, v * VAL_MUL)
    end
    row.setbyte(o,     (r * (1 - a) + nr * a).round)
    row.setbyte(o + 1, (g * (1 - a) + ng * a).round)
    row.setbyte(o + 2, (b * (1 - a) + nb * a).round)
    changed += 1
  end
end

name = MODE == 'mask' ? 'mask.png' : 'brown.png'
Png.write(File.join(DIR, name), img)
puts "#{changed} px painted (#{haloed} halo), #{dropped} dropped -> #{name}"
