# encoding: utf-8
# Perspective-composite a flat text image onto a quadrilateral in a photograph.
#
# There is no font rasterizer here, so the lettering is rendered in the browser
# and screenshotted as black-on-white; its darkness is read as ink coverage,
# which gives antialiasing for free and needs no alpha channel.
require_relative 'png'

module Warp
  module_function

  # Gaussian elimination with partial pivoting; a[i] is a row of n+1 values.
  def solve(a)
    n = a.length
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
    (n - 1).downto(0) { |i| x[i] = (a[i][n] - (i + 1...n).sum { |j| a[i][j] * x[j] }) / a[i][i] }
    x
  end

  # Homography taking dst quad -> src rectangle, so each destination pixel can
  # look up where it came from. quad and rect are 4 [x,y] in the same order.
  def homography(quad, rect)
    rows = []
    quad.each_with_index do |(x, y), i|
      u, v = rect[i]
      rows << [x, y, 1, 0, 0, 0, -x * u, -y * u, u]
      rows << [0, 0, 0, x, y, 1, -x * v, -y * v, v]
    end
    h = solve(rows)
    raise 'degenerate quad' if h.nil?
    h
  end

  def apply(h, x, y)
    d = h[6] * x + h[7] * y + 1.0
    [(h[0] * x + h[1] * y + h[2]) / d, (h[3] * x + h[4] * y + h[5]) / d]
  end

  def inside?(quad, x, y)
    sign = nil
    4.times do |i|
      ax, ay = quad[i]
      bx, by = quad[(i + 1) % 4]
      cross = (bx - ax) * (y - ay) - (by - ay) * (x - ax)
      next if cross.abs < 1e-9
      s = cross > 0
      return false if !sign.nil? && s != sign
      sign = s
    end
    true
  end

  def bilinear_luma(img, u, v)
    w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]
    return 255.0 if u < 0 || v < 0 || u > w - 1 || v > h - 1
    x0 = u.floor; y0 = v.floor
    x1 = [x0 + 1, w - 1].min; y1 = [y0 + 1, h - 1].min
    fx = u - x0; fy = v - y0
    l = lambda do |xx, yy|
      o = xx * ch
      0.299 * rows[yy].getbyte(o) + 0.587 * rows[yy].getbyte(o + 1) + 0.114 * rows[yy].getbyte(o + 2)
    end
    l.(x0, y0) * (1 - fx) * (1 - fy) + l.(x1, y0) * fx * (1 - fy) +
      l.(x0, y1) * (1 - fx) * fy + l.(x1, y1) * fx * fy
  end

  # Harmonic inpaint over a mask: each masked pixel relaxes to the mean of its
  # four neighbours, so the patch picks up the paper's own gradient.
  def inpaint!(img, mask, iters = 900)
    w, h, ch, rows = img[:w], img[:h], img[:ch], img[:rows]
    todo = []
    h.times { |y| w.times { |x| todo << [x, y] if mask[y * w + x] } }
    return 0 if todo.empty?
    buf = (0...3).map { |c| todo.to_h { |(x, y)| [[x, y], rows[y].getbyte(x * ch + c).to_f] } }
    at = lambda do |c, x, y|
      return 0.0 if x < 0 || y < 0 || x >= w || y >= h
      mask[y * w + x] ? buf[c][[x, y]] : rows[y].getbyte(x * ch + c).to_f
    end
    iters.times do
      3.times do |c|
        nxt = {}
        todo.each { |(x, y)| nxt[[x, y]] =
          (at.(c, x - 1, y) + at.(c, x + 1, y) + at.(c, x, y - 1) + at.(c, x, y + 1)) / 4.0 }
        buf[c] = nxt
      end
    end
    todo.each { |(x, y)| 3.times { |c| rows[y].setbyte(x * ch + c, buf[c][[x, y]].round.clamp(0, 255)) } }
    todo.length
  end
end
