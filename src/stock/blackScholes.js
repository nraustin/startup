import { erf } from 'mathjs';

function cdf(x) {
    return (1.0 + erf(x/Math.sqrt(2)))/2.0;
}

export function TTE(){
  const now = new Date();
  const marketClose = new Date(now);
  marketClose.setHours(14, 0, 0, 0); 

  let msUntilClose = marketClose - now;
  if (msUntilClose < 0) msUntilClose = 0;

  const minutesUntilClose = msUntilClose/(1000*60);
  const fractionOfDay = minutesUntilClose/1440; 

  return Math.max(fractionOfDay, 1/(24*60)); 
}
  

export function blackScholes(S, K, T, r, sigma) {
    const d1 = (Math.log(S/K) + (r + (sigma**2)/2)*T) / (sigma*Math.sqrt(T));
    const d2 = d1 - (sigma*Math.sqrt(T));
  
    const call = S*cdf(d1) - K*Math.exp(-r*T)*cdf(d2);
    const put = K*Math.exp(-r*T)*cdf(-d2) - S*cdf(-d1);
  
    return {call, put};
}