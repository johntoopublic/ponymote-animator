[Ponymote Animator](http://johntoopublic.github.io/ponymote-animator/) [![weekly users](https://analytics-badge.appspot.com/badge/UA-50859182-1.svg)](https://analytics-badge.appspot.com/)
===================

Simple site to generate [I_Animate_Ponymotes](http://reddit.com/u/I_Animate_Ponymotes) style animations.

 - **[helper.py](/helper.py)** Python script to break down the [CSS](http://d.thumbs.redditmedia.com/H7cJYzEPFntnNZFu.css) from [/r/mylittlepony](http://reddit.com/r/mylittlepony) into [ponydict.js](/ponydict.js) and download all the emotes into [ponymotes/](/ponymotes).

Steps to update the ponymotes used:

 - Check out this repo.
 - virtualenv env # Create a virtual Python environment to install libraries.
 - pip install Pillow # Fork of PIL, used to slice apart spritesheets.
 - ./helper.py # This updates the dictionary, and creates the images.
 - Commit, and send a pull request.
