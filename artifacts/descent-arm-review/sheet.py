from PIL import Image,ImageDraw
from pathlib import Path
root=Path(__file__).parent
for mode in ['before','after']:
 files=sorted((root/mode).glob('*.png'))
 if not files:continue
 im=Image.new('RGB',(1200,((len(files)+5)//6)*310),'white');d=ImageDraw.Draw(im)
 for i,f in enumerate(files):
  crop=Image.open(f).crop((180,330,350,540)).resize((200,260));x=i%6*200;y=i//6*310;im.paste(crop,(x,y+30));d.text((x+8,y+8),mode+' '+f.stem+'s',fill='black')
 im.save(root/(mode+'-sequence.jpg'))
