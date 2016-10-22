#!/usr/bin/env python

# **********************************************************************************
# Creates a static image gallery for any images in a given directory (inc sub dirs)
#  - Calendar layout
#  - Responsive
#  - Bookmarkable URLs
# Author: R Hill
# Date: 2016
# Web: http://retu.be/albumiphy.html
# **********************************************************************************

import glob
import os,sys
import getopt
import json 
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS
from Hierarchy import Hierarchy
import shutil


def main(argv):

	# Directory with web assets
	webDir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "../web")
	
	# Defaults
	targetDir = os.getcwd()
	title = "My Photo Album"

	# Parse cmdline options
	try:
		opts, args = getopt.getopt(argv, "t:h", ["target=", "help", "title="])
	except getopt.GetoptError:
		usage()
		sys.exit(2)

	for opt, arg in opts:
		if opt in ("-t", "--target"):
			targetDir = arg
		elif opt in ("--title"):
			title = arg
		elif opt in ("-h", "--help"):
			usage()
			sys.exit(0)

	# setup
	setup_target(webDir, targetDir, title)
	# loop over images and create web versions
	process(webDir, targetDir)

def setup_target(webDir, targetDir, title):

	# The subdirectory with website content
	aphyDir	= os.path.join(targetDir, "Albumiphy")
	
	if not os.path.exists(aphyDir):
		print "Creating folder " + aphyDir
		os.makedirs(aphyDir)

    # json folder contains image listing
	jsonDir = os.path.join(aphyDir, "json")

	if not os.path.exists(jsonDir):
		print "Creating folder " + jsonDir
		os.makedirs(jsonDir)

    # The assets folder contains the css, js files for the website
	aphyAssetsDir = os.path.join(aphyDir, "assets")

	if os.path.exists(aphyAssetsDir):
		print "WARNING: Not creating folder " + aphyAssetsDir + " as it already exists. If you want to recreate please delete and re-run or simply copy from " + webDir
	else:
		print "Copying folder " + aphyAssetsDir

		shutil.copytree(
			os.path.join(webDir, "assets"), 
			aphyAssetsDir
		)

	# The home page
	aphyIndexFile = os.path.join(aphyDir, "index.html")

	if os.path.exists(aphyIndexFile):
		print "WARNING: Not creating file " + aphyIndexFile	+ " as it already exists. If you want to recreate please delete and re-run or simply copy from " + webDir
	else:
		print "Copying file " + aphyIndexFile

		shutil.copy(
			os.path.join(webDir, "index.html"), 
			aphyIndexFile			
		)

    # This contains gallery title only at the mo
	jsonFile = os.path.join(jsonDir, "values.json")
	print "Writing file " + jsonFile

	file = open(jsonFile, "w")
	file.write(json.dumps({ 'title': title }))
	file.close()


def process(indexFile, targetDir):
	
	h = Hierarchy(targetDir, "Calendar")
	hh = h.build() 

	file = open(os.path.join(targetDir, "Albumiphy/json/images.json"), "w")
	file.write(json.dumps(hh))
	file.close()

def usage():

	print "albumiphy [-t|--target=]<target> [-h|--help] --title=<title>"
	print ""
	print "-t, target=TARGET   The target image folder to process. The static gallery will be ceated in a subfolder \"Albumiphy\"."
	print "--title=TITLE       The image gallery name. \"My Photo Album\" by default."
	print "-h, --help          Prints this help."


if __name__ == "__main__":
	main(sys.argv[1:])

