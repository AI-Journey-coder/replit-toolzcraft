export function feetAndInches(totalInches:number){
  if(!Number.isFinite(totalInches)||Math.abs(totalInches)>1e12)throw new Error('Enter a finite length of at most one trillion inches for combined output.');
  const rounded=Math.round(Math.abs(totalInches)*10000)/10000;
  const feet=Math.floor(rounded/12),inches=Number((rounded-feet*12).toFixed(4));const sign=totalInches<0?'-':'';
  return {feet,inches,symbols:`${sign}${feet}' ${inches}"`,words:`${sign}${feet} ft ${inches} in`};
}
