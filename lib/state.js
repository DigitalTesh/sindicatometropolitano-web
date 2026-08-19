import{list,put,del}from"@vercel/blob";import{DEFAULT_CONTENT}from"./default-data";import{encryptText,decryptText,passwordHash}from"./crypto";
const PATH="sindicato/system/state.json";
async function find(){const r=await list({prefix:PATH,limit:10});return r.blobs.find(b=>b.pathname===PATH)||null}
async function init(){const s={version:1,updatedAt:new Date().toISOString(),content:structuredClone(DEFAULT_CONTENT),auth:{encryptedPasswordHash:encryptText(passwordHash("demo1234"))}};await saveState(s);return s}
export async function loadState(){const b=await find();if(!b)return await init();const r=await fetch(b.url,{cache:"no-store"});if(!r.ok)throw new Error("No fue posible leer el estado desde Vercel Blob.");return await r.json()}
export async function saveState(s){s.updatedAt=new Date().toISOString();await put(PATH,JSON.stringify(s,null,2),{access:"public",contentType:"application/json",addRandomSuffix:false,allowOverwrite:true,cacheControlMaxAge:0});return s}
export function publicContent(s){return{...s.content,updatedAt:s.updatedAt}}
export function passwordMatches(s,p){return decryptText(s.auth.encryptedPasswordHash)===passwordHash(p)}
export async function changePassword(s,p){s.auth.encryptedPasswordHash=encryptText(passwordHash(p));await saveState(s)}
export async function deleteAsset(url){if(!url)return;try{await del(url)}catch{}}
