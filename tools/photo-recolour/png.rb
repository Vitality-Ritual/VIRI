# encoding: utf-8
# Minimal PNG read/write for 8-bit RGB / RGBA, non-interlaced.
require 'zlib'

module Png
  module_function

  def read(path)
    data = File.binread(path)
    raise 'not a png' unless data[0, 8] == "\x89PNG\r\n\x1a\n".b
    pos = 8
    idat = ''.b
    w = h = depth = ctype = nil
    while pos < data.bytesize
      len  = data[pos, 4].unpack1('N')
      type = data[pos + 4, 4]
      body = data[pos + 8, len]
      case type
      when 'IHDR'
        w, h, depth, ctype, _comp, _filt, inter = body.unpack('NNCCCCC')
        raise "unsupported: depth #{depth} ctype #{ctype} interlace #{inter}" unless depth == 8 && [2, 6].include?(ctype) && inter == 0
      when 'IDAT' then idat << body
      when 'IEND' then break
      end
      pos += 12 + len
    end
    ch  = ctype == 2 ? 3 : 4
    raw = Zlib::Inflate.inflate(idat)
    stride = w * ch
    px = Array.new(h) { String.new(capacity: stride) }
    prev = ("\0" * stride).b
    off = 0
    h.times do |y|
      ft   = raw.getbyte(off); off += 1
      line = raw.byteslice(off, stride).dup; off += stride
      unfilter!(line, prev, ft, ch)
      px[y] = line
      prev = line
    end
    { w: w, h: h, ch: ch, rows: px }
  end

  def unfilter!(line, prev, ft, bpp)
    return if ft == 0
    n = line.bytesize
    i = 0
    while i < n
      a = i >= bpp ? line.getbyte(i - bpp) : 0
      b = prev.getbyte(i)
      c = i >= bpp ? prev.getbyte(i - bpp) : 0
      x = line.getbyte(i)
      v = case ft
          when 1 then x + a
          when 2 then x + b
          when 3 then x + ((a + b) >> 1)
          when 4
            p = a + b - c
            pa = (p - a).abs; pb = (p - b).abs; pc = (p - c).abs
            x + (pa <= pb && pa <= pc ? a : (pb <= pc ? b : c))
          else raise "bad filter #{ft}"
          end
      line.setbyte(i, v & 0xff)
      i += 1
    end
  end

  def write(path, img)
    ihdr = [img[:w], img[:h], 8, img[:ch] == 3 ? 2 : 6, 0, 0, 0].pack('NNCCCCC')
    raw = ''.b
    img[:rows].each { |r| raw << "\0".b << r }
    out = "\x89PNG\r\n\x1a\n".b
    out << chunk('IHDR', ihdr)
    out << chunk('IDAT', Zlib::Deflate.deflate(raw, 6))
    out << chunk('IEND', ''.b)
    File.binwrite(path, out)
  end

  def chunk(type, body)
    [body.bytesize].pack('N') + type + body + [Zlib.crc32(type + body)].pack('N')
  end

  # HSV helpers, h in degrees 0..360, s/v in 0..1
  def rgb_to_hsv(r, g, b)
    rf = r / 255.0; gf = g / 255.0; bf = b / 255.0
    mx = [rf, gf, bf].max; mn = [rf, gf, bf].min
    d = mx - mn
    h = if d.zero? then 0.0
        elsif mx == rf then 60 * (((gf - bf) / d) % 6)
        elsif mx == gf then 60 * (((bf - rf) / d) + 2)
        else 60 * (((rf - gf) / d) + 4)
        end
    [h, mx.zero? ? 0.0 : d / mx, mx]
  end

  def hsv_to_rgb(h, s, v)
    h %= 360
    c = v * s
    x = c * (1 - ((h / 60.0) % 2 - 1).abs)
    m = v - c
    r, g, b = case (h / 60).floor
              when 0 then [c, x, 0] when 1 then [x, c, 0] when 2 then [0, c, x]
              when 3 then [0, x, c] when 4 then [x, 0, c] else [c, 0, x] end
    [((r + m) * 255).round.clamp(0, 255),
     ((g + m) * 255).round.clamp(0, 255),
     ((b + m) * 255).round.clamp(0, 255)]
  end
end
