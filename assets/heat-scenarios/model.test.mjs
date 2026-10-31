import assert from 'node:assert/strict';
import {solution} from './model.mjs';
const base={t1:90,t2:20,env:25,m1:1,m2:2,c1:4180,c2:900,r1:.2,r2:.35,r12:.15,duration:3600};
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
const single=solution('body-environment',base);
near(single.at(0)[0],90);near(single.at(836)[0],25+65/Math.E);
const pair=solution('body-body',base),energy=base.m1*base.c1*base.t1+base.m2*base.c2*base.t2;
for(const t of [0,1,100,1000,1e7]){
 const [a,b]=pair.at(t);near(base.m1*base.c1*a+base.m2*base.c2*b,energy,1e-7);
}
function rhs(p,[u,v]){const exchange=(u-v)/p.r12;return [(-exchange-(u-p.env)/p.r1)/(p.m1*p.c1),(exchange-(v-p.env)/p.r2)/(p.m2*p.c2)];}
function rk4(p,duration){let v=[p.t1,p.t2];const h=duration/12000,add=(v,k,f)=>v.map((x,i)=>x+f*k[i]);
 for(let i=0;i<12000;i++){const k1=rhs(p,v),k2=rhs(p,add(v,k1,h/2)),k3=rhs(p,add(v,k2,h/2)),k4=rhs(p,add(v,k3,h));v=v.map((x,i)=>x+h*(k1[i]+2*k2[i]+2*k3[i]+k4[i])/6);}return v;}
for(let i=0;i<12;i++){
 const p={...base,t1:-50+25*i,t2:120-17*i,env:10+i*3,m1:.5+i*.2,m2:3-i*.1,c1:900+i*100,r12:.1+i*.02};
 const exact=solution('body-body-environment',p);
 const reference=rk4(p,2400);exact.at(2400).forEach((x,j)=>near(x,reference[j],1e-8));
 near(exact.at(0)[0],p.t1);near(exact.at(0)[1],p.t2);
 exact.at(exact.timescale*50).forEach(x=>near(x,p.env));
 const min=Math.min(p.t1,p.t2,p.env),max=Math.max(p.t1,p.t2,p.env);
 for(let j=0;j<100;j++)for(const x of exact.at(j*100))assert.ok(x>=min-1e-9&&x<=max+1e-9);
}
for(const mode of ['body-environment','body-body','body-body-environment']){
 const equal=solution(mode,{...base,t1:25,t2:25});equal.at(12345).forEach(x=>near(x,25));
}
const isolated=solution('body-body-environment',{...base,r1:1e30,r2:1e30});
for(const t of [1,100,10000])isolated.at(t).forEach((x,i)=>near(x,pair.at(t)[i]));
const separate=solution('body-body-environment',{...base,r12:1e30});
for(const t of [1,100,10000]){
 near(separate.at(t)[0],single.at(t)[0]);
 near(separate.at(t)[1],base.env+(base.t2-base.env)*Math.exp(-t/(base.m2*base.c2*base.r2)));
}
for(const p of [{...base,m1:.01,c1:1,r1:.0001,m2:1000,c2:10000,r2:10000,r12:10000},{...base,m1:1000,c1:10000,r1:10000,m2:.01,c2:1,r2:.0001,r12:10000}]){
 const s=solution('body-body-environment',p);
 for(const t of [0,1e-10,1e-6,1,10000000])s.at(t).forEach(x=>assert.ok(Number.isFinite(x)&&x>=20-1e-9&&x<=90+1e-9));
}
console.log('PASS: closed forms, energy conservation, 12 independent RK4 comparisons, equilibria, isolated and uncoupled limits, extreme valid inputs.');
