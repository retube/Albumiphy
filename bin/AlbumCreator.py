from datetime import datetime
from PIL import Image
from PIL.ExifTags import TAGS

class AlbumCreator:

	def __init__(self, images, paginationScheme):
		self.images = images
		self.paginationScheme = paginationScheme
		self.hierarchy = []

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

	def paginate(self):
		self.order_images()

		if (self.paginationScheme == 'Calendar'):

			for f in self.images:

				year = f['ts'].strftime("%Y")
				month = f['ts'].strftime("%B")

				if (len(self.hierarchy) == 0 or self.hierarchy[-1]['year'] != year): 
					self.hierarchy.append({ 'year': year, 'months': [] })

				months = self.hierarchy[-1]['months']

				if (len(months) == 0 or months[-1]['month'] != month):
					months.append({ 'month': month, 'images': []})

				months[-1]['images'].append({'path': f['path'], 'ts': f['ts'].strftime("%d %B %Y")})




