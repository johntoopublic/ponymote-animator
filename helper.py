#!/usr/bin/env python
# Meant for use with the active /r/mylittlepony stylesheet.
from PIL import Image
import io
import re
import sys
import urllib.request

# URL manually pulled from reddit source.
response = urllib.request.urlopen(
    'https://a.thumbs.redditmedia.com/mecpQn0-kBjJ9huAYeD2KPSYZsPMlSydz9TSm7bPFf0.css')
css = response.read().decode('utf-8')
grid = {}
positions = re.findall(
    '([^}]+?)background-position:-?(\d)\S*? -?(\d)', css)
for rule in positions:
    for ponymote in re.findall('\|="(/\w+)', rule[0]):
        if not re.search('\d', ponymote):
            grid[ponymote] = ''.join(rule[1:])
rules = [rule for rule in re.split('{.*?}', css)
        if re.search('/r?[a-f]00', rule)]
keys = {}
for rule in rules:
    key = re.search('(/r?[a-f])00', rule).group(1)
    for ponymote in re.findall('\|="(/\w+)"', rule):
        if not re.search('\d', ponymote):
            keys[ponymote] = key + grid.get(ponymote, '00')
js = ','.join(['"%s":"%s"' % (k[0],k[1]) for k in sorted(keys.items())])
print('var PONIES = {%s}' % js, file=open('ponydict.js', 'w'))

files = dict(re.findall('/([a-f])00.*?url\("(.*?)"\)', css))
for k in files:
    url = files[k]
    # urllib complains about schemeless URLs.
    if url[:2] == '//':
        url = 'http:' + url
    block = io.BytesIO(urllib.request.urlopen(url).read())
    image = Image.open(block)
    for x in range(0, 4):
        for y in range(0, 10):
            ponymote = image.crop((x * 70, y * 70, x * 70 + 70, y * 70 + 70))
            ponymote.save('ponymotes/' + k + str(x) + str(y) + '.png')
            reverse = ponymote.transpose(Image.FLIP_LEFT_RIGHT)
            reverse.save('ponymotes/r' + k + str(x) + str(y) + '.png')
