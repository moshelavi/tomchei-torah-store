const fs=require('fs');
const data=JSON.parse(fs.readFileSync('catalog.json','utf8'));
const ids=new Set();
for(const p of data.products){if(ids.has(p.id)||!p.name||!Number.isFinite(p.price)||p.price<0)throw new Error('Invalid catalog entry: '+p.id);ids.add(p.id);}
fs.writeFileSync('catalog-data.js','window.SHOP_DATA = '+JSON.stringify(data,null,2)+';\n');
console.log('Catalog ready: '+data.products.length+' products');
const benefits=JSON.parse(fs.readFileSync('stores.json','utf8'));
fs.writeFileSync('stores-data.js','window.STORE_BENEFITS = '+JSON.stringify(benefits,null,2)+';\n');
console.log('Store benefits ready: '+benefits.stores.length+' demo coupons');
