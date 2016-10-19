import os
from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS

class Hierarchy:

	def __init__(self, directory, paginationType):
		self.directory = directory
		self.paginationType = paginationType
		self.images = []
		self.hierarchy = []
		self.exclude = ['Albumiphy', 'scaled', 'albumiphy']
		self.include = ['.jpeg', '.jpg']

	def iterate(self):
		for dirName, subdirList, fileList in os.walk(self.directory):
			for fname in fileList:
				base, ext = os.path.splitext(fname)
				if ext.lower() in self.include:
					path = os.path.join(dirName, fname)
					self.images.append({ 'path': path, 'filename': fname, 'base': base, 'ext': ext })
			subdirList[:] = [d for d in subdirList if d not in self.exclude]

	def order_images(self):
		self.images = sorted(self.images, key=self.get_comparator)

	def get_comparator(self, image):
		image['ts'] = self.get_timestamp(self.get_exif_data(image['path']))
		return image['ts']

	def get_exif_data(self, filepath):
		return Image.open(filepath)._getexif();

	def get_timestamp(self, exif):
		dt = self.get_exif_value(exif,"DateTimeOriginal")
		return datetime.strptime(dt, '%Y:%m:%d %H:%M:%S')

	def get_exif_value(self, exif, field) :
		for (k,v) in exif.iteritems():
			if TAGS.get(k) == field:
				return v

	def build(self):

		self.iterate()
		self.order_images()

		if (self.paginationType == 'Calendar'):

			for f in self.images:

				print "Processing " + f['path']

				year = f['ts'].strftime("%Y")
				month = f['ts'].strftime("%B")

				folder = "images/" + year + "/" + month +"/"
				web = f['base'] + "_web" + f['ext']
				thumb = f['base'] + "_thumb" + f['ext']

				if (len(self.hierarchy) == 0 or self.hierarchy[-1]['year'] != year): 
					self.hierarchy.append({ 'year': year, 'months': [] })

				months = self.hierarchy[-1]['months']

				if (len(months) == 0 or months[-1]['month'] != month):
					months.append({ 'month': month, 'images': []})

				imagess = months[-1]['images']

				imagess.append({'web': folder + web, 'thumb': folder + thumb, 'link': web, 'ts': f['ts'].strftime("%d %B %Y")})

				web_path = os.path.join(self.directory, "Albumiphy/" + folder + web)
				thumb_path = os.path.join(self.directory, "Albumiphy/" + folder + thumb)

				if (os.path.exists(web_path) and os.path.exists(thumb_path)):
					print "Skipping " + f['path']
				else:

					img = Image.open(f['path'])

					if (not os.path.exists(web_path)):

						img_s = self.scale_image(img, 600)
						self.save_image(img_s, "Albumiphy/" + folder, web)

					if (not os.path.exists(thumb_path)):

						img_t = self.scale_image(img, 120)				
						self.save_image(img_t, "Albumiphy/" + folder, thumb)

		return { 'years': self.hierarchy, 'type': 'Calendar' }		

	
	def scale_image(self, img, height):

		scale = height / float(img.size[1])
		width = int((float(img.size[0])*float(scale)))
		return img.resize((width,height), Image.ANTIALIAS)


	def save_image(self, img, folder, filename):

		dest = os.path.join(self.directory, folder)

		if not os.path.exists(dest):
			os.makedirs(dest)

		img.save(os.path.join(dest, filename))


