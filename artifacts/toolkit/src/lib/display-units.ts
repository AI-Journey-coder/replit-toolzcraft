export type DistanceUnit='km'|'mi';
export type FuelUnit='litre'|'us-gallon'|'imperial-gallon';
export const kmPerUnit=(unit:DistanceUnit)=>unit==='mi'?1.609344:1;
export const litresPerUnit=(unit:FuelUnit)=>unit==='us-gallon'?3.785411784:unit==='imperial-gallon'?4.54609:1;
// Internal values remain annual kilometres, km/litre, currency/litre and kWh/100km.
export function evDisplay(value:number,index:number,distance:DistanceUnit,fuel:FuelUnit){const d=kmPerUnit(distance),f=litresPerUnit(fuel);return index===2?value/365/d:index===3?value*f/d:index===4?value*f:index===5?value*d:value;}
export function evCanonical(value:number,index:number,distance:DistanceUnit,fuel:FuelUnit){return value/evDisplay(1,index,distance,fuel);}
export type DateFormat='dmy-text'|'mdy'|'dmy'|'iso';
export function preferredDate(date:Date,format:DateFormat){const d=String(date.getDate()).padStart(2,'0'),m=String(date.getMonth()+1).padStart(2,'0'),y=date.getFullYear();return format==='iso'?`${y}-${m}-${d}`:format==='mdy'?`${m}/${d}/${y}`:format==='dmy'?`${d}/${m}/${y}`:`${d} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][date.getMonth()]} ${y}`;}
