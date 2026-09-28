# encoding: utf-8
require_relative 'png'
DIR = File.dirname(__FILE__)
src, out, x0, y0, x1, y1 = ARGV[0], ARGV[1], *ARGV[2, 4].map(&:to_i)
img = Png.read(File.join(DIR, src))
ch = img[:ch]
rows = (y0...y1).map { |y| img[:rows][y].byteslice(x0 * ch, (x1 - x0) * ch) }
Png.write(File.join(DIR, out), { w: x1 - x0, h: y1 - y0, ch: ch, rows: rows })
puts "#{out}: #{x1 - x0}x#{y1 - y0}"
