import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
const origin=process.env.TEST_URL||'http://127.0.0.1:4173';
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
await mkdir('test-results',{recursive:true});
let checks=0;
const errors=[];
try{
 for(const [width,height] of [[390,844],[768,1024],[1440,1000]]){
  const page=await browser.newPage({viewport:{width,height}});
  page.on('pageerror',e=>errors.push(e.message));
  for(const slug of ['','coaching/','behind-the-work/','csr-model/','dr-mitran/','contact/','privacy-policy/']){
   const response=await page.goto(origin+'/'+slug);assert.equal(response.status(),200);
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('h1').count(),1);
   assert.ok(await page.locator('h1').isVisible());
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Horizontal overflow ${width} ${slug}`);
   for (const img of await page.locator('img').all()) { if(!await img.isVisible()) continue; await img.scrollIntoViewIfNeeded(); await img.evaluate(el => el.complete ? Promise.resolve() : new Promise(resolve => {el.addEventListener('load', resolve, {once:true}); el.addEventListener('error', resolve, {once:true});})); }
   await page.evaluate(()=>scrollTo(0,0));
   assert.deepEqual(await page.locator('img').evaluateAll(ims=>ims.filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src)),[]);
   assert.equal(await page.locator('nav[aria-label="Main navigation"] a[href="https://portal.ndtalk.io/"]').count(),1);
   await page.screenshot({path:`test-results/${width}-${slug.replace('/','')||'home'}.png`,fullPage:true});
   checks++;
  }
  await page.goto(origin+'/');
  if(width>=961){
   const gridOffset=await page.evaluate(()=>Math.abs(document.querySelector('.site-header .wordmark').getBoundingClientRect().left-document.querySelector('.home-hero').getBoundingClientRect().left));
   assert.ok(gridOffset<=1,'Desktop wordmark must align with the main content grid');
  }
  if(width<961){
   const menu=page.locator('#menu-toggle');await menu.click();
   assert.equal(await menu.getAttribute('aria-expanded'),'true');
   await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');
   await menu.click();await page.locator('#site-nav').getByRole('link',{name:'Coaching',exact:true}).click();
   await page.waitForURL('**/coaching/');assert.ok(await page.getByRole('heading',{name:'Support for meaningful change.'}).isVisible());checks++;
  }
  await page.goto(origin+'/coaching/');await page.locator('summary').first().click();
  assert.equal(await page.locator('details').first().getAttribute('open'),'');checks++;
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto(origin+'/contact/');
 for (const name of ['email','confirmEmail']) {
  const field=page.locator(`[name=${name}]`);
  assert.equal(await field.getAttribute('type'),'email');
  assert.ok((await field.getAttribute('autocomplete')).endsWith(' email'));
 }
 const consentOffset=await page.locator('.checkbox').evaluate(label=>{
  const box=label.querySelector('input').getBoundingClientRect();
  const text=label.querySelector('span').getBoundingClientRect();
  return Math.abs((box.top+box.height/2)-(text.top+parseFloat(getComputedStyle(label).lineHeight)/2));
 });
 assert.ok(consentOffset<=2,'Checkbox must align with the first line of its label');
 await page.locator('[name=email]').focus();
 const focusStyle=await page.locator('[name=email]').evaluate(field=>{
  const css=getComputedStyle(field);return {outline:css.outlineStyle,shadow:css.boxShadow};
 });
 assert.equal(focusStyle.outline,'none','Text fields use one continuous focus border without a second outline');
 assert.ok(focusStyle.shadow.includes('inset'));
 await page.locator('[name=name]').fill('Regression Test');
 await page.locator('[name=email]').fill('hello@example.com');
 await page.locator('[name=confirmEmail]').fill('different@example.com');
 await page.locator('[name=message]').fill('A test inquiry & special characters?');
 await page.locator('[name=consent]').check();
 await page.getByRole('button',{name:'Prepare email'}).click();
 assert.equal(await page.locator('[name=confirmEmail]').evaluate(e=>e.validity.customError),true);
 assert.equal(await page.locator('#form-status').textContent(),'');
 await page.locator('[name=confirmEmail]').fill('hello@example.com');
 await page.getByRole('button',{name:'Prepare email'}).click();
 assert.ok((await page.locator('#form-status').textContent()).includes('has not been sent'));
 const mailto=await page.locator('#form-status a').getAttribute('href');
 assert.ok(mailto.startsWith('mailto:carrie@neurodiversetalk.com?'));
 assert.ok(decodeURIComponent(mailto).includes('A test inquiry & special characters?'));checks++;
 const future=await browser.newPage();
 await future.clock.install({time:new Date('2027-01-02T12:00:00Z')});
 await future.goto(origin+'/');
 assert.equal(await future.locator('[data-current-year]').textContent(),'2027');
 assert.equal(await future.locator('[data-current-year]').getAttribute('datetime'),'2027');
 await future.close();checks++;
 const nojs=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
 const plain=await nojs.newPage();await plain.goto(origin+'/');
 assert.ok(await plain.locator('#site-nav a').first().isVisible());checks++;
 assert.deepEqual(errors,[]);
 await writeFile('test-results/summary.json',JSON.stringify({checks,pages:7,viewports:[390,768,1440],runtimeErrors:errors,result:'passed'},null,2));
 console.log(`Passed ${checks} browser scenarios: seven pages at three viewports, navigation, FAQ, form validation, email drafting, and no-JS navigation.`);
}finally{await browser.close()}
