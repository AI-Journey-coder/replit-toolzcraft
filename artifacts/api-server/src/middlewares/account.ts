import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db, usersTable } from '@workspace/db';
export async function requireAccount(req:Request,res:Response,next:NextFunction){
 if(!req.firebaseUser){res.status(401).json({message:'Authentication required'});return;}
 const [user]=await db.select().from(usersTable).where(eq(usersTable.firebaseUid,req.firebaseUser.uid)).limit(1);
 if(!user||user.disabled){res.status(403).json({message:'An active account is required'});return;}
 req.dbUser=user;next();
}
