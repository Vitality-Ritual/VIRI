# encoding: utf-8
# Batch 2 carousels (posts Nov 23 - Dec 1): post 3 quiz, post 4 printable, post 9 = her new article (later).
# Uses make-carousels.rb's slide templates. Output: carousels/b2-post-NN-<id>/slide-NN.png + caption.txt
#   ruby instagram/batch2/make-b2-carousels.rb [quiz] [printable]
require 'fileutils'
IGD = File.expand_path('..', __dir__)
src = File.read(File.join(IGD, 'make-carousels.rb'), encoding: 'UTF-8')
eval(src[0...src.index('only = ARGV')].sub("require_relative 'posts-data'", "require File.join('#{IGD}', 'posts-data')").gsub('__dir__', "'#{IGD}'"), binding)
B2 = [
  { id: 'quiz', post: 3, photo: 'b2-03', tone: :dark, cover: ['Which winter arc', 'are you?'],
    slides: [
      ['ARC 01', 'The Quiet Reset', 'Your winter arc is about rest, not more. Slow mornings, long walks, phone in the other room.'],
      ['ARC 02', 'The Comeback Arc', 'Your winter arc is about getting back to it. Workout clothes on the minute you wake up.'],
      ['ARC 03', 'The Builder', 'Your winter arc is about the idea in your notes app. One protected hour a week.'],
      ['ARC 04', 'The Soft Discipline', 'Your winter arc is about routines that hold you. A weekly reset, every Sunday.'],
      ['', 'Not sure which one is you?', 'Six quick questions. One minute.'],
    ],
    cta: ['Take the quiz.', 'Find your winter arc and three habits to start with.', 'Link in bio'],
    caption: "Which winter arc are you?\n\nThe Quiet Reset, The Comeback Arc, The Builder or The Soft Discipline. Take the free 1-minute quiz at the link in bio, then tell me in the comments which one you got.\n\n📷 via Pinterest\n\n#winterarc #winterarcchallenge #personalityquiz #wellnessroutine #lifeoutsidetheinbox" },
  { id: 'printable', post: 4, photo: 'b2-04', tone: :light, cover: ['The free', 'winter arc printable'],
    slides: [
      ['', 'A winter arc you can stick on the fridge.', 'Three pages to print, or fill in on your tablet.'],
      ['PAGE 01', 'A 30-day habit tracker.', 'Write in up to five anchor habits and check off thirty days.'],
      ['PAGE 02', 'Thirty days of small habits.', 'Water before coffee. A walk without your phone. Bed thirty minutes earlier.'],
      ['PAGE 03', 'The season ahead.', 'One goal each for December, January and February, plus a closing ritual.'],
      ['', 'Miss a day? Pick up where you are.', ''],
    ],
    cta: ['Get it free.', 'Join the Sunday edition and it downloads right away.', 'Link in bio'],
    caption: "A winter arc you can stick on your fridge.\n\nThe free VIRI printable has three pages: a 30-day habit tracker, thirty days of small habits and a plan for the season ahead. Get it at the link in bio.\n\n📷 via Pinterest\n\n#winterarc #habittracker #freeprintable #goalsetting #lifeoutsidetheinbox" },
  { id: 'type-a', post: 9, photo: 'b2-09', tone: :dark, cover: ['Confessions of a', 'Type A girl'],
    slides: [
      ['', 'Marathons. 5 a.m. alarms. A list for everything.', 'I’ve always been proud of being Type A.'],
      ['THE PLAN', 'Every hour of every day, planned.', 'Workout, VIRI, my 9-to-5, coursework and reading. Every single day.'],
      ['THE PROBLEM', 'It worked for four days.', 'Then came travel, meetings and one delayed flight.'],
      ['THE REALIZATION', 'My plan only worked on a perfect day.', 'And perfect days almost never happen.'],
      ['CHANGE 01', 'Give each day a range.', 'Two of my four priorities is a good day. All four is a bonus.'],
      ['CHANGE 02', 'Weekly goals, not daily ones.', 'Five workouts and three VIRI articles a week, whenever they fit.'],
    ],
    cta: ['Read Part 1.', 'The full story, plus my revised schedule.', 'Link in bio'],
    caption: "Confessions of a Type A girl: my plan only worked on a perfect day.\n\nMarathons, 5 a.m. alarms, a list for everything. Then one delayed flight sent my whole week into a spiral. Part 1 is up on the VIRI Edit, with my revised schedule. Link in bio.\n\nAre you Type A too? Tell me in the comments.\n\n📷 via Pinterest\n\n#typeapersonality #winterarc #productivity #corporategirl #lifeoutsidetheinbox" },
]
only = ARGV
B2.each do |c|
  next unless only.empty? || only.include?(c[:id])
  dir = File.join(OUT, format('b2-post-%02d-%s', c[:post], c[:id]))
  FileUtils.mkdir_p(File.join(dir, 'photos'))
  FileUtils.cp(File.join(OUT, 'photos', "#{c[:photo]}.jpg"), File.join(dir, 'photos'))
  total = c[:slides].size + 2
  slides = [cover(c)] + c[:slides].each_with_index.map { |(l, m, s), i| text_slide(c, i + 2, total, l, m, s) } + [cta_slide(c, total, total)]
  slides.each_with_index do |html, i|
    f = File.join(dir, format('slide-%02d', i + 1))
    File.write("#{f}.html", page(html))
    system(CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=6000',
           '--window-size=1080,1350', "--screenshot=#{f}.png", "file://#{f}.html", out: File::NULL, err: File::NULL)
  end
  File.write(File.join(dir, 'caption.txt'), c[:caption])
  puts "#{c[:id]}: #{slides.size} slides"
end
