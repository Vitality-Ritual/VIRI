# Safe find-and-replace for scripted edits to the site files.
#
#     ruby tools/swap.rb FILE OLD.txt NEW.txt [COUNT]
#
# Replaces the exact text in OLD.txt with the exact text in NEW.txt, and refuses
# unless it occurs exactly COUNT times (default 1). Nothing is a pattern: no
# regex, no wildcards, so it cannot match more than it was shown.
#
# Write OLD.txt and NEW.txt with an editor or a quoted heredoc (<<'EOF'), never
# by pasting into a shell string. A trailing newline in either file is part of
# the text.
#
# The traps this exists to avoid, all of which have cost a deploy:
#   - a `.*?` regex "fix" that deleted eight functions, pages included;
#   - Ruby's <<~ heredoc stripping the leading indentation from the search text,
#     so it matched nothing, or matched the wrong place;
#   - String#sub treating \' \` \0 \1 in the replacement as back-references, so
#     an apostrophe in "Hell's Kitchen" pasted the rest of the file in;
#   - Ruby reading files as US-ASCII here and refusing on the first curly quote.
#
# After writing, it lists any top-level function that the edit removed. Run
# tools/check.rb before deploying regardless.

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

file, old_path, new_path, count = ARGV
abort 'usage: ruby tools/swap.rb FILE OLD.txt NEW.txt [COUNT]' unless file && old_path && new_path
count = (count || 1).to_i

src = File.read(file, encoding: 'UTF-8')
old = File.read(old_path, encoding: 'UTF-8')
new = File.read(new_path, encoding: 'UTF-8')
abort 'OLD.txt is empty' if old.empty?

found = src.scan(old).length          # a String argument is matched literally
abort "refused: found #{found} occurrence#{found == 1 ? '' : 's'} in #{file}, expected #{count}. Nothing written." unless found == count

names = ->(s) { s.scan(/^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)|^(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/).map(&:compact).flatten }
before = names.(src)

backup = File.join(ENV['TMPDIR'] || '/tmp', "#{File.basename(file)}.#{Time.now.strftime('%Y%m%d-%H%M%S')}.bak")
File.write(backup, src)

out = src.gsub(old) { new }           # block form: the replacement is used as-is
File.write(file, out)

lost = before - names.(out)
puts "replaced #{count} in #{file} (#{out.length - src.length >= 0 ? '+' : ''}#{out.length - src.length} chars). Backup: #{backup}"
unless lost.empty?
  puts "WARNING: these top-level names are gone now: #{lost.join(', ')}"
  puts "If that was not the intent, restore with:  cp #{backup} #{file}"
  exit 2
end
