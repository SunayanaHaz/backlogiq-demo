'use strict';
// Client-side integration checks using Node's built-in VM and mock HTML elements.
// Mock REST/authorization is not a substitute for real Supabase/RLS integration tests.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const app = fs.readFileSync(path.join(root, 'cloud.html'), 'utf8');
const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sql = fs.readFileSync(path.join(root, 'supabase/migrations/20261119_phase2c_backlog_items.sql'), 'utf8');
const js = app.match(/<script>([\s\S]*?)<\/script>/)[1];

const a='11111111-1111-4111-8111-111111111111';
const b='22222222-2222-4222-8222-222222222222';
const p1='aaaaaaaa-1111-4111-8111-111111111111';
const req1='bbbbbbbb-1111-4111-8111-111111111111';
const date='2026-11-19T12:00:00Z';
const projects=[{id:p1,owner_id:a,name:'Husky SmartDesk AI',goal:'Find student support',created_at:date}];
const requests=[{id:req1,project_id:p1,stakeholder:'Student',request_text:'Canvas support is unclear',status:'new',created_at:date}];
const backlog=[];
const calls=[];
let sequential=0;

class FakeEl {
  constructor(id) {
    this.id=id;this.value='';this.textContent='';this._innerHTML='';this.disabled=false;
    this._classes=new Set();this.dataset={};this.listeners={};
    this.classList={add:(x)=>this._classes.add(x),remove:(x)=>this._classes.delete(x),contains:(x)=>this._classes.has(x),toggle:(x,force)=>{if(force===undefined)force=!this._classes.has(x);force?this._classes.add(x):this._classes.delete(x)}};
  }
  addEventListener(event,fn){this.listeners[event]=fn}
  set innerHTML(value){this._innerHTML=value;if(this.id==='projectSelect'){
    const m=String(value).match(/<option\s+value="([^"]*)"/);
    this.value=m?m[1]:'';
  }}
  get innerHTML(){return this._innerHTML}
  reset(){if(this.id==='backlogForm'){for(const id of ['itemTitle','itemType','criterionGiven','criterionWhen','criterionThen','completionNotes'])el(id).value='';el('itemStatus').value='Draft';el('itemPriority').value='Medium';}
    if(this.id==='projectForm'){el('projectName').value='';el('projectGoal').value='';}
    if(this.id==='requestForm'){for(const id of ['projectSelect','stakeholder','requestText'])el(id).value='';}
  }
  focus(){}
}
const elements = new Map();
function el(id){if(!elements.has(id))elements.set(id,new FakeEl(id));return elements.get(id)}
el('itemStatus').value='Draft';el('itemPriority').value='Medium';
const store=new Map();
const localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v),removeItem:k=>store.delete(k)};
let owner=null;
let requestDelay=null;
async function fetch(url,options={}) {
  const u=new URL(url),method=options.method||'GET',body=options.body?JSON.parse(options.body):null;
  const token=(options.headers?.Authorization||'').replace('Bearer ','');
  const user=token==='testtoken-A'?a:token==='testtoken-B'?b:null;
  let status=200,data=null;
  calls.push({url,method,body,user});
  if(u.pathname.endsWith('/auth/v1/token')) {
    owner=body.email.includes('accounta')?a:b;
    data={access_token:owner===a?'testtoken-A':'testtoken-B',refresh_token:'refresh-token',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:owner,email:body.email}};
  } else if(u.pathname.endsWith('/auth/v1/logout')) {data={};}
  else if(u.pathname.endsWith('/rest/v1/projects')) {
    if(method==='GET')data=projects.filter(p=>p.owner_id===user);
    if(method==='POST') {assert.equal(body.owner_id,user);projects.push({id:`project-${++sequential}`,created_at:date,...body});}
  } else if(u.pathname.endsWith('/rest/v1/stakeholder_requests')) {
    const pid=(u.searchParams.get('project_id')||'').replace(/^eq\./,'');
    if(method==='GET') {
      if(requestDelay&&pid===requestDelay.id) await requestDelay.promise;
      data=requests.filter(r=>r.project_id===pid&&projects.some(p=>p.id===pid&&p.owner_id===user));
    }
    if(method==='POST') {
      assert(projects.some(p=>p.id===body.project_id&&p.owner_id===user));
      requests.push({id:`request-${++sequential}`,created_at:date,status:'new',...body});
    }
  } else if(u.pathname.endsWith('/rest/v1/backlog_items')) {
    const pid=(u.searchParams.get('project_id')||'').replace(/^eq\./,'');
    if(method==='GET')data=backlog.filter(i=>i.project_id===pid&&projects.some(p=>p.id===pid&&p.owner_id===user));
    if(method==='POST') {
      assert(requests.some(r=>r.id===body.stakeholder_request_id&&r.project_id===body.project_id));
      backlog.push({id:`backlog-${++sequential}`,created_at:date,updated_at:date,...body});
    }
    if(method==='PATCH'){
      const id=(u.searchParams.get('id')||'').replace(/^eq\./,'');
      const item=backlog.find(x=>x.id===id);
      assert(item);assert(projects.some(p=>p.id===item.project_id&&p.owner_id===user));
      for(const imm of ['project_id','stakeholder_request_id','updated_at','created_at','id'])assert(!(imm in body),`client may not update ${imm}`);
      Object.assign(item,body);item.updated_at=date;
    }
  } else throw Error(`Unmocked route ${url}`);
  return {ok:status<400,status,text:async()=>data===null?'':JSON.stringify(data)};
}
const ctx={document:{getElementById:el},window:{scrollTo:()=>{}},localStorage,fetch,console,setTimeout,clearTimeout,Date,encodeURIComponent,decodeURIComponent};
vm.runInNewContext(js,ctx,{filename:'cloud.html inline script'});
async function click(id){return await el(id).listeners.click();}
async function submit(id){return await el(id).onsubmit({preventDefault(){}})}
async function change(id){return await el(id).listeners.change();}
async function main(){
  assert.equal(typeof el('connect').listeners.click,'function');
  el('supabaseUrl').value='https://project-test.supabase.co';el('supabaseKey').value='sb_publishable_test_only';
  await click('connect');
  el('email').value='accounta@example.test';el('password').value='test-password';await click('signIn');
  assert(el('projects').innerHTML.includes('Husky SmartDesk AI'));
  el('savedRequests').listeners.click({target:{closest:()=>({dataset:{requestId:req1}})}});
  await click('refineRequest');
  el('itemTitle').value='Canvas support';el('itemType').value='User Story';
  await submit('backlogForm');
  assert.equal(backlog.length,1);assert.equal(backlog[0].status,'Draft');
  console.log('PASS: create Draft User Story with incomplete criteria');
  el('backlogItems').listeners.click({target:{closest:()=>({dataset:{itemId:backlog[0].id}})}});
  el('itemStatus').value='Ready';await submit('backlogForm');
  assert(el('formErrors').textContent.includes('Given, When, and Then'));
  assert.equal(backlog[0].status,'Draft');
  console.log('PASS: cannot mark User Story Ready without criteria');
  el('criterionGiven').value='Student needs help';el('criterionWhen').value='They ask Canvas question';el('criterionThen').value='Show support channel';el('itemPriority').value='High';
  await submit('backlogForm');assert.equal(backlog[0].status,'Ready');assert.equal(backlog[0].priority,'High');assert.equal(backlog[0].stakeholder_request_id,req1);
  console.log('PASS: update Ready story with criteria; preserve original request linkage');
  el('savedRequests').listeners.click({target:{closest:()=>({dataset:{requestId:req1}})}});
  await click('refineRequest');el('itemTitle').value='Discovery spike';el('itemType').value='Spike';el('itemStatus').value='Ready';el('completionNotes').value='Document available vendor APIs';await submit('backlogForm');
  assert.equal(backlog.length,2);assert.equal(backlog[1].status,'Ready');
  console.log('PASS: Ready Spike with completion notes');
  await click('reload');assert(el('backlogItems').innerHTML.includes('Discovery spike'));
  console.log('PASS: save and reload existing backlog items');
  el('projectName').value='Library Project';el('projectGoal').value='Show available study spaces';await submit('projectForm');
  const p2=projects[1].id;el('projectSelect').value=p2;await change('projectSelect');
  el('stakeholder').value='Library Team';el('requestText').value='Show study spaces';await submit('requestForm');
  assert.equal(el('projectSelect').value,p2);
  assert(el('savedRequests').innerHTML.includes('Library Team'));
  assert(!el('backlogItems').innerHTML.includes('Canvas support'));
  console.log('PASS: project dropdown preserved after saving request; no other project backlog');
  // Delayed old fetch should not overwrite the new project selection.
  let release; requestDelay={id:p1,promise:new Promise(r=>release=r)};
  el('projectSelect').value=p1;el('projectSelect').listeners.change();
  for(let k=0;k<10;k++) await Promise.resolve();
  el('projectSelect').value=p2;el('projectSelect').listeners.change();
  for(let k=0;k<10;k++) await Promise.resolve();
  release();requestDelay=null;
  await new Promise(r=>setTimeout(r,0));
  assert.equal(el('projectSelect').value,p2);
  assert(el('savedRequests').innerHTML.includes('Library Team'));
  assert(!el('savedRequests').innerHTML.includes('Canvas support is unclear'));
  console.log('PASS: stale project fetch cannot repopulate another project');
  await click('signOut');assert(!el('projects').innerHTML.includes('Husky SmartDesk'));
  el('email').value='accountb@example.test';el('password').value='test-password';await click('signIn');
  assert(el('projects').innerHTML.includes('No saved projects yet'));
  assert(!el('backlogItems').innerHTML.includes('Canvas support'));
  console.log('PASS: account switch clears previous account data (mock server)');
  assert.equal((home.match(/<a class="navitem" href="cloud.html">/g)||[]).length,1);
  assert.equal((home.match(/<button class="navitem(?: active)?" data-view=/g)||[]).length,6);
  assert(!home.includes('Bearer sb_secret_'));
  assert(sql.includes('foreign key (project_id, stakeholder_request_id)'));
  assert(sql.includes('grant update (title, item_type, priority, status,'));
  assert(!/grant\s+delete/i.test(sql));
  assert(sql.includes('create trigger backlogiq_set_backlog_item_updated_at'));
  console.log('PASS: navigation, SQL linkage, column-grant and timestamp static assertions');
  console.log('ALL MOCKED CLIENT TESTS PASSED (live Supabase untested)');
}
main().catch(err=>{console.error(err);process.exitCode=1});
