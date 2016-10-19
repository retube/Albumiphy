import os

class FileIterator:

	def __init__(self, directory):
		self.directory = directory
		self.images = []
		self.exclude = ['Albumiphy', 'scaled']
		self.include = ['.jpeg', '.jpg']

	def iterate(self):
		for dirName, subdirList, fileList in os.walk(self.directory):
			for fname in fileList:
				base, ext = os.path.splitext(fname)
				if ext.lower() in self.include:
					image = os.path.join(dirName, fname)
					self.images.append({ 'path': image })
			subdirList[:] = [d for d in subdirList if d not in self.exclude]

	def create_hierarchy(self):


		


#i = FileIterator("/home/rich/pics/Selected.test")
#i.iterate()
#print i.images