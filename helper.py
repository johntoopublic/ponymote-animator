#!/usr/bin/python
# Meant for use with http://d.thumbs.redditmedia.com/H7cJYzEPFntnNZFu.css
import re
import sys

if not len(sys.argv) > 1:
    print ('Usage %s subreddit.css > ponydict.js' % sys.argv[0])
    sys.exit()

rules = [re.findall('="(.*?)"]', rule) for rule in
        re.split('{.*?}', open(sys.argv[1]).read())
        if re.match('.*/r?[a-e]00', rule)]
keys = {}
for rule in rules:
    matches = []
    for target in rule:
        if re.match('.*/r?[a-e][0-9]{2}', target):
            for match in matches:
                keys[match] = target
            matches.clear()
        else:
            matches.append(target)
print('var PONIES = ', keys)
