from os import walk
import os

mypath = './bgm/'

for (dirpath, dirnames, filenames) in walk(mypath):
    print(filenames)    
    break

for filename in filenames:
  print(filename)
  os.system('ffmpeg -i ' + mypath +  filename +' ' +  mypath + os.path.splitext(filename)[0]+'.mp3')
  



mypath = './se_event/'

for (dirpath, dirnames, filenames) in walk(mypath):
    print(filenames)    
    break

for filename in filenames:
  print(filename)
  os.system('ffmpeg -i ' +  mypath + filename +' ' +  mypath + os.path.splitext(filename)[0]+'.mp3')
  



mypath = './wav_eft/'

for (dirpath, dirnames, filenames) in walk(mypath):
    print(filenames)    
    break

for filename in filenames:
  print(filename)
  os.system('ffmpeg -i ' +  mypath + filename +' ' +  mypath + os.path.splitext(filename)[0]+'.mp3')
  