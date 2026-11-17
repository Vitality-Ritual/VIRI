# encoding: utf-8
# Builds instagram/to-post-b2/: batch 2 (her photos 12-20 = posts 1-9), one post a day,
# Sat Nov 21 - Sun Nov 29 (straight after batch 1 ends Fri Nov 20). Carousels on posts 3, 4, 9.
#   ruby instagram/make-to-post-b2.rb
require 'fileutils'
IG = __dir__
OUT = File.join(IG, 'to-post-b2')
FileUtils.rm_rf(OUT); FileUtils.mkdir_p(OUT)
jpg = ->(src, dst) { system('sips', '-s', 'format', 'jpeg', '-s', 'formatOptions', '92', src, '--out', dst, out: File::NULL) }
SUN = "A new edit every Sunday, link in bio.\n\n📷 via Pinterest"
POSTS = [
  ['Sat-Nov21', :photo, 'b2-01', 'dark stone building', "Weekend plan: wander somewhere old and beautiful.\n\n#{SUN}"],
  ['Sun-Nov22', :photo, 'b2-02', 'journal flat lay (the Type A cover)',
   "New on the VIRI Edit: Confessions of a Type A Girl, Part 1. What happens when your plan only works on a perfect day.\n\nRead it at the link in bio.\n\n📷 via Pinterest"],
  ['Mon-Nov23', :carousel, 'b2-post-03-quiz', 'Which winter arc are you?'],
  ['Tue-Nov24', :carousel, 'b2-post-04-printable', 'The free winter arc printable'],
  ['Wed-Nov25', :photo, 'b2-05', 'gallery of paintings', "A slow afternoon in the galleries.\n\n#{SUN}"],
  ['Thu-Nov26', :photo, 'b2-06', 'bookshelf and white roses', "Grateful for slow mornings and full shelves. Happy Thanksgiving!\n\n#{SUN}"],
  ['Fri-Nov27', :photo, 'b2-07', 'perfume and sunglasses', "Cozy season, in the details.\n\n#{SUN}"],
  ['Sat-Nov28', :photo, 'b2-08', 'pale stone townhouse', "Saturday walks through the city.\n\n#{SUN}"],
  ['Sun-Nov29', :carousel, 'b2-post-09-type-a', 'Confessions of a Type A girl'],
]
caps = []
POSTS.each_with_index do |(date, kind, key, name, cap), i|
  pre = format('%02d-%s', i + 1, date)
  if kind == :carousel
    dir = File.join(IG, 'carousels', key)
    Dir[File.join(dir, 'slide-*.png')].sort.each_with_index { |f, k| jpg.(f, File.join(OUT, "#{pre}-carousel-slide#{k + 1}.jpg")) }
    caps << "#{pre} · CAROUSEL (#{name})\n\n#{File.read(File.join(dir, 'caption.txt'), encoding: 'utf-8')}"
  else
    FileUtils.cp(File.join(IG, 'carousels', 'photos', "#{key}.jpg"), File.join(OUT, "#{pre}-photo.jpg"))
    caps << "#{pre} · PHOTO (#{name})\n\n#{cap}"
  end
end
FileUtils.mkdir_p(File.join(OUT, 'stories'))
FileUtils.cp(File.join(IG, 'stories', 'story-5-type-a.jpg'), File.join(OUT, 'stories', 'now-story-type-a.jpg'))
FileUtils.cp(File.join(IG, 'stories', 'story-4-printable.jpg'), File.join(OUT, 'stories', 'Tue-Nov24-story-printable.jpg'))
links = <<-L
LINK STICKERS FOR STORIES
Type A story (post now, and again Sun Nov 22): https://vitalityritual.org/read/type-a-confessions/?from=igstory
Printable story (Tue Nov 24, with the carousel): https://vitalityritual.org/printable/?from=igstory
L
File.write(File.join(OUT, 'CAPTIONS.txt'), caps.join("\n\n" + ('-' * 40) + "\n\n") + "\n\n" + ('=' * 40) + "\n\n" + links)
puts Dir[File.join(OUT, '**', '*')].reject { |f| File.directory?(f) }.size.to_s + ' files'
