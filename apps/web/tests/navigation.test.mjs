import test from 'node:test';
import assert from 'node:assert/strict';
import { safeReturn, isUuid } from '../lib/navigation.ts';
import { adminOrigin } from '../lib/site.ts';

const id='77777777-7777-4777-8777-777777777777';
test('sign-in preserves current gallery, lab and account destinations',()=>{
 for(const path of ['/', '/lab', '/creations', '/profile', `/meme/${id}`, '/creations?tab=saved', '/lab?mode=pic', `/lab?mode=pic&taste=${id}`, `/lab?mode=thought&draft=${id}`, `/lab?draft=${id}&mode=thought`]) assert.equal(safeReturn(path),path);
 assert.equal(safeReturn('/?mode=thought'),'/lab?mode=thought');
});
test('sign-in rejects retired routes and cannot cross the separate admin boundary',()=>{
 for(const path of ['/compare', `/runs/${id}`, '/members', '/upload', '/admin', `${adminOrigin}/admin`, '//evil.test', '/\\evil.test', '/%2f%2fevil.test', '/api/gallery', '/auth/callback', '/lab?next=https://evil.test']) assert.equal(safeReturn(path),'/');
 assert.equal(safeReturn(null),'/');
 assert.equal(new URL('/admin',adminOrigin).href,'https://funnyllm-admin.vercel.app/admin');
});
test('current meme and draft links validate identifiers without the comparison code',()=>{
 assert.equal(isUuid(id),true);
 for(const value of [null,'not-an-id','../../admin','77777777-7777-0777-0777-777777777777']) assert.equal(isUuid(value),false);
});
