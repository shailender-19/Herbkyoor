import{c as o}from"./index-CiNzH1w3.js";import{r as t}from"./client-DF01jHDW.js";/**
 * @license lucide-react v1.48.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n={name:"send",size:24,node:[["path",{d:"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z",key:"1ffxy3"}],["path",{d:"m21.854 2.147-10.94 10.939",key:"12cjpa"}]]};n.node;const r=o(n);function i(e){return t("/contact/send.php",{method:"POST",body:JSON.stringify(e)}).then(()=>{})}function c(e){return t("/newsletter/subscribe.php",{method:"POST",body:JSON.stringify({email:e})}).then(()=>{})}export{r as S,i as a,c as s};
