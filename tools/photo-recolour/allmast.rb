# encoding: utf-8
require_relative 'png'
require_relative 'warp'
DIR = File.dirname(__FILE__)

# Quads clockwise from the top-left of the lettering, in source pixels.
INSTANCES = [
  { name: 'main',   quad: [[534,339],[648,356],[648,381],[534,364]], text: 'txt_one.png' },
  { name: 'topleft',quad: [[188,517],[263,516],[263,528],[188,529]], text: 'txt_one.png' },
  # The three props below carry the same masthead at 40-60px, steeply rotated
  # and soft. Setting type into them convincingly needs corner accuracy the
  # blur does not give, and a misaligned wordmark reads as a smudge - so the
  # old lettering comes off and the paper is left blank, which is what a
  # background prop looks like anyway at this size.
  { name: 'leftrot', quad: [[9,640],[45,621],[52,634],[16,653]],     remove: true },
  { name: 'leftrot2',quad: [[47,616],[60,593],[71,599],[58,622]],    remove: true },
  { name: 'bookR',   quad: [[503,855],[557,855],[557,914],[503,914]], remove: true },
  { name: 'bookC',   quad: [[266,962],[326,962],[326,1018],[266,1018]], remove: true },
]

img = Png.read(File.join(DIR, ARGV[0] || 'news_src.png'))
w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]
luma = ->(x, y) { o = x * ch
  0.299*rows[y].getbyte(o) + 0.587*rows[y].getbyte(o+1) + 0.114*rows[y].getbyte(o+2) }

INSTANCES.each do |inst|
  txt  = inst[:remove] ? nil : Png.read(File.join(DIR, inst[:text]))
  quad = inst[:quad].map { |(x, y)| [x.to_f, y.to_f] }
  xs = quad.map(&:first); ys = quad.map(&:last)
  x0, x1 = xs.min.floor, xs.max.ceil
  y0, y1 = ys.min.floor, ys.max.ceil

  vals = []
  (y0..y1).each { |y| (x0..x1).each { |x| vals << luma.(x, y) if Warp.inside?(quad, x, y) } }
  vals.sort!
  paper = vals[(vals.length * 0.82).floor]
  inkl  = vals[(vals.length * 0.03).floor]
  cut   = paper - (paper - inkl) * 0.20

  ink = [0, 0, 0]; n = 0
  mask = Array.new(w * h, false)
  (y0..y1).each do |y|
    (x0..x1).each do |x|
      next unless Warp.inside?(quad, x, y) && luma.(x, y) < cut
      mask[y * w + x] = true
      o = x * ch
      3.times { |c| ink[c] += rows[y].getbyte(o + c) }
      n += 1
    end
  end
  if n.zero?
    puts "#{inst[:name]}: no ink found, skipped"
    next
  end
  ink = ink.map { |v| (v / n.to_f).round }

  3.times do                                  # cover the antialiased stroke edge
    add = []
    (y0 - 3..y1 + 3).each do |y|
      (x0 - 3..x1 + 3).each do |x|
        i = y * w + x
        next if mask[i]
        add << i if [[-1,0],[1,0],[0,-1],[0,1]].any? { |dx, dy| mask[(y+dy)*w + (x+dx)] }
      end
    end
    add.each { |i| mask[i] = true }
  end
  wiped = Warp.inpaint!(img, mask, 450)
  if inst[:remove]
    puts "%s: wiped %d px, left blank" % [inst[:name], wiped]
    next
  end

  tw, th = txt[:w].to_f, txt[:h].to_f
  qw = Math.hypot(quad[1][0]-quad[0][0], quad[1][1]-quad[0][1])
  qh = Math.hypot(quad[3][0]-quad[0][0], quad[3][1]-quad[0][1])
  want = qh * (tw / th)
  if want < qw
    t = (1.0 - want / qw) / 2.0
    lerp = ->(a, b, f) { [a[0] + (b[0]-a[0])*f, a[1] + (b[1]-a[1])*f] }
    quad = [lerp.(quad[0], quad[1], t), lerp.(quad[1], quad[0], t),
            lerp.(quad[2], quad[3], t), lerp.(quad[3], quad[2], t)]
  end

  hom = Warp.homography(quad, [[0.0,0.0],[tw-1,0.0],[tw-1,th-1],[0.0,th-1]])
  xs = quad.map(&:first); ys = quad.map(&:last)
  painted = 0
  (ys.min.floor..ys.max.ceil).each do |y|
    (xs.min.floor..xs.max.ceil).each do |x|
      next unless Warp.inside?(quad, x, y)
      u, v = Warp.apply(hom, x, y)
      cov = 1.0 - Warp.bilinear_luma(txt, u, v) / 255.0
      next if cov <= 0.004
      o = x * ch
      3.times { |c| rows[y].setbyte(o + c,
        (rows[y].getbyte(o + c) * (1 - cov) + ink[c] * cov).round.clamp(0, 255)) }
      painted += 1
    end
  end
  puts "#{inst[:name]}: wiped #{wiped}, drew #{painted} (ink #{ink.join(',')})"
end

Png.write(File.join(DIR, ARGV[1] || 'news_out.png'), img)
puts "-> #{ARGV[1] || 'news_out.png'}"
