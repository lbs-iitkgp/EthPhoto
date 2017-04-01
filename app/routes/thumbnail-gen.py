import os
import sys
from PIL import Image

size = 64, 64

for infile in sys.argv[1:]:
    print("In python script" + sys.argv[0])
    outfile = "_thumbnail" + ".png"
    if infile != outfile:
        im = Image.open(infile)
        im.thumbnail(size, Image.ANTIALIAS)
        im.save(outfile, "JPEG")
