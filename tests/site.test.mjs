import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import {join} from 'node:path';
import {site,navigation} from '../scripts/config.mjs';
import {training,publications,appearances} from '../scripts/profile.mjs';
import {legalDocuments} from '../scripts/legal.mjs';
const slugs=['',...navigation.map(([slug])=>slug),'privacy-policy'];
test('all seven pages have distinct metadata, canonical URLs and valid structured data',async()=>{
 const titles=new Set(),descriptions=new Set();
 for(const slug of slugs){
  const html=await readFile(join('dist',slug,'index.html'),'utf8');
  titles.add(html.match(/<title>(.*?)<\/title>/)[1]);
  descriptions.add(html.match(/name="description" content="([^"]+)"/)[1]);
  assert.equal((html.match(/<h1[ >]/g)||[]).length,1,slug+' must have one H1');
  assert.ok(html.indexOf("document.documentElement.classList.add('js')") < html.indexOf('styles.css'), 'Set JS navigation state before first paint to prevent layout shift');
  assert.ok(html.includes(`rel="canonical" href="${site.origin}/${slug?slug+'/':''}"`));
  for (const font of ['editorial','sans']) assert.ok(html.includes(`rel="preload" href="/assets/${font}.woff2"`));
  assert.equal(JSON.parse(html.match(/application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'].length,3);
  assert.ok(!/lorem ipsum|complimentary consultation|price tbc|image placeholder/i.test(html));
 }
 assert.equal(titles.size,slugs.length);assert.equal(descriptions.size,slugs.length);
});
test('all internal links and local assets resolve; booking and login retain approved destinations',async()=>{
 for(const slug of slugs){
  const html=await readFile(join('dist',slug,'index.html'),'utf8');
  assert.ok(html.includes(`href="${site.clientPortal}"`));
  assert.ok(html.includes(`href="${site.consultation}"`));
  for (const [,attrs,body] of html.matchAll(/<a\b([^>]*)>(.*?)<\/a>/gs)) {
   if (body.includes('class="arrow"')) assert.ok(attrs.includes('target="_blank"') && attrs.includes('rel="noopener noreferrer"'));
   if (attrs.includes('class="button"')) assert.ok(!body.includes('class="arrow"'));
  }
  for(const [,url] of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)){
   const path=url.split(/[?#]/)[0];
   const target=join('dist',path,path.endsWith('/')?'index.html':'');
   assert.ok((await stat(target)).isFile(),`${slug}: ${target}`);
  }
 }
});
test('sitemap includes every page and no draft collections are sold',async()=>{
 const xml=await readFile('dist/sitemap.xml','utf8');
 for(const slug of slugs)assert.ok(xml.includes(`<loc>${site.origin}/${slug?slug+'/':''}</loc>`));
 const csr=await readFile('dist/csr-model/index.html','utf8');
 assert.ok(csr.includes('not yet available to purchase'));
 assert.ok(!/checkout\.stripe|buy now|add to cart/i.test(csr));
});
test('performance budget: lean HTML, scripts, styles and optimized hero assets',async()=>{
 for(const slug of slugs)assert.ok((await stat(join('dist',slug,'index.html'))).size<22000);
 assert.ok((await stat('dist/assets/site.js')).size<5000);
 assert.ok((await stat('dist/assets/styles.css')).size<30000);
 for(const asset of ['arch.webp','leaves.webp','sculpture.webp','interior.webp','carrie-800.webp'])assert.ok((await stat('dist/assets/'+asset)).size<120000);
});
test('professional profile retains all training and direct publication/appearance links',async()=>{
 const html=await readFile('dist/dr-mitran/index.html','utf8');
 assert.equal(training.length,10);
 assert.equal(publications.length,5);
 for(const [title] of training)assert.ok(html.includes(title.replaceAll('&','&amp;')),title);
 for(const [,url] of publications)assert.ok(html.includes(`href="${url}"`),url);
 for(const [name,,url] of appearances){assert.ok(html.includes(name));assert.ok(html.includes(`href="${url}"`));}
 assert.ok(html.includes('As seen on'));
 assert.ok(!html.includes('eprint/'),'Use stable publisher article records');
});

test('privacy is a footer-only page with the two original PDF destinations',async()=>{
 for(const slug of slugs){
  const html=await readFile(join('dist',slug,'index.html'),'utf8');
  const header=html.match(/<header class="site-header">(.*?)<\/header>/s)[1];
  const footer=html.match(/<footer class="site-footer wrap">(.*?)<\/footer>/s)[1];
  assert.ok(!header.includes('/privacy-policy/'));
  assert.equal((footer.match(/href="\/privacy-policy\/"/g)||[]).length,1);
 }
 const html=await readFile('dist/privacy-policy/index.html','utf8');
 assert.equal(legalDocuments.length,2);
 for(const doc of legalDocuments)assert.ok(html.includes(`href="${doc.href}"`));
});
