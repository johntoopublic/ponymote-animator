#!/usr/bin/python
# Meant for use with http://d.thumbs.redditmedia.com/H7cJYzEPFntnNZFu.css
from PIL import Image
import io
import re
import sys
import urllib.request

if not len(sys.argv) > 1:
    print ('Usage %s subreddit.css' % sys.argv[0])
    sys.exit()
css = open(sys.argv[1]).read()
rules = [re.findall('="(.*?)"]', rule) for rule in
        re.split('{.*?}', css)
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
js = ','.join(['"%s":"%s"' % (k[0],k[1]) for k in sorted(keys.items())])
print('var PONIES = {%s}' % js, file=open('ponydict.js', 'w'))

files = dict(re.findall('/([a-e])00.*?url\("(.*?)"\)', css))
for k in files:
    block = io.BytesIO(urllib.request.urlopen(files[k]).read())
    image = Image.open(block)
    for x in range(0, 4):
        for y in range(0, 10):
            ponymote = image.crop((x * 70, y * 70, x * 70 + 70, y * 70 + 70))
            ponymote.save('ponymotes/' + k + str(x) + str(y) + '.png')
            reverse = ponymote.transpose(Image.FLIP_LEFT_RIGHT)
            reverse.save('ponymotes/r' + k + str(x) + str(y) + '.png')
