// Run: node tests/phase3_test.cjs (no live keys or external services required).
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const client = fs.readFileSync(path.join(root, 'cloud.html'), 'utf8');
const code = fs.readFileSync(path.join(root, 'supabase/functions/analyze-backlog/index.ts'), 'utf8');
const config = fs.readFileSync(path.join(root, 'supabase/config.toml'), 'utf8');
const js = ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.None } }).outputText;
const auth = 'test.' + Buffer.from('{}').toString('base64url') + '.signature';
const id = '11111111-1111-4111-8111-111111111111';
const reqId = '22222222-2222-4222-8222-222222222222';
const apiKey = 'sb_publishable_mock_only';
let handler, lastRequest, callCount, geminiCalls, authIsValid, projectOwned, requestOwned, geminiStatus, geminiBody;
function reset() {
  lastRequest = null; callCount = 0; geminiCalls = 0;
  authIsValid = true; projectOwned = true; requestOwned = true; geminiStatus = 200;
  geminiBody = JSON.stringify({title:'Guide students to support',item_type:'User Story',priority:'High',acceptance_given:'Student needs help',acceptance_when:'They choose an issue',acceptance_then:'Correct channel is shown',completion_notes:'',rationale:'Useful outcome',clarification_questions:['Is Canvas help staffed 24/7?']});
}
function mockFetch(url, options={}) {
  callCount++;
  if (url.includes('/auth/v1/user')) return Promise.resolve(Response.json(authIsValid ? {id:'user-b'} : {message:'Invalid'}, {status:authIsValid?200:401}));
  if (url.includes('/rest/v1/projects')) return Promise.resolve(Response.json(projectOwned ? [{id, name:'Test Project', goal:'Find support'}] : []));
  if (url.includes('/rest/v1/stakeholder_requests')) return Promise.resolve(Response.json(requestOwned ? [{id:reqId, project_id:id, stakeholder:'Student', request_text:'Need Canvas support'}] : []));
  if (url.startsWith('https://generativelanguage.googleapis.com/')) {
    geminiCalls++;
    assert.equal(options.headers['x-goog-api-key'],'TEST_ONLY_NOT_REAL');
    assert.equal(options.body.includes('test.'),false,'JWT must not be sent to Gemini');
    return Promise.resolve(Response.json(geminiStatus===200 ? {candidates:[{content:{parts:[{text:geminiBody}]}}]} : {error:{message:'quota'}},{status:geminiStatus}));
  }
  throw new Error('Unexpected fetch '+url);
}
const ctx={Deno:{serve(fn){handler=fn;},env:{get(k){return ({SUPABASE_URL:'https://test.supabase.co',SUPABASE_ANON_KEY:apiKey,GEMINI_API_KEY:'TEST_ONLY_NOT_REAL',GEMINI_MODEL:'gemini-2.5-flash-lite'})[k];}}},fetch:mockFetch,Headers,Request,Response,AbortSignal,TextEncoder,console,JSON,encodeURIComponent};
vm.runInNewContext(js,ctx);
function request(method='POST', body={project_id:id,stakeholder_request_id:reqId},token=auth,origin='http://localhost:8000') {
  return new Request('https://test.supabase.co/functions/v1/analyze-backlog',{
    method, headers:{authorization:'Bearer '+token,'content-type':'application/json',origin},
    ...(['POST','PUT'].includes(method)?{body:JSON.stringify(body)}:{})
  });
}
async function test() {
  assert.match(client, /id="analyzeWithAI"/);
  assert.match(client, /id="applyAiSuggestion"/);
  assert.match(client, /id="discardAiSuggestion"/);
  assert.match(client, /'itemStatus'\)\.value = 'Draft'/);
  assert(!client.includes('GEMINI_API_KEY'));
  assert(!client.includes('AIza'));
  assert.match(config, /verify_jwt\s*=\s*false/);
  console.log('PASS: frontend controls, no client AI key, user approval before save');
  reset(); let res=await handler(request('POST',{},'not-a-JWT'));
  assert.equal(res.status,401);assert.equal(callCount,0);console.log('PASS: invalid/missing JWT rejected without downstream calls');
  reset();res=await handler(request('POST',{project_id:'bad',stakeholder_request_id:reqId}));
  assert.equal(res.status,400);assert.equal(callCount,0);console.log('PASS: invalid IDs rejected');
  reset();authIsValid=false;res=await handler(request());assert.equal(res.status,401);assert.equal(geminiCalls,0);console.log('PASS: Auth verifies JWT');
  reset();projectOwned=false;res=await handler(request());assert.equal(res.status,403);assert.equal(geminiCalls,0);console.log('PASS: cross-account project access blocked before Gemini');
  reset();requestOwned=false;res=await handler(request());assert.equal(res.status,403);assert.equal(geminiCalls,0);console.log('PASS: source-request access blocked before Gemini');
  reset();res=await handler(request());assert.equal(res.status,200);let response=await res.json();assert.equal(response.suggestion.item_type,'User Story');assert.equal(response.suggestion.priority,'High');assert.equal(geminiCalls,1);console.log('PASS: owner receives structured Gemini suggestion');
  reset();geminiStatus=429;res=await handler(request());assert.equal(res.status,429);console.log('PASS: free-tier rate-limit error handled');
  reset();geminiBody='{"title":"bad"}';res=await handler(request());assert.equal(res.status,502);console.log('PASS: incomplete Gemini output rejected');
  reset();res=await handler(request('POST',undefined,auth,'https://notallowed.example'));assert.equal(res.status,403);console.log('PASS: other origins blocked');
  reset();res=await handler(new Request('https://test.supabase.co/functions/v1/analyze-backlog',{method:'OPTIONS',headers:{origin:'http://localhost:8000'}}));assert.equal(res.status,204);assert.equal(res.headers.get('access-control-allow-origin'),'http://localhost:8000');console.log('PASS: CORS preflight');
  console.log('ALL PHASE 3 MOCK BACKEND TESTS PASSED. Real Gemini/Supabase not tested.');
}
test().catch(err=>{console.error(err);process.exitCode=1});
