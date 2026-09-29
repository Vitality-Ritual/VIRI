# encoding: utf-8
require_relative 'png'
DIR = File.dirname(__FILE__)
img = Png.read(File.join(DIR, 'nb_src.png'))
w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]
src = rows.map(&:dup)

# Thresholding the ink fails here: the weave's own dark pixels reach a luma
# deficit of ~64 while the ink only reaches ~95, so any cut either leaves
# strokes or eats weave. Instead the whole block is replaced with clean linen
# cloned from elsewhere on the cover.
#
# Picking the donor by luma statistics did not work either - the beige coat
# behind the cover sits in the same luma band as the linen, so "every pixel is
# plain weave" still admitted the cover's lit edge and left a bright seam. This
# donor was chosen by looking at it: x440-572, y235-309 is unbroken weave.
BOX  = { x0: 414, x1: 532, y0: 300, y1: 360 }
DX   = 33
DY   = -58
FEAT = 7
RING = 16          # depth of the band the target's lighting is fitted from

X0, X1 = BOX[:x0] - FEAT, BOX[:x1] + FEAT
Y0, Y1 = BOX[:y0] - FEAT, BOX[:y1] + FEAT
CX, CY = (X0 + X1) / 2.0, (Y0 + Y1) / 2.0
basis = ->(x, y) { u = (x - CX) / 100.0; v = (y - CY) / 100.0
                   [1.0, u, v, u * u, u * v, v * v] }

# least squares by normal equations, 6 unknowns
def solve(samples)
  n = 6
  a = Array.new(n) { Array.new(n + 1, 0.0) }
  samples.each do |(b, z)|
    n.times { |i| n.times { |j| a[i][j] += b[i] * b[j] }; a[i][n] += b[i] * z }
  end
  n.times do |col|
    piv = (col...n).max_by { |r| a[r][col].abs }
    a[col], a[piv] = a[piv], a[col]
    return nil if a[col][col].abs < 1e-12
    (col + 1...n).each do |r|
      f = a[r][col] / a[col][col]
      (col..n).each { |c| a[r][c] -= f * a[col][c] }
    end
  end
  x = Array.new(n, 0.0)
  (n - 1).downto(0) do |i|
    s = a[i][n] - (i + 1...n).sum { |j| a[i][j] * x[j] }
    x[i] = s / a[i][i]
  end
  x
end

fits = (0...3).map do |c|
  # target lighting from the ring around the block, which the ink never touches
  ring = []
  (Y0 - RING...Y1 + RING).each do |y|
    (X0 - RING...X1 + RING).each do |x|
      next if x >= X0 && x < X1 && y >= Y0 && y < Y1
      ring << [basis.call(x, y), src[y].getbyte(x * ch + c).to_f]
    end
  end
  # the donor's own lighting, in the same coordinates so the two fields line up
  don = []
  (Y0...Y1).each do |y|
    (X0...X1).each { |x| don << [basis.call(x, y), src[y + DY].getbyte((x + DX) * ch + c).to_f] }
  end
  t = solve(ring); d = solve(don)
  abort "fit failed on channel #{c}" if t.nil? || d.nil?
  [t, d]
end

ramp = ->(v) { t = v.clamp(0.0, 1.0); t * t * (3 - 2 * t) }
changed = 0
(Y0...Y1).each do |y|
  (X0...X1).each do |x|
    a = [ramp.call((x - X0).to_f / FEAT), ramp.call((X1 - x).to_f / FEAT),
         ramp.call((y - Y0).to_f / FEAT), ramp.call((Y1 - y).to_f / FEAT)].min
    next if a <= 0.004
    b = basis.call(x, y)
    3.times do |c|
      tf, df = fits[c]
      target_light = b.each_with_index.sum { |v, i| v * tf[i] }
      donor_light  = b.each_with_index.sum { |v, i| v * df[i] }
      # keep the donor's weave, swap its lighting for the target's
      repaired = src[y + DY].getbyte((x + DX) * ch + c) - donor_light + target_light
      cur = src[y].getbyte(x * ch + c).to_f
      rows[y].setbyte(x * ch + c, (cur * (1 - a) + repaired * a).round.clamp(0, 255))
    end
    changed += 1
  end
end
Png.write(File.join(DIR, 'nb_clean.png'), img)
puts "#{changed} px replaced -> nb_clean.png"
