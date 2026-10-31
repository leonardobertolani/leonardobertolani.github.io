"""Generate the article's seven editable, self-contained SVG diagrams."""
from pathlib import Path
from html import escape
import math
import re
OUT = Path(__file__).parent
# The artwork sits directly on the site's warm paper, with its existing ink
# and teal as the foundation. Amber is reserved for temperature emphasis.
INK='#202124'; TEAL='#315e58'; COPPER='#c9784e'; MUTED='#6b746f'; BG='#fdfcf9'
BLUE='#527f91'; VIOLET='#796d8d'; GOLD='#a88b3e'
def text(x,y,s,size=22,fill=INK,anchor='start',weight=400):
 notation = bool(re.match(r'^(?:T(?:[₁₂ₑ(]|$)|R(?:[₁₂₄]|$)|d[xyzV]|Ω|m[ ·₁₂])', s))
 face = ' font-family="Georgia, Times New Roman, serif" font-style="italic"' if notation else ''
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{fill}" text-anchor="{anchor}" font-weight="{weight}"{face}>{escape(s)}</text>'
def line(x,y,a,b,color='#9cb2aa',width=2,extra=''):
 return f'<path d="M{x},{y} L{a},{b}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" {extra}/>'
def path(d,color=TEAL,width=3,extra=''):
 return f'<path d="{d}" fill="none" stroke="{color}" stroke-width="{width}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def circle(x,y,r,fill,extra=''):
 return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" {extra}/>'
def rect(x,y,w,h,fill,rx=0,extra=''):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {extra}/>'
def pill(x,y,s,w=84):
 return rect(x-w/2,y-22,w,32,BG,10)+text(x,y,s,21,INK,'middle',500)
def save(name,num,title,desc,body,footer):
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="720" height="480" viewBox="0 0 720 480" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title><desc id="desc">{escape(desc)}</desc>
<defs>
 <linearGradient id="thermal"><stop stop-color="{TEAL}"/><stop offset=".5" stop-color="{GOLD}"/><stop offset="1" stop-color="{COPPER}"/></linearGradient>
 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#e8e8e2" stroke-width=".6"/></pattern>
 <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 1L8 5L0 9" fill="none" stroke="{TEAL}" stroke-width="1.5"/></marker>
</defs>
<g font-family="Inter, ui-sans-serif, system-ui, sans-serif">
{rect(0,0,720,480,BG)}{rect(24,86,672,332,'url(#grid)',0)}
{rect(32,22,30,28,'none',3,'stroke="#bdcec7" stroke-width="1"')}{text(47,42,num,14,TEAL,'middle',500)}{text(78,45,title,26,weight=500)}
{body}
{line(32,435,688,435,'#deded8',1)}{text(32,461,footer,17,MUTED)}
</g></svg>'''
 (OUT/name).write_text(svg)
def body(x,y,label,props,warm=True):
 col=COPPER if warm else TEAL
 return (rect(x-76,y-57,152,114,BG,4,f'stroke="{col}" stroke-width="2.2"')+
 rect(x-65,y-46,130,92,'none',2,f'stroke="{col}" stroke-width=".7" opacity=".25"')+
 text(x,y-7,label,34,col,'middle')+text(x,y+29,props,22,INK,'middle'))
def resistor(x1,y1,x2,y2,label,offset=-18):
 dx=x2-x1;dy=y2-y1;length=math.hypot(dx,dy); ux=dx/length;uy=dy/length
 pts=[(x1,y1)]
 for t,v in [(.32,0),(.37,7),(.43,-7),(.49,7),(.55,-7),(.61,7),(.67,0)]:
  pts.append((x1+dx*t-uy*v,y1+dy*t+ux*v))
 pts.append((x2,y2))
 d='M'+' L'.join(f'{x:.2f},{y:.2f}' for x,y in pts)
 return path(d,TEAL,3)+pill((x1+x2)/2-uy*offset,(y1+y2)/2+ux*offset,label,96 if len(label)>4 else 66)
def reservoir(y=350):
 return rect(65,y,590,58,'#edf3ef',3,'stroke="#b9cec5" stroke-width="1"')+text(360,y+36,'Environment · Tₑₙᵥ constant',23,TEAL,'middle')
# 1: physical body and a single thermal link to a fixed-temperature reservoir.
s=reservoir()+body(240,215,'T(t)','m · c')
s+=resistor(316,215,510,215,'R')+path('M510 215 V350',TEAL,3)
s+=text(410,153,'heat exchange',20,MUTED,'middle')
s+=line(365,264,458,264,TEAL,2,'marker-start="url(#arrow)" marker-end="url(#arrow)"')
s+=text(240,120,'BODY',17,COPPER,'middle',600)
save('01-body-environment.svg','01','One body, one reservoir','A body with temperature T(t), mass m and specific heat c exchanges heat through resistance R with a constant-temperature environment.',s,'Heat flows according to the temperature difference.')
# 2: two objects inside an insulated shell.
s=rect(56,110,608,292,'none',8,'stroke="#a7bcb2" stroke-width="1.5" stroke-dasharray="7 6"')
s+=text(360,155,'ADIABATIC BOUNDARY',16,MUTED,'middle',600)
s+=resistor(286,250,434,250,'R',-22)+body(210,250,'T₁(t)','m₁ · c₁')+body(510,250,'T₂(t)','m₂ · c₂',False)
s+=line(314,295,406,295,TEAL,2,'marker-start="url(#arrow)" marker-end="url(#arrow)"')+text(360,365,'No heat crosses the boundary',20,MUTED,'middle')
save('02-adiabatic-pair.svg','02','An isolated pair','Two bodies exchange heat through resistance R inside an insulated boundary. There is no heat transfer to the environment.',s,'Internal heat exchange · total energy is conserved.')
# 3: all three connections are explicitly represented.
s=reservoir(352)+resistor(260,186,460,186,'R₁₂',-23)
s+=resistor(184,244,184,352,'R₁₋ₑₙᵥ',-57)+resistor(536,244,536,352,'R₂₋ₑₙᵥ',57)
s+=body(184,186,'T₁(t)','m₁ · c₁')+body(536,186,'T₂(t)','m₂ · c₂',False)
save('03-open-pair.svg','03','Three paths for heat','Two bodies have a mutual resistance R12 and separate resistances R1-env and R2-env to the same constant-temperature environment.',s,'Each body exchanges heat with its neighbour and the reservoir.')
# 4: a curved, crossing-free, deliberately minimal network.
nodes={1:(132,232),2:(318,147),3:(296,330),4:(492,348),5:(568,123),6:(578,262)}
edges=[
 (1,2,'R₁₂','M132 232 Q174 126 318 147',208,158),
 (1,3,'R₁₃','M132 232 Q147 330 296 330',191,309),
 (1,4,'R₁₄','M132 232 C58 414 438 449 492 348',329,403),
 (2,3,'R₂₃','M318 147 Q350 239 296 330',350,245),
 (2,5,'R₂₅','M318 147 Q429 77 568 123',450,105),
 (2,6,'R₂₆','M318 147 Q494 157 578 262',466,186),
 (4,6,'R₄₆','M492 348 Q596 357 578 262',581,327)]
s=''
for a,b,label,d,lx,ly in edges:
 s+=path(d,'#91a69d',1.8)
 s+=pill(lx,ly,label,62)
for i,(x,y) in nodes.items():
 s+=circle(x,y,30,BG,f'stroke="{TEAL}" stroke-width="1.8"')
 s+=text(x,y+9,str(i),27,INK,'middle',500)
save('04-thermal-network.svg','04','From bodies to a network','Six identically styled bodies connected by static thermal-resistance edges 12, 13, 14, 23, 25, 26 and 46.',s,'Nodes are bodies · edges carry thermal resistance Rᵢⱼ.')
# Isometric projection: x down-right, y up-right, z upward.
def iso(x,y,z,scale=55,origin=(350,315)):
 return origin[0]+scale*math.sqrt(3)/2*(x+y),origin[1]+scale*.5*(x-y)-scale*z
def heat(x):
 a=(78,137,126);b=(201,120,78);return '#'+''.join(f'{round(a[i]+(b[i]-a[i])*x):02x}' for i in range(3))
# 5: a 5 × 5 × 5 lattice in a true orthographic isometric projection. The three
# positive grid axes have equal length and meet at 120 degrees. Points separated
# by (1, 1, 1) project to the same position, so nearer nodes perfectly cover the
# nodes behind them while depth-ordered strokes preserve the internal links.
s=''
n=5
pts=[(x,y,z) for x in range(n) for y in range(n) for z in range(n)]
step=36
project=lambda p:(360 + step*math.sqrt(3)/2*(p[0]-p[1]), 245 + step*.5*(p[0]+p[1])-step*p[2])
coords={p:project(p) for p in pts}
links=[]
for p in pts:
 for axis in range(3):
  q=list(p);q[axis]+=1;q=tuple(q)
  if q not in coords: continue
  links.append((p,q,axis,(sum(p)+sum(q))/2))
def depth_tone(depth):
 near=(49,94,88); far=(188,201,195); t=min(1,depth/(3*(n-1)))
 return '#'+''.join(f'{round(near[i]+(far[i]-near[i])*t):02x}' for i in range(3))
for p,q,axis,depth in sorted(links,key=lambda e:e[3],reverse=True):
 s+=line(*coords[p],*coords[q],depth_tone(depth),1.2 if depth>1.5*(n-1) else 1.75)
for p in sorted(pts,key=sum,reverse=True):
 x,y=coords[p]; depth=sum(p)
 s+=circle(x,y,4.7,heat((p[0]+p[2])/(2*(n-1))),f'stroke="{BG}" stroke-width="1.15"')
assert len(coords)==125 and len(links)==300
# A body-diagonal step is invisible in an isometric projection.
assert all(abs(coords[(i+1,j+1,k+1)][a]-coords[(i,j,k)][a]) < 1e-9
           for i in range(n-1) for j in range(n-1) for k in range(n-1) for a in range(2))
s+=text(90,149,'Ω',42,TEAL,weight=500)+text(90,177,'body',18,MUTED)
s+=rect(520,355,140,8,'url(#thermal)',4)+text(520,391,'cooler',17,MUTED)+text(660,391,'warmer',17,MUTED,'end')
save('05-spatial-lattice.svg','05','A body becomes a lattice','A five-layer cubic lattice in an orthographic isometric projection. The three grid axes meet at equal 120-degree angles. Depth-ordered tones reveal internal connections while nearer filled points cover points on the same viewing line.',s,'')
# 6: all six neighbours and explicit coordinate spacing.
c=(350,247);sc=112
pr=lambda p:iso(*p,scale=sc,origin=c)
s=''
for axis,label in [(0,'x'),(1,'y'),(2,'z')]:
 p=[0,0,0];p[axis]=1.6;x,y=pr(p)
 s+=line(*c,x,y,'#aab8b1',1.5)+text(x+8,y+7,label,22,MUTED)
for axis,delta in [(0,'dx'),(1,'dy'),(2,'dz')]:
 for sign in [-1,1]:
  p=[0,0,0];p[axis]=sign;x,y=pr(p)
  s+=line(*c,x,y,TEAL,3)+circle(x,y,12,BG,f'stroke="{TEAL}" stroke-width="2"')+circle(x,y,3,TEAL)
  if sign==1:
   mx=(c[0]+x)/2;my=(c[1]+y)/2
   s+=pill(mx+(26 if axis==2 else 0),my+(-12 if axis!=0 else 26),delta,46)
s+=circle(*c,25,COPPER,'opacity=".08"')+circle(*c,15,BG,f'stroke="{COPPER}" stroke-width="2"')+circle(*c,4,COPPER)
s+=text(90,394,'T(t, x, y, z)',23,COPPER,weight=500)+path('M232 385 L317 275',COPPER,1.5)
save('06-six-neighbours.svg','06','A point and its six neighbours','The central temperature T(t,x,y,z) connects to neighbours at plus and minus dx, dy and dz along the three Cartesian axes.',s,'Three axes · two neighbours per axis · six heat contributions.')
# 7: seven centred finite volumes, transparent faces and an emphasized central cell.
pr=lambda p:iso(*p,scale=67,origin=(335,260))
def poly(points,fill,opacity=1,stroke='#72c9bc'):
 return '<polygon points="'+' '.join(f'{x:.2f},{y:.2f}' for x,y in points)+f'" fill="{fill}" fill-opacity="{opacity}" stroke="{stroke}" stroke-width="1.5" stroke-linejoin="round"/>'
def cube(cx,cy,cz,focus=False):
 corners={(a,b,c):pr((cx+a-.5,cy+b-.5,cz+c-.5)) for a in (0,1) for b in (0,1) for c in (0,1)}
 faces=[[(0,0,0),(1,0,0),(1,0,1),(0,0,1)],[(1,0,0),(1,1,0),(1,1,1),(1,0,1)],[(0,0,1),(1,0,1),(1,1,1),(0,1,1)]]
 s=''
 for f,col in zip(faces,[COPPER,COPPER,COPPER] if focus else [TEAL,TEAL,TEAL]):
  s+=poly([corners[k] for k in f],col,.1 if focus else .025,COPPER if focus else '#58877a')
 return s
s = ''
cells=[(0,1,0),(-1,0,0),(0,0,-1),(0,0,0),(1,0,0),(0,-1,0),(0,0,1)]
for p in cells:s+=cube(*p,p==(0,0,0))
for p in cells:
 x,y=pr(p);s+=circle(x,y,5,COPPER if p==(0,0,0) else TEAL,f'stroke="{BG}" stroke-width="1.5"')
# Label a single cell's three edge lengths with offset dimension guides.
for a,b,label,off in [((.5,-.5,-.5),(1.5,-.5,-.5),'dx',(6,25)),((1.5,-.5,-.5),(1.5,.5,-.5),'dy',(18,18)),((1.5,.5,-.5),(1.5,.5,.5),'dz',(28,0))]:
 x,y=pr(a);u,v=pr(b);ox,oy=off
 s+=line(x+ox,y+oy,u+ox,v+oy,COPPER,1.5)+pill((x+u)/2+ox,(y+v)/2+oy,label,44)
s+=text(80,137,'dV',26,COPPER,weight=600)+text(80,166,'dx · dy · dz',21,MUTED)
save('07-volume-elements.svg','07','Give each point a volume','Seven adjacent volume elements with a node at each centre. A highlighted central cell and dimensions dx, dy and dz show how the spatial graph represents finite volumes.',s,'A node at each cell centre · cell mass m = ρ dx dy dz.')
print('Generated seven SVG diagrams.')
