import type { ProviderUsage } from './ai';
export async function recordProviderUsage(database:{query:Function},usage:ProviderUsage){
 await database.query('INSERT INTO ai_call_daily(day,provider,model,kind,outcome,calls,input_tokens,output_tokens,unknown_usage) VALUES(current_date,$1,$2,$3,$4,1,$5,$6,$7) ON CONFLICT(day,provider,model,kind,outcome) DO UPDATE SET calls=ai_call_daily.calls+1,input_tokens=ai_call_daily.input_tokens+excluded.input_tokens,output_tokens=ai_call_daily.output_tokens+excluded.output_tokens,unknown_usage=ai_call_daily.unknown_usage+excluded.unknown_usage',[(process.env.AI_PROVIDER||'gemini').toLowerCase(),usage.model,usage.kind,usage.outcome,usage.inputTokens??0,usage.outputTokens??0,usage.inputTokens===null||usage.outputTokens===null?1:0]);
}
