import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
const results=[];
try{
 for(const slug of ['','coaching/','behind-the-work/','csr-model/','dr-mitran/','contact/','privacy-policy/']){
  const context=await browser.newContext({viewport:{width:390,height:844}});
  const page=await context.newPage();
  await page.goto((process.env.TEST_URL||'http://127.0.0.1:4173')+'/'+slug);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({page:slug||'home',violations:result.violations});
  await context.close();
 }
 await mkdir('test-results',{recursive:true});await writeFile('test-results/accessibility.json',JSON.stringify(results,null,2));
 assert.deepEqual(results.flatMap(r=>r.violations.map(v=>({page:r.page,id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))),[]);
 console.log('All seven pages passed axe WCAG A/AA automated checks.');
}finally{await browser.close()}
